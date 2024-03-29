// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;

import "btcmirror/interfaces/IBtcTxVerifier.sol";
import "solmate/auth/Owned.sol";
import "solmate/tokens/ERC20.sol";

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

/**
 * @dev Max order size: 21m BTC. That should be enough for now ;)
 */
uint256 constant MAX_SATS = 21e6 * 1e8;
/**
 * @dev Max allowed price: 1sat = 1 token. See priceTps below for "TPS" details.
 */
uint256 constant MAX_PRICE_TPS = 1e18;

/**
 * @dev Each order represents a bid or ask.
 */
struct Order {
    /**
     * @dev Market maker that created this bid or ask.
     */
    address maker;
    /**
     * @dev Positive if selling bitcoin (ask), negative if buying (bid).
     */
    int128 amountSats;
    /**
     * @dev Price, in (10^-18 token) per sat, regardless of token.decimals().
     * Equivalently, price in tokens per bitcoin, in 10-decimal fixed point.
     */
    uint128 priceTps;
    /**
     * @dev Unused for ask. Bitcoin P2SH address for bid.
     */
    bytes20 scriptHash;
    /**
     * @dev Unused for bid. Staked token amount for asks, in token units.
     */
    uint256 stakedTok;
}

/**
 * @dev After each trade, tokens are held in escrow pendings BTC settlement.
 */
struct Escrow {
    /**
     * @dev Bitcoin P2SH address to which bitcoin must be sent.
     */
    bytes20 destScriptHash;
    /**
     * @dev Bitcoin due, in satoshis. This precise amount must be paid.
     */
    uint128 amountSatsDue;
    /**
     * @dev Due date, in Unix seconds.
     */
    uint128 deadline;
    /**
     * @dev Token units held in escrow.
     */
    uint256 escrowTok;
    /**
     * @dev If correct amount is paid to script hash, who keeps the escrow?
     */
    address successRecipient;
    /**
     * @dev If deadline passes without proof of payment, who keeps escrow?
     */
    address timeoutRecipient;
}

/**
 * @notice Implements a limit order book for trust-minimized BTC-ETH trades.
 */
contract Portal is Owned {
    event OrderPlaced(
        uint256 orderID,
        int128 amountSats,
        uint128 priceTps,
        uint256 makerStakedTok,
        address maker
    );

    event OrderCancelled(uint256 orderID);

    event OrderMatched(
        uint256 escrowID,
        uint256 orderID,
        int128 amountSats,
        int128 amountSatsFilled,
        uint128 priceTps,
        uint256 takerStakedTok,
        uint128 deadline,
        address maker,
        address taker,
        bytes20 destScriptHash
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
     * @dev The token we are trading for BTC, or address(0) for ETH.
     */
    ERC20 public immutable token;

    /**
     * @dev How many 1e-18 "wei" per unit. 1 for ETH/WETH, 1e10 for WBTC.
     */
    uint256 public immutable tokDiv;

    /**
     * @dev Bitcoin light client. Reports block hashes, verifies tx proofs.
     */
    IBtcTxVerifier public immutable btcVerifier;

    /**
     * @dev Number of bitcoin confirmations required to settle a trade.
     */
    uint256 public immutable minConfirmations;

    /**
     * @dev Required stake for buy transactions. If you promise to send X BTC to
     * buy Y ETH, you have post some percentage of Y ETH, which you lose if
     * you don't follow thru sending the Bitcoin. Same for bids.
     */
    uint256 public stakePercent;

    /**
     * @dev Minimum order size, in satoshis.
     */
    uint256 public minOrderSats;

    /**
     * @dev Price tick, in (10^-18 tokens) per satoshi = (10^-10 tokens / BTC).
     * All order prices must be a multiple of tickTps.
     */
    uint256 public tickTps;

    /**
     * @dev Tracks all available liquidity (bids and asks), by order ID.
     */
    mapping(uint256 => Order) public orderbook;

    /**
     * @dev Tracks all pending BTC settlement transactions, by escrow ID.
     */
    mapping(uint256 => Escrow) public escrows;

    /**
     * @dev Next order ID = number of orders so far + 1.
     */
    uint256 public nextOrderID;

    /**
     * @dev Next escrow ID = number of fills so far + 1.
     */
    uint256 public nextEscrowID;

    /**
     * @dev Tracks in-flight escrows, and where we expect payments to come from.
     * Prevents using a single btc payment proof to close multiple escrows.
     *
     * Key is keccak(destScriptHash, amountSats), and the value is the minimum
     * BtcMirror block height at which this escrow may be settled.
     *
     * This means that no two open escrows can have an identical destination and
     * amount. If an older (closed) escrow exists, the block height prevents
     * proof re-use.
     */
    mapping(bytes32 => uint256) public openEscrows;

    constructor(
        ERC20 _token,
        uint256 _stakePercent,
        IBtcTxVerifier _btcVerifier,
        uint256 _minConfirmations
    ) Owned(msg.sender) {
        // Immutable
        token = _token;
        uint256 dec = 18;
        if (address(_token) != address(0)) {
            dec = _token.decimals();
        }
        require(dec <= 18, "Tokens over 18 decimals unsupported");
        tokDiv = 10**(18 - dec);
        btcVerifier = _btcVerifier;
        minConfirmations = _minConfirmations;

        // Mutable
        minOrderSats = 100_000; // 0.001 BTC
        tickTps = 1e6; // 0.0001 tokens per bitcoin

        stakePercent = _stakePercent;

        nextOrderID = 1;
        nextEscrowID = 1;
    }

    /**
     * @notice Owner-settable parameter.
     */
    function setStakePercent(uint256 _stakePercent) public onlyOwner {
        uint256 old = stakePercent;
        stakePercent = _stakePercent;
        emit ParamUpdated(old, stakePercent, "stakePercent");
    }

    /**
     * @notice Owner-settable parameter.
     */
    function setMinOrderSats(uint256 _minOrderSats) public onlyOwner {
        uint256 old = minOrderSats;
        minOrderSats = _minOrderSats;
        emit ParamUpdated(old, minOrderSats, "minOrderSats");
    }

    /**
     * @notice Owner-settable parameter.
     */
    function setTickTps(uint256 _tickTps) public onlyOwner {
        uint256 old = tickTps;
        tickTps = _tickTps;
        emit ParamUpdated(old, tickTps, "tickTps");
    }

    modifier validAmount(uint256 amountSats) {
        require(amountSats <= MAX_SATS, "Amount overflow");
        require(amountSats > 0, "Amount underflow");
        require(amountSats % minOrderSats == 0, "Non-round amount");
        _;
    }

    modifier validPrice(uint256 priceTps) {
        require(priceTps <= MAX_PRICE_TPS, "Price overflow");
        require(priceTps > 0, "Price underflow");
        require(priceTps % tickTps == 0, "Price not divisible by tick");
        _;
    }

    /**
     * @notice Posts an ask, offering to sell bitcoin for tokens.
     */
    function postAsk(uint256 amountSats, uint256 priceTps)
        public
        payable
        validAmount(amountSats)
        validPrice(priceTps)
        returns (uint256 orderID)
    {
        uint256 totalValueTok = (amountSats * priceTps) / tokDiv;
        uint256 requiredStakeTok = (totalValueTok * stakePercent) / 100;
        require(requiredStakeTok < 2**128, "Stake must be < 2**128");

        // Receive stake amount
        _transferFromSender(requiredStakeTok);

        // Record order.
        orderID = nextOrderID++;
        Order storage o = orderbook[orderID];
        o.maker = msg.sender;
        o.amountSats = int128(uint128(amountSats));
        o.priceTps = uint128(priceTps);
        o.stakedTok = requiredStakeTok;

        emit OrderPlaced(
            orderID,
            o.amountSats,
            o.priceTps,
            o.stakedTok,
            msg.sender
        );
    }

    /**
     * @notice Posts a bid. You send ether, which is now for sale at the stated
     * price. To buy, a buyer sends bitcoin to the state P2SH address.
     */
    function postBid(
        uint256 amountSats,
        uint256 priceTps,
        bytes20 scriptHash
    )
        public
        payable
        validAmount(amountSats)
        validPrice(priceTps)
        returns (uint256 orderID)
    {
        // Receive payment
        uint256 totalValueTok = (amountSats * priceTps) / tokDiv;
        _transferFromSender(totalValueTok);

        // Record order.
        orderID = nextOrderID++;
        Order storage o = orderbook[orderID];
        o.maker = msg.sender;
        o.amountSats = -int128(uint128(amountSats));
        o.priceTps = uint128(priceTps);
        o.scriptHash = scriptHash;

        emit OrderPlaced(orderID, o.amountSats, o.priceTps, 0, msg.sender);
    }

    function cancelOrder(uint256 orderID) public {
        Order storage o = orderbook[orderID];

        require(o.amountSats != 0, "Order not found");
        require(msg.sender == o.maker, "Order not yours");

        uint256 tokToSend;
        if (o.amountSats > 0) {
            // Ask, return stake
            tokToSend = o.stakedTok;
        } else {
            // Bid, return liquidity
            tokToSend = uint256(uint128(-o.amountSats) * o.priceTps) / tokDiv;
        }

        emit OrderCancelled(orderID);

        // Delete order now. Prevent reentrancy issues.
        delete orderbook[orderID];

        _transferToSender(tokToSend);
    }

    /**
     * @notice Sell BTC receive ERC-20.
     */
    function initiateSell(uint256 orderID, uint128 amountSats)
        public
        payable
        returns (uint256 escrowID)
    {
        escrowID = nextEscrowID++;

        Order storage o = orderbook[orderID];
        require(o.amountSats < 0, "Order already filled");
        require(amountSats <= uint128(-o.amountSats), "Amount incorrect");
        require(amountSats % minOrderSats == 0, "Odd-sized amount");

        // Verify correct stake amount.
        uint256 totalTok = (uint256(amountSats) * uint256(o.priceTps)) / tokDiv;
        uint256 expectedStakeTok = (totalTok * stakePercent) / 100;

        // Receive stake. Validates that msg.value == expectedStateTok (for ether based payments)
        _transferFromSender(expectedStakeTok);

        // Put the COMBINED eth (buyer's stake + the order amount) into escrow.
        Escrow storage e = escrows[escrowID];
        e.destScriptHash = o.scriptHash;
        e.amountSatsDue = amountSats;
        e.deadline = uint128(block.timestamp + 24 hours);
        e.escrowTok = totalTok + expectedStakeTok;
        e.successRecipient = msg.sender;
        e.timeoutRecipient = o.maker;

        // Order matched.
        emit OrderMatched(
            escrowID,
            orderID,
            o.amountSats,
            int128(amountSats),
            o.priceTps,
            expectedStakeTok,
            e.deadline,
            o.maker,
            msg.sender,
            o.scriptHash
        );

        // Update the amount of liquidity in this order
        o.amountSats += int128(amountSats);

        // Delete the order if there is no more liquidity left
        if (o.amountSats == 0) {
            delete orderbook[orderID];
        }

        addOpenEscrow(e.destScriptHash, amountSats);
    }

    /**
     * @notice Buy bitcoin, paying via ERC-20
     */
    function initiateBuy(
        uint256 orderID,
        uint128 amountSats,
        bytes20 destScriptHash
    ) public payable returns (uint256 escrowID) {
        escrowID = nextEscrowID++;
        Order storage o = orderbook[orderID];
        require(o.amountSats > 0, "Order already filled"); // Must be a bid
        require(o.amountSats >= int128(amountSats), "Amount incorrect");
        require(amountSats % minOrderSats == 0, "Odd-sized amount");

        uint256 totalValue = (amountSats * o.priceTps) / tokDiv;
        uint256 portionOfStake = (o.stakedTok * uint256(amountSats)) /
            uint256(uint128(o.amountSats));

        // Receive sale payment
        _transferFromSender(totalValue);

        // Put the COMBINED eth--the value being sold, plus the liquidity
        // maker's stake--into escrow. If the maker sends bitcoin as
        // expected and provides proof, they get both (stake back + proceeds).
        // If maker fails to deliver, they're slashed and seller gets both.
        Escrow storage e = escrows[escrowID];
        e.destScriptHash = destScriptHash;
        e.amountSatsDue = amountSats;
        e.deadline = uint128(block.timestamp + 24 hours);
        e.escrowTok = portionOfStake + totalValue;
        e.successRecipient = o.maker;
        e.timeoutRecipient = msg.sender;

        // Order matched.
        emit OrderMatched(
            escrowID,
            orderID,
            o.amountSats,
            int128(amountSats),
            o.priceTps,
            0,
            e.deadline,
            o.maker,
            msg.sender,
            destScriptHash
        );

        o.amountSats -= int128(amountSats);
        o.stakedTok -= portionOfStake;

        // Delete the order if its been filled.
        if (o.amountSats == 0) {
            delete orderbook[orderID];
        }

        addOpenEscrow(destScriptHash, amountSats);
    }

    /**
     * @notice Seller proves they've sent bitcoin, completing the sale.
     */
    function proveSettlement(
        uint256 escrowID,
        uint256 bitcoinBlockNum,
        BtcTxProof calldata bitcoinTransactionProof,
        uint256 txOutIx
    ) public {
        Escrow storage e = escrows[escrowID];
        require(e.successRecipient != address(0), "Escrow not found");
        require(msg.sender == e.successRecipient, "Wrong caller");

        // The blockheight of the proof must be > this value.
        bytes32 recKey = openEscrowKey(e.destScriptHash, e.amountSatsDue);
        uint256 minBlockHeightExclusive = openEscrows[recKey];
        require(
            bitcoinBlockNum > minBlockHeightExclusive,
            "Can't use old proof of payment"
        );

        bool valid = btcVerifier.verifyPayment(
            minConfirmations,
            bitcoinBlockNum,
            bitcoinTransactionProof,
            txOutIx,
            e.destScriptHash,
            uint256(e.amountSatsDue)
        );
        require(valid, "Bad bitcoin transaction");

        uint256 tokToSend = e.escrowTok;

        emit EscrowSettled(escrowID, e.amountSatsDue, msg.sender, tokToSend);

        delete escrows[escrowID];
        _transferToSender(tokToSend);

        // Delete the openEscrow key after the _transfer, since it blocks new actions from happening
        // in case of a re-entrancy attack. We'd rather fail closed, than open.
        delete openEscrows[recKey];
    }

    function slash(uint256 escrowID) public {
        Escrow storage e = escrows[escrowID];

        require(msg.sender == e.timeoutRecipient, "Wrong caller");
        require(e.deadline < block.timestamp, "Too early");

        uint256 tokToSend = e.escrowTok;
        emit EscrowSlashed(escrowID, e.deadline, msg.sender, tokToSend);

        delete escrows[escrowID];

        _transferToSender(tokToSend);

        // Delete the openEscrow key after the _transfer, since it blocks new actions from happening
        // in case of a re-entrancy attack. We'd rather fail closed, than open.
        delete openEscrows[openEscrowKey(e.destScriptHash, e.amountSatsDue)];
    }

    function _transferFromSender(uint256 tok) private {
        if (address(token) == address(0)) {
            // Receive wei
            require(msg.value == tok, "Wrong payment");
            return;
        }

        bool success = token.transferFrom(msg.sender, address(this), tok);
        require(success, "transferFrom failed");
    }

    function _transferToSender(uint256 tok) private {
        if (address(token) == address(0)) {
            // Send wei
            (bool suc, ) = msg.sender.call{value: tok}(hex"");
            require(suc, "Send failed");
            return;
        }

        bool success = token.transfer(msg.sender, tok);
        require(success, "transfer failed");
    }

    function openEscrowKey(bytes20 scriptHash, uint256 amountSats)
        public
        pure
        returns (bytes32)
    {
        return keccak256(abi.encode(scriptHash, amountSats));
    }

    function addOpenEscrow(bytes20 scriptHash, uint256 amountSats) private {
        bytes32 recKey = openEscrowKey(scriptHash, amountSats);
        uint256 existingOpenEscrow = openEscrows[recKey];
        require(existingOpenEscrow == 0, "Escrow collision, please retry");
        // Say Alice opens an escrow at block height 1000. She submits a Bitcoin transaction.
        // A normal two-block reorg occurs, and her transaction ends up confirmed at block height 999.
        openEscrows[recKey] =
            btcVerifier.mirror().getLatestBlockHeight() -
            minConfirmations;
    }

    // Returns true if there is an escrow inflight for this
    // scriptHash/amountSats pair, otherwise false.
    function openEscrowInflight(bytes20 scriptHash, uint256 amountSats)
        public
        view
        returns (bool)
    {
        uint256 n = openEscrows[openEscrowKey(scriptHash, amountSats)];
        return n != 0;
    }
}
