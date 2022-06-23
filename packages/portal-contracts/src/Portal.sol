// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;

import "btcmirror/interfaces/IBtcTxVerifier.sol";
import "openzeppelin-contracts/access/Ownable.sol";

//
//                                        #
//                                       # #
//                                      # # #
//                                     # # # #
//                                    # # # # #
//                                   # # # # # #
//                                  # # # # # # #
//                                 # # # # # # # #
//                                # # # # # # # # #
//                               # # # # # # # # # #
//                              # # # # # # # # # # #
//                                   # # # # # #
//                               +        #        +
//                                ++++         ++++
//                                  ++++++ ++++++
//                                    +++++++++
//                                      +++++
//                                        +
//

uint256 constant MAX_SATS = 21e6 * 1e8; // Max order size: 21m BTC
uint256 constant MAX_PRICE_WEI_PER_SAT = 1e18; // Max allowed price: 1sat = 1ETH

/**
 * @dev Each order represents a bid or ask.
 */
struct Order {
    /** @dev Market maker that created this bid or ask. */
    address maker;
    /** @dev Positive if buying ether (bid), negative if selling (ask). */
    int128 amountSats;
    /** @dev INVERSE price, in weis per sat. You're buying or selling weis.*/
    uint128 priceWeiPerSat;
    /** @dev Unused for bid. Bitcoin P2SH address for asks. */
    bytes20 scriptHash;
    /** @dev Unused for ask. Staked wei for bids. */
    uint256 stakedWei;
}

/**
 * @dev During an in-progress transaction, ether is held in escrow.
 */
struct Escrow {
    /** @dev Bitcoin P2SH address to which bitcoin must be sent. */
    bytes20 destScriptHash;
    /** @dev Bitcoin due, in satoshis. */
    uint128 amountSatsDue;
    /** @dev Due date, in Unix seconds. */
    uint128 deadline;
    /** @dev Ether held in escrow. */
    uint256 escrowWei;
    /** @dev If correct amount is paid to script hash, who gets the eth? */
    address successRecipient;
    /** @dev If deadline passes without proof of payment, who gets the eth? */
    address timeoutRecipient;
}

/** Implements a limit order book for trust-minimized BTC-ETH trades. */
contract Portal is Ownable {
    event OrderPlaced(
        uint256 orderID,
        int128 amountSats,
        uint128 priceWeiPerSat,
        uint256 makerStakedWei,
        address maker
    );

    event OrderCancelled(uint256 orderID);

    event OrderMatched(
        uint256 escrowID,
        uint256 orderID,
        int128 amountSats,
        uint128 priceWeiPerSat,
        uint256 takerStakedWei,
        address maker,
        address taker
    );

    event EscrowSettled(
        uint256 escrowID,
        uint256 amountSats,
        address ethDest,
        uint256 ethAmount
    );

    event EscrowSlashed(
        uint256 escrowID,
        uint256 escrowDeadline,
        address ethDest,
        uint256 ethAmount
    );

    event ParamUpdated(uint256 oldVal, uint256 newVal, string name);

    /**
     * @dev Required stake for buy transactions. If you promise to send X BTC to
     *      buy Y ETH, you have post some percentage of Y ETH, which you lose if
     *      you don't follow thru sending the Bitcoin. Same for bids.
     */
    uint256 public stakePercent;

    /** @dev Number of bitcoin confirmations required to settle a trade. */
    uint256 public minConfirmations;

    /** @dev Bitcoin light client. Reports block hashes, allowing tx proofs. */
    IBtcTxVerifier public btcVerifier;

    /** @dev Tracks all available liquidity (bids and asks). */
    mapping(uint256 => Order) public orderbook;

    /** @dev Tracks all pending transactions, by order ID. */
    mapping(uint256 => Escrow) public escrows;

    /** @dev Next order ID = number of orders so far + 1. */
    uint256 public nextOrderID;

    constructor(uint256 _stakePercent, IBtcTxVerifier _btcVerifier) {
        stakePercent = _stakePercent;
        btcVerifier = _btcVerifier;
        nextOrderID = 1;
        minConfirmations = 1;
    }

    /** @notice Owner-settable parameter. */
    function setStakePercent(uint256 _stakePercent) public onlyOwner {
        uint256 old = stakePercent;
        stakePercent = _stakePercent;
        emit ParamUpdated(old, stakePercent, "stakePercent");
    }

    /** @notice Owner-settable parameter. */
    function setMinConfirmations(uint256 _minConfirmations) public onlyOwner {
        uint256 old = minConfirmations;
        minConfirmations = _minConfirmations;
        emit ParamUpdated(old, minConfirmations, "minConfirmations");
    }

    /** @notice Owner-settable parameter. */
    function setBtcVerifier(IBtcTxVerifier _btcVerifier) public onlyOwner {
        uint160 old = uint160(address(btcVerifier));
        btcVerifier = _btcVerifier;
        emit ParamUpdated(old, uint160(address(btcVerifier)), "btcVerifier");
    }

    /**
     * @notice Posts a bid. By calling this function, you represent that you
     *         have a stated amount of bitcoin, and are willing to buy ether
     *         at the stated price. You must stake a percentage of the total
     *         eth value, which is returned after a successful transaction.
     */
    function postBid(uint256 amountSats, uint256 priceWeiPerSat)
        public
        payable
        returns (uint256 orderID)
    {
        // Validate order and stake amount.
        require(amountSats <= MAX_SATS, "Amount overflow");
        require(amountSats > 0, "Amount underflow");
        require(priceWeiPerSat <= MAX_PRICE_WEI_PER_SAT, "Price overflow");
        require(priceWeiPerSat > 0, "Price underflow");
        uint256 totalValueWei = amountSats * priceWeiPerSat;
        uint256 requiredStakeWei = (totalValueWei * stakePercent) / 100;
        require(msg.value == requiredStakeWei, "Incorrect stake");

        // Record order.
        orderID = nextOrderID++;
        Order storage o = orderbook[orderID];
        o.maker = msg.sender;
        o.amountSats = int128(uint128(amountSats));
        o.priceWeiPerSat = uint128(priceWeiPerSat);
        o.stakedWei = requiredStakeWei;

        emit OrderPlaced(
            orderID,
            o.amountSats,
            o.priceWeiPerSat,
            o.stakedWei,
            msg.sender
        );
    }

    /**
     * @notice Posts an ask. You send ether, which is now for sale at the stated
     *         price. To buy, a buyer sends bitcoin to the state P2SH address.
     */
    function postAsk(
        uint256 amountSats,
        uint256 priceWeiPerSat,
        bytes20 scriptHash
    ) public payable returns (uint256 orderID) {
        require(priceWeiPerSat <= MAX_PRICE_WEI_PER_SAT, "Price overflow");
        require(priceWeiPerSat > 0, "Price underflow");
        require(amountSats <= MAX_SATS, "Amount overflow");
        require(amountSats > 0, "Amount underflow");
        require(amountSats * priceWeiPerSat == msg.value, "Wrong payment");

        // Record order.
        orderID = nextOrderID++;
        Order storage o = orderbook[orderID];
        o.maker = msg.sender;
        o.amountSats = -int128(uint128(amountSats));
        o.priceWeiPerSat = uint128(priceWeiPerSat);
        o.scriptHash = scriptHash;

        emit OrderPlaced(
            orderID,
            o.amountSats,
            o.priceWeiPerSat,
            0,
            msg.sender
        );
    }

    function cancelOrder(uint256 orderID) public {
        Order storage o = orderbook[orderID];

        require(o.amountSats != 0, "Order not found");
        require(msg.sender == o.maker, "Order not yours");

        uint256 weiToSend;
        if (o.amountSats > 0) {
            // Bid, return stake
            weiToSend = o.stakedWei;
        } else {
            // Ask, return liquidity
            weiToSend = uint256(uint128(-o.amountSats) * o.priceWeiPerSat);
        }

        emit OrderCancelled(orderID);

        // Delete order now. Prevent reentrancy issues.
        delete orderbook[orderID];

        (bool success, ) = msg.sender.call{value: weiToSend}("");
        require(success, "Transfer failed");
    }

    /** @notice Buy ether, posting stake and promising to send bitcoin. */
    function initiateBuy(uint256 orderID, uint128 amountSats)
        public
        payable
        returns (uint256 escrowID)
    {
        // Orders can only be filled in their entirety, for now.
        // This means escrows are 1:1 with orders.
        // TODO: allow partial fills?
        escrowID = orderID * 1e9;

        Order storage o = orderbook[orderID];
        require(o.amountSats < 0, "Order already filled");
        require(-o.amountSats == int128(amountSats), "Amount incorrect");

        // Verify correct stake amount.
        uint256 totalWei = uint256(amountSats) * uint256(o.priceWeiPerSat);
        uint256 expectedStakeWei = (totalWei * stakePercent) / 100;
        require(msg.value == expectedStakeWei, "Wrong payment");

        // Put the COMBINED eth (buyer's stake + the order amount) into escrow.
        Escrow storage e = escrows[escrowID];
        e.destScriptHash = o.scriptHash;
        e.amountSatsDue = amountSats;
        e.deadline = uint128(block.timestamp + 24 hours);
        e.escrowWei = totalWei + msg.value;
        e.successRecipient = msg.sender;
        e.timeoutRecipient = o.maker;

        // Order matched and filled.
        emit OrderMatched(
            escrowID,
            orderID,
            o.amountSats,
            o.priceWeiPerSat,
            expectedStakeWei,
            o.maker,
            msg.sender
        );

        delete orderbook[orderID];
    }

    /** @notice Sell ether, receive bitcoin. */
    function initiateSell(
        uint256 orderID,
        uint128 amountSats,
        bytes20 destScriptHash
    ) public payable returns (uint256 escrowID) {
        escrowID = orderID * 1e9;
        Order storage o = orderbook[orderID];
        require(o.amountSats > 0, "Order already filled"); // Must be a bid
        require(o.amountSats == int128(amountSats), "Amount incorrect");
        require(msg.value == amountSats * o.priceWeiPerSat, "Wrong payment");

        // Put the COMBINED eth--the value being sold, plus the liquidity
        // maker's stake--into escrow. If the maker sends bitcoin as
        // expected and provides proof, they get both (stake back + proceeds).
        // If maker fails to deliver, they're slashed and seller gets both.
        Escrow storage e = escrows[escrowID];
        e.destScriptHash = destScriptHash;
        e.amountSatsDue = amountSats;
        e.deadline = uint128(block.timestamp + 24 hours);
        e.escrowWei = o.stakedWei + msg.value;
        e.successRecipient = o.maker;
        e.timeoutRecipient = msg.sender;

        // Order matched and filled.
        emit OrderMatched(
            escrowID,
            orderID,
            o.amountSats,
            o.priceWeiPerSat,
            0,
            o.maker,
            msg.sender
        );

        delete orderbook[orderID];
    }

    /** @notice The bidder proves they've sent bitcoin, completing the sale. */
    function proveSettlement(
        uint256 escrowID,
        uint256 bitcoinBlockNum,
        BtcTxProof calldata bitcoinTransactionProof,
        uint256 txOutIx
    ) public {
        Escrow storage e = escrows[escrowID];
        require(e.successRecipient != address(0), "Escrow not found");
        require(msg.sender == e.successRecipient, "Wrong caller");

        bool valid = btcVerifier.verifyPayment(
            minConfirmations,
            bitcoinBlockNum,
            bitcoinTransactionProof,
            txOutIx,
            e.destScriptHash,
            uint256(e.amountSatsDue)
        );
        require(valid, "Bad bitcoin transaction");

        uint256 weiToSend = e.escrowWei;

        emit EscrowSettled(escrowID, e.amountSatsDue, msg.sender, weiToSend);

        delete escrows[escrowID];

        (bool success, ) = msg.sender.call{value: weiToSend}("");
        require(success, "Transfer failed");
    }

    function slash(uint256 escrowID) public {
        Escrow storage e = escrows[escrowID];

        require(msg.sender == e.timeoutRecipient, "Wrong caller");
        require(e.deadline < block.timestamp, "Too early");

        uint256 weiToSend = e.escrowWei;
        emit EscrowSlashed(escrowID, e.deadline, msg.sender, weiToSend);

        delete escrows[escrowID];

        (bool success, ) = msg.sender.call{value: weiToSend}("");
        require(success, "Transfer failed");
    }
}
