import { ethers } from "ethers";
import { Portal } from "../../types/ethers-contracts";
import { Escrow, EscrowsForAddr } from "../model/Escrow";
import { Order, Orderbook } from "../model/Orderbook";
import { PortalParams } from "../model/PortalParams";
import { contractAddrs } from "../utils/contracts";

export async function loadParams(portal: Portal): Promise<PortalParams> {
  const stakePercent = (await portal.stakePercent()).toNumber();

  return {
    stakePercent,
    ethNetwork: "ropsten",
    btcNetwork: "testnet",
    btcMinConfirmations: 1,
    contractAddr: contractAddrs.portal,
    escrowDurationHours: 24,
  };
}

type OrderT = [
  string,
  ethers.BigNumber,
  ethers.BigNumber,
  string,
  ethers.BigNumber
];

type EscrowT = [
  string,
  ethers.BigNumber,
  ethers.BigNumber,
  ethers.BigNumber,
  string,
  string
];

// Returns all orders, sorted by ascending price.
// TODO: load this from an indexer.
export async function loadOrderbook(portal: Portal): Promise<Orderbook> {
  const n = (await portal.nextOrderID()).toNumber();
  console.log(`# orders: ${n}`);

  // Load orders from chain in parallel
  const promises = [] as Promise<OrderT>[];
  for (let i = 1; i < n; i++) {
    promises.push(portal.orderbook(i));
  }
  const rawOrders = await Promise.all(promises);
  const orders = rawOrders
    .map(
      (o: OrderT, i) =>
        ({
          orderID: i + 1,
          maker: o[0],
          amountSats: o[1],
          priceTps: o[2],
          scriptHash: o[3],
          stakedTok: o[4],
        } as Order)
    )
    .filter((o) => !o.amountSats.isZero());

  return new Orderbook(orders);
}

export async function loadEscrowForAddr(
  addr: string,
  portal: Portal
): Promise<EscrowsForAddr> {
  const n = (await portal.nextEscrowID()).toNumber();

  // Load from chain in parallel
  const promises = [] as Promise<EscrowT>[];
  for (let i = 1; i < n; i++) {
    promises.push(portal.escrows(i));
  }
  const rawEscrows = await Promise.all(promises);
  console.log("Loaded escrows", rawEscrows);

  const escrows = rawEscrows
    .map(
      (e: EscrowT, i) =>
        ({
          escrowId: i + 1,
          destScriptHash: e[0],
          amountSatsDue: e[1],
          deadline: e[2].toNumber(),
          escrowTok: e[3],
          successRecipient: e[4],
          timeoutRecipient: e[5],
        } as Escrow)
    )
    .filter((e) => !e.amountSatsDue.isZero());

  return {
    ethAddress: addr,
    btcPaymentsOwedBy: escrows.filter((e) => e.successRecipient === addr),
    btcPaymentsOwedTo: escrows.filter((e) => e.timeoutRecipient === addr),
  };
}
