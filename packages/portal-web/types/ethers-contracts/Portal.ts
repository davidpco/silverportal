/* Autogenerated file. Do not edit manually. */
/* tslint:disable */
/* eslint-disable */
import type {
  BaseContract,
  BigNumber,
  BigNumberish,
  BytesLike,
  CallOverrides,
  ContractTransaction,
  Overrides,
  PayableOverrides,
  PopulatedTransaction,
  Signer,
  utils,
} from "ethers";
import type {
  FunctionFragment,
  Result,
  EventFragment,
} from "@ethersproject/abi";
import type { Listener, Provider } from "@ethersproject/providers";
import type {
  TypedEventFilter,
  TypedEvent,
  TypedListener,
  OnEvent,
  PromiseOrValue,
} from "./common";

export type BtcTxProofStruct = {
  blockHeader: PromiseOrValue<BytesLike>;
  txId: PromiseOrValue<BytesLike>;
  txIndex: PromiseOrValue<BigNumberish>;
  txMerkleProof: PromiseOrValue<BytesLike>;
  rawTx: PromiseOrValue<BytesLike>;
};

export type BtcTxProofStructOutput = [
  string,
  string,
  BigNumber,
  string,
  string
] & {
  blockHeader: string;
  txId: string;
  txIndex: BigNumber;
  txMerkleProof: string;
  rawTx: string;
};

export interface PortalInterface extends utils.Interface {
  functions: {
    "btcVerifier()": FunctionFragment;
    "cancelOrder(uint256)": FunctionFragment;
    "escrows(uint256)": FunctionFragment;
    "initiateBuy(uint256,uint128)": FunctionFragment;
    "initiateSell(uint256,uint128,bytes20)": FunctionFragment;
    "nextOrderID()": FunctionFragment;
    "orderbook(uint256)": FunctionFragment;
    "postAsk(uint256,bytes20)": FunctionFragment;
    "postBid(uint256,uint256)": FunctionFragment;
    "proveSettlement(uint256,uint256,(bytes,bytes32,uint256,bytes,bytes),uint256)": FunctionFragment;
    "slash(uint256)": FunctionFragment;
    "stakePercent()": FunctionFragment;
  };

  getFunction(
    nameOrSignatureOrTopic:
      | "btcVerifier"
      | "cancelOrder"
      | "escrows"
      | "initiateBuy"
      | "initiateSell"
      | "nextOrderID"
      | "orderbook"
      | "postAsk"
      | "postBid"
      | "proveSettlement"
      | "slash"
      | "stakePercent"
  ): FunctionFragment;

  encodeFunctionData(
    functionFragment: "btcVerifier",
    values?: undefined
  ): string;
  encodeFunctionData(
    functionFragment: "cancelOrder",
    values: [PromiseOrValue<BigNumberish>]
  ): string;
  encodeFunctionData(
    functionFragment: "escrows",
    values: [PromiseOrValue<BigNumberish>]
  ): string;
  encodeFunctionData(
    functionFragment: "initiateBuy",
    values: [PromiseOrValue<BigNumberish>, PromiseOrValue<BigNumberish>]
  ): string;
  encodeFunctionData(
    functionFragment: "initiateSell",
    values: [
      PromiseOrValue<BigNumberish>,
      PromiseOrValue<BigNumberish>,
      PromiseOrValue<BytesLike>
    ]
  ): string;
  encodeFunctionData(
    functionFragment: "nextOrderID",
    values?: undefined
  ): string;
  encodeFunctionData(
    functionFragment: "orderbook",
    values: [PromiseOrValue<BigNumberish>]
  ): string;
  encodeFunctionData(
    functionFragment: "postAsk",
    values: [PromiseOrValue<BigNumberish>, PromiseOrValue<BytesLike>]
  ): string;
  encodeFunctionData(
    functionFragment: "postBid",
    values: [PromiseOrValue<BigNumberish>, PromiseOrValue<BigNumberish>]
  ): string;
  encodeFunctionData(
    functionFragment: "proveSettlement",
    values: [
      PromiseOrValue<BigNumberish>,
      PromiseOrValue<BigNumberish>,
      BtcTxProofStruct,
      PromiseOrValue<BigNumberish>
    ]
  ): string;
  encodeFunctionData(
    functionFragment: "slash",
    values: [PromiseOrValue<BigNumberish>]
  ): string;
  encodeFunctionData(
    functionFragment: "stakePercent",
    values?: undefined
  ): string;

  decodeFunctionResult(
    functionFragment: "btcVerifier",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "cancelOrder",
    data: BytesLike
  ): Result;
  decodeFunctionResult(functionFragment: "escrows", data: BytesLike): Result;
  decodeFunctionResult(
    functionFragment: "initiateBuy",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "initiateSell",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "nextOrderID",
    data: BytesLike
  ): Result;
  decodeFunctionResult(functionFragment: "orderbook", data: BytesLike): Result;
  decodeFunctionResult(functionFragment: "postAsk", data: BytesLike): Result;
  decodeFunctionResult(functionFragment: "postBid", data: BytesLike): Result;
  decodeFunctionResult(
    functionFragment: "proveSettlement",
    data: BytesLike
  ): Result;
  decodeFunctionResult(functionFragment: "slash", data: BytesLike): Result;
  decodeFunctionResult(
    functionFragment: "stakePercent",
    data: BytesLike
  ): Result;

  events: {
    "EscrowSettled(uint256,uint256,address,uint256)": EventFragment;
    "EscrowSlashed(uint256,uint256,address,uint256)": EventFragment;
    "OrderCancelled(uint256)": EventFragment;
    "OrderMatched(uint256,uint256,int128,uint128,uint256,address,address)": EventFragment;
    "OrderPlaced(uint256,int128,uint128,uint256,address)": EventFragment;
  };

  getEvent(nameOrSignatureOrTopic: "EscrowSettled"): EventFragment;
  getEvent(nameOrSignatureOrTopic: "EscrowSlashed"): EventFragment;
  getEvent(nameOrSignatureOrTopic: "OrderCancelled"): EventFragment;
  getEvent(nameOrSignatureOrTopic: "OrderMatched"): EventFragment;
  getEvent(nameOrSignatureOrTopic: "OrderPlaced"): EventFragment;
}

export interface EscrowSettledEventObject {
  escrowID: BigNumber;
  amountSats: BigNumber;
  ethDest: string;
  ethAmount: BigNumber;
}
export type EscrowSettledEvent = TypedEvent<
  [BigNumber, BigNumber, string, BigNumber],
  EscrowSettledEventObject
>;

export type EscrowSettledEventFilter = TypedEventFilter<EscrowSettledEvent>;

export interface EscrowSlashedEventObject {
  escrowID: BigNumber;
  escrowDeadline: BigNumber;
  ethDest: string;
  ethAmount: BigNumber;
}
export type EscrowSlashedEvent = TypedEvent<
  [BigNumber, BigNumber, string, BigNumber],
  EscrowSlashedEventObject
>;

export type EscrowSlashedEventFilter = TypedEventFilter<EscrowSlashedEvent>;

export interface OrderCancelledEventObject {
  orderID: BigNumber;
}
export type OrderCancelledEvent = TypedEvent<
  [BigNumber],
  OrderCancelledEventObject
>;

export type OrderCancelledEventFilter = TypedEventFilter<OrderCancelledEvent>;

export interface OrderMatchedEventObject {
  escrowID: BigNumber;
  orderID: BigNumber;
  amountSats: BigNumber;
  priceWeiPerSat: BigNumber;
  takerStakedWei: BigNumber;
  maker: string;
  taker: string;
}
export type OrderMatchedEvent = TypedEvent<
  [BigNumber, BigNumber, BigNumber, BigNumber, BigNumber, string, string],
  OrderMatchedEventObject
>;

export type OrderMatchedEventFilter = TypedEventFilter<OrderMatchedEvent>;

export interface OrderPlacedEventObject {
  orderID: BigNumber;
  amountSats: BigNumber;
  priceWeiPerSat: BigNumber;
  makerStakedWei: BigNumber;
  maker: string;
}
export type OrderPlacedEvent = TypedEvent<
  [BigNumber, BigNumber, BigNumber, BigNumber, string],
  OrderPlacedEventObject
>;

export type OrderPlacedEventFilter = TypedEventFilter<OrderPlacedEvent>;

export interface Portal extends BaseContract {
  connect(signerOrProvider: Signer | Provider | string): this;
  attach(addressOrName: string): this;
  deployed(): Promise<this>;

  interface: PortalInterface;

  queryFilter<TEvent extends TypedEvent>(
    event: TypedEventFilter<TEvent>,
    fromBlockOrBlockhash?: string | number | undefined,
    toBlock?: string | number | undefined
  ): Promise<Array<TEvent>>;

  listeners<TEvent extends TypedEvent>(
    eventFilter?: TypedEventFilter<TEvent>
  ): Array<TypedListener<TEvent>>;
  listeners(eventName?: string): Array<Listener>;
  removeAllListeners<TEvent extends TypedEvent>(
    eventFilter: TypedEventFilter<TEvent>
  ): this;
  removeAllListeners(eventName?: string): this;
  off: OnEvent<this>;
  on: OnEvent<this>;
  once: OnEvent<this>;
  removeListener: OnEvent<this>;

  functions: {
    btcVerifier(overrides?: CallOverrides): Promise<[string]>;

    cancelOrder(
      orderID: PromiseOrValue<BigNumberish>,
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<ContractTransaction>;

    escrows(
      arg0: PromiseOrValue<BigNumberish>,
      overrides?: CallOverrides
    ): Promise<
      [string, BigNumber, BigNumber, BigNumber, string, string] & {
        destScriptHash: string;
        amountSatsDue: BigNumber;
        deadline: BigNumber;
        escrowWei: BigNumber;
        successRecipient: string;
        timeoutRecipient: string;
      }
    >;

    initiateBuy(
      orderID: PromiseOrValue<BigNumberish>,
      amountSats: PromiseOrValue<BigNumberish>,
      overrides?: PayableOverrides & { from?: PromiseOrValue<string> }
    ): Promise<ContractTransaction>;

    initiateSell(
      orderID: PromiseOrValue<BigNumberish>,
      amountSats: PromiseOrValue<BigNumberish>,
      destScriptHash: PromiseOrValue<BytesLike>,
      overrides?: PayableOverrides & { from?: PromiseOrValue<string> }
    ): Promise<ContractTransaction>;

    nextOrderID(overrides?: CallOverrides): Promise<[BigNumber]>;

    orderbook(
      arg0: PromiseOrValue<BigNumberish>,
      overrides?: CallOverrides
    ): Promise<
      [string, BigNumber, BigNumber, string, BigNumber] & {
        maker: string;
        amountSats: BigNumber;
        priceWeiPerSat: BigNumber;
        scriptHash: string;
        stakedWei: BigNumber;
      }
    >;

    postAsk(
      priceWeiPerSat: PromiseOrValue<BigNumberish>,
      scriptHash: PromiseOrValue<BytesLike>,
      overrides?: PayableOverrides & { from?: PromiseOrValue<string> }
    ): Promise<ContractTransaction>;

    postBid(
      amountSats: PromiseOrValue<BigNumberish>,
      priceWeiPerSat: PromiseOrValue<BigNumberish>,
      overrides?: PayableOverrides & { from?: PromiseOrValue<string> }
    ): Promise<ContractTransaction>;

    proveSettlement(
      escrowID: PromiseOrValue<BigNumberish>,
      bitcoinBlockNum: PromiseOrValue<BigNumberish>,
      bitcoinTransactionProof: BtcTxProofStruct,
      txOutIx: PromiseOrValue<BigNumberish>,
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<ContractTransaction>;

    slash(
      escrowID: PromiseOrValue<BigNumberish>,
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<ContractTransaction>;

    stakePercent(overrides?: CallOverrides): Promise<[BigNumber]>;
  };

  btcVerifier(overrides?: CallOverrides): Promise<string>;

  cancelOrder(
    orderID: PromiseOrValue<BigNumberish>,
    overrides?: Overrides & { from?: PromiseOrValue<string> }
  ): Promise<ContractTransaction>;

  escrows(
    arg0: PromiseOrValue<BigNumberish>,
    overrides?: CallOverrides
  ): Promise<
    [string, BigNumber, BigNumber, BigNumber, string, string] & {
      destScriptHash: string;
      amountSatsDue: BigNumber;
      deadline: BigNumber;
      escrowWei: BigNumber;
      successRecipient: string;
      timeoutRecipient: string;
    }
  >;

  initiateBuy(
    orderID: PromiseOrValue<BigNumberish>,
    amountSats: PromiseOrValue<BigNumberish>,
    overrides?: PayableOverrides & { from?: PromiseOrValue<string> }
  ): Promise<ContractTransaction>;

  initiateSell(
    orderID: PromiseOrValue<BigNumberish>,
    amountSats: PromiseOrValue<BigNumberish>,
    destScriptHash: PromiseOrValue<BytesLike>,
    overrides?: PayableOverrides & { from?: PromiseOrValue<string> }
  ): Promise<ContractTransaction>;

  nextOrderID(overrides?: CallOverrides): Promise<BigNumber>;

  orderbook(
    arg0: PromiseOrValue<BigNumberish>,
    overrides?: CallOverrides
  ): Promise<
    [string, BigNumber, BigNumber, string, BigNumber] & {
      maker: string;
      amountSats: BigNumber;
      priceWeiPerSat: BigNumber;
      scriptHash: string;
      stakedWei: BigNumber;
    }
  >;

  postAsk(
    priceWeiPerSat: PromiseOrValue<BigNumberish>,
    scriptHash: PromiseOrValue<BytesLike>,
    overrides?: PayableOverrides & { from?: PromiseOrValue<string> }
  ): Promise<ContractTransaction>;

  postBid(
    amountSats: PromiseOrValue<BigNumberish>,
    priceWeiPerSat: PromiseOrValue<BigNumberish>,
    overrides?: PayableOverrides & { from?: PromiseOrValue<string> }
  ): Promise<ContractTransaction>;

  proveSettlement(
    escrowID: PromiseOrValue<BigNumberish>,
    bitcoinBlockNum: PromiseOrValue<BigNumberish>,
    bitcoinTransactionProof: BtcTxProofStruct,
    txOutIx: PromiseOrValue<BigNumberish>,
    overrides?: Overrides & { from?: PromiseOrValue<string> }
  ): Promise<ContractTransaction>;

  slash(
    escrowID: PromiseOrValue<BigNumberish>,
    overrides?: Overrides & { from?: PromiseOrValue<string> }
  ): Promise<ContractTransaction>;

  stakePercent(overrides?: CallOverrides): Promise<BigNumber>;

  callStatic: {
    btcVerifier(overrides?: CallOverrides): Promise<string>;

    cancelOrder(
      orderID: PromiseOrValue<BigNumberish>,
      overrides?: CallOverrides
    ): Promise<void>;

    escrows(
      arg0: PromiseOrValue<BigNumberish>,
      overrides?: CallOverrides
    ): Promise<
      [string, BigNumber, BigNumber, BigNumber, string, string] & {
        destScriptHash: string;
        amountSatsDue: BigNumber;
        deadline: BigNumber;
        escrowWei: BigNumber;
        successRecipient: string;
        timeoutRecipient: string;
      }
    >;

    initiateBuy(
      orderID: PromiseOrValue<BigNumberish>,
      amountSats: PromiseOrValue<BigNumberish>,
      overrides?: CallOverrides
    ): Promise<BigNumber>;

    initiateSell(
      orderID: PromiseOrValue<BigNumberish>,
      amountSats: PromiseOrValue<BigNumberish>,
      destScriptHash: PromiseOrValue<BytesLike>,
      overrides?: CallOverrides
    ): Promise<BigNumber>;

    nextOrderID(overrides?: CallOverrides): Promise<BigNumber>;

    orderbook(
      arg0: PromiseOrValue<BigNumberish>,
      overrides?: CallOverrides
    ): Promise<
      [string, BigNumber, BigNumber, string, BigNumber] & {
        maker: string;
        amountSats: BigNumber;
        priceWeiPerSat: BigNumber;
        scriptHash: string;
        stakedWei: BigNumber;
      }
    >;

    postAsk(
      priceWeiPerSat: PromiseOrValue<BigNumberish>,
      scriptHash: PromiseOrValue<BytesLike>,
      overrides?: CallOverrides
    ): Promise<BigNumber>;

    postBid(
      amountSats: PromiseOrValue<BigNumberish>,
      priceWeiPerSat: PromiseOrValue<BigNumberish>,
      overrides?: CallOverrides
    ): Promise<BigNumber>;

    proveSettlement(
      escrowID: PromiseOrValue<BigNumberish>,
      bitcoinBlockNum: PromiseOrValue<BigNumberish>,
      bitcoinTransactionProof: BtcTxProofStruct,
      txOutIx: PromiseOrValue<BigNumberish>,
      overrides?: CallOverrides
    ): Promise<void>;

    slash(
      escrowID: PromiseOrValue<BigNumberish>,
      overrides?: CallOverrides
    ): Promise<void>;

    stakePercent(overrides?: CallOverrides): Promise<BigNumber>;
  };

  filters: {
    "EscrowSettled(uint256,uint256,address,uint256)"(
      escrowID?: null,
      amountSats?: null,
      ethDest?: null,
      ethAmount?: null
    ): EscrowSettledEventFilter;
    EscrowSettled(
      escrowID?: null,
      amountSats?: null,
      ethDest?: null,
      ethAmount?: null
    ): EscrowSettledEventFilter;

    "EscrowSlashed(uint256,uint256,address,uint256)"(
      escrowID?: null,
      escrowDeadline?: null,
      ethDest?: null,
      ethAmount?: null
    ): EscrowSlashedEventFilter;
    EscrowSlashed(
      escrowID?: null,
      escrowDeadline?: null,
      ethDest?: null,
      ethAmount?: null
    ): EscrowSlashedEventFilter;

    "OrderCancelled(uint256)"(orderID?: null): OrderCancelledEventFilter;
    OrderCancelled(orderID?: null): OrderCancelledEventFilter;

    "OrderMatched(uint256,uint256,int128,uint128,uint256,address,address)"(
      escrowID?: null,
      orderID?: null,
      amountSats?: null,
      priceWeiPerSat?: null,
      takerStakedWei?: null,
      maker?: null,
      taker?: null
    ): OrderMatchedEventFilter;
    OrderMatched(
      escrowID?: null,
      orderID?: null,
      amountSats?: null,
      priceWeiPerSat?: null,
      takerStakedWei?: null,
      maker?: null,
      taker?: null
    ): OrderMatchedEventFilter;

    "OrderPlaced(uint256,int128,uint128,uint256,address)"(
      orderID?: null,
      amountSats?: null,
      priceWeiPerSat?: null,
      makerStakedWei?: null,
      maker?: null
    ): OrderPlacedEventFilter;
    OrderPlaced(
      orderID?: null,
      amountSats?: null,
      priceWeiPerSat?: null,
      makerStakedWei?: null,
      maker?: null
    ): OrderPlacedEventFilter;
  };

  estimateGas: {
    btcVerifier(overrides?: CallOverrides): Promise<BigNumber>;

    cancelOrder(
      orderID: PromiseOrValue<BigNumberish>,
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<BigNumber>;

    escrows(
      arg0: PromiseOrValue<BigNumberish>,
      overrides?: CallOverrides
    ): Promise<BigNumber>;

    initiateBuy(
      orderID: PromiseOrValue<BigNumberish>,
      amountSats: PromiseOrValue<BigNumberish>,
      overrides?: PayableOverrides & { from?: PromiseOrValue<string> }
    ): Promise<BigNumber>;

    initiateSell(
      orderID: PromiseOrValue<BigNumberish>,
      amountSats: PromiseOrValue<BigNumberish>,
      destScriptHash: PromiseOrValue<BytesLike>,
      overrides?: PayableOverrides & { from?: PromiseOrValue<string> }
    ): Promise<BigNumber>;

    nextOrderID(overrides?: CallOverrides): Promise<BigNumber>;

    orderbook(
      arg0: PromiseOrValue<BigNumberish>,
      overrides?: CallOverrides
    ): Promise<BigNumber>;

    postAsk(
      priceWeiPerSat: PromiseOrValue<BigNumberish>,
      scriptHash: PromiseOrValue<BytesLike>,
      overrides?: PayableOverrides & { from?: PromiseOrValue<string> }
    ): Promise<BigNumber>;

    postBid(
      amountSats: PromiseOrValue<BigNumberish>,
      priceWeiPerSat: PromiseOrValue<BigNumberish>,
      overrides?: PayableOverrides & { from?: PromiseOrValue<string> }
    ): Promise<BigNumber>;

    proveSettlement(
      escrowID: PromiseOrValue<BigNumberish>,
      bitcoinBlockNum: PromiseOrValue<BigNumberish>,
      bitcoinTransactionProof: BtcTxProofStruct,
      txOutIx: PromiseOrValue<BigNumberish>,
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<BigNumber>;

    slash(
      escrowID: PromiseOrValue<BigNumberish>,
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<BigNumber>;

    stakePercent(overrides?: CallOverrides): Promise<BigNumber>;
  };

  populateTransaction: {
    btcVerifier(overrides?: CallOverrides): Promise<PopulatedTransaction>;

    cancelOrder(
      orderID: PromiseOrValue<BigNumberish>,
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<PopulatedTransaction>;

    escrows(
      arg0: PromiseOrValue<BigNumberish>,
      overrides?: CallOverrides
    ): Promise<PopulatedTransaction>;

    initiateBuy(
      orderID: PromiseOrValue<BigNumberish>,
      amountSats: PromiseOrValue<BigNumberish>,
      overrides?: PayableOverrides & { from?: PromiseOrValue<string> }
    ): Promise<PopulatedTransaction>;

    initiateSell(
      orderID: PromiseOrValue<BigNumberish>,
      amountSats: PromiseOrValue<BigNumberish>,
      destScriptHash: PromiseOrValue<BytesLike>,
      overrides?: PayableOverrides & { from?: PromiseOrValue<string> }
    ): Promise<PopulatedTransaction>;

    nextOrderID(overrides?: CallOverrides): Promise<PopulatedTransaction>;

    orderbook(
      arg0: PromiseOrValue<BigNumberish>,
      overrides?: CallOverrides
    ): Promise<PopulatedTransaction>;

    postAsk(
      priceWeiPerSat: PromiseOrValue<BigNumberish>,
      scriptHash: PromiseOrValue<BytesLike>,
      overrides?: PayableOverrides & { from?: PromiseOrValue<string> }
    ): Promise<PopulatedTransaction>;

    postBid(
      amountSats: PromiseOrValue<BigNumberish>,
      priceWeiPerSat: PromiseOrValue<BigNumberish>,
      overrides?: PayableOverrides & { from?: PromiseOrValue<string> }
    ): Promise<PopulatedTransaction>;

    proveSettlement(
      escrowID: PromiseOrValue<BigNumberish>,
      bitcoinBlockNum: PromiseOrValue<BigNumberish>,
      bitcoinTransactionProof: BtcTxProofStruct,
      txOutIx: PromiseOrValue<BigNumberish>,
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<PopulatedTransaction>;

    slash(
      escrowID: PromiseOrValue<BigNumberish>,
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<PopulatedTransaction>;

    stakePercent(overrides?: CallOverrides): Promise<PopulatedTransaction>;
  };
}
