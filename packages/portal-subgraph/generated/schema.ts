// THIS IS AN AUTOGENERATED FILE. DO NOT EDIT THIS FILE DIRECTLY.

import {
  TypedMap,
  Entity,
  Value,
  ValueKind,
  store,
  Bytes,
  BigInt,
  BigDecimal
} from "@graphprotocol/graph-ts";

export class Order extends Entity {
  constructor(id: string) {
    super();
    this.set("id", Value.fromString(id));
  }

  save(): void {
    let id = this.get("id");
    assert(id != null, "Cannot save Order entity without an ID");
    if (id) {
      assert(
        id.kind == ValueKind.STRING,
        `Entities of type Order must have an ID of type String but the id '${id.displayData()}' is of type ${id.displayKind()}`
      );
      store.set("Order", id.toString(), this);
    }
  }

  static load(id: string): Order | null {
    return changetype<Order | null>(store.get("Order", id));
  }

  get id(): string {
    let value = this.get("id");
    return value!.toString();
  }

  set id(value: string) {
    this.set("id", Value.fromString(value));
  }

  get maker(): string {
    let value = this.get("maker");
    return value!.toString();
  }

  set maker(value: string) {
    this.set("maker", Value.fromString(value));
  }

  get amountSats(): BigInt {
    let value = this.get("amountSats");
    return value!.toBigInt();
  }

  set amountSats(value: BigInt) {
    this.set("amountSats", Value.fromBigInt(value));
  }

  get priceTokPerSat(): BigInt {
    let value = this.get("priceTokPerSat");
    return value!.toBigInt();
  }

  set priceTokPerSat(value: BigInt) {
    this.set("priceTokPerSat", Value.fromBigInt(value));
  }

  get stakedTok(): BigInt | null {
    let value = this.get("stakedTok");
    if (!value || value.kind == ValueKind.NULL) {
      return null;
    } else {
      return value.toBigInt();
    }
  }

  set stakedTok(value: BigInt | null) {
    if (!value) {
      this.unset("stakedTok");
    } else {
      this.set("stakedTok", Value.fromBigInt(<BigInt>value));
    }
  }

  get status(): string {
    let value = this.get("status");
    return value!.toString();
  }

  set status(value: string) {
    this.set("status", Value.fromString(value));
  }
}

export class Escrow extends Entity {
  constructor(id: string) {
    super();
    this.set("id", Value.fromString(id));
  }

  save(): void {
    let id = this.get("id");
    assert(id != null, "Cannot save Escrow entity without an ID");
    if (id) {
      assert(
        id.kind == ValueKind.STRING,
        `Entities of type Escrow must have an ID of type String but the id '${id.displayData()}' is of type ${id.displayKind()}`
      );
      store.set("Escrow", id.toString(), this);
    }
  }

  static load(id: string): Escrow | null {
    return changetype<Escrow | null>(store.get("Escrow", id));
  }

  get id(): string {
    let value = this.get("id");
    return value!.toString();
  }

  set id(value: string) {
    this.set("id", Value.fromString(value));
  }

  get amountSatsDue(): BigInt {
    let value = this.get("amountSatsDue");
    return value!.toBigInt();
  }

  set amountSatsDue(value: BigInt) {
    this.set("amountSatsDue", Value.fromBigInt(value));
  }

  get deadline(): BigInt {
    let value = this.get("deadline");
    return value!.toBigInt();
  }

  set deadline(value: BigInt) {
    this.set("deadline", Value.fromBigInt(value));
  }

  get escrowTok(): BigInt {
    let value = this.get("escrowTok");
    return value!.toBigInt();
  }

  set escrowTok(value: BigInt) {
    this.set("escrowTok", Value.fromBigInt(value));
  }

  get successRecipient(): string {
    let value = this.get("successRecipient");
    return value!.toString();
  }

  set successRecipient(value: string) {
    this.set("successRecipient", Value.fromString(value));
  }

  get timeoutRecipient(): string {
    let value = this.get("timeoutRecipient");
    return value!.toString();
  }

  set timeoutRecipient(value: string) {
    this.set("timeoutRecipient", Value.fromString(value));
  }

  get order(): string {
    let value = this.get("order");
    return value!.toString();
  }

  set order(value: string) {
    this.set("order", Value.fromString(value));
  }

  get status(): string {
    let value = this.get("status");
    return value!.toString();
  }

  set status(value: string) {
    this.set("status", Value.fromString(value));
  }
}
