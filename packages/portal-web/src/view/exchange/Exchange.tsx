import { NewTransaction } from "@rainbow-me/rainbowkit/dist/transactions/transactionStore";
import * as React from "react";
import { ERC20, Portal } from "../../../types/ethers-contracts";
import {
  loadEscrowForAddr,
  loadOrderbook,
  loadParams,
} from "../../api/loadPortal";
import { EscrowsForAddr } from "../../model/Escrow";
import { Orderbook } from "../../model/Orderbook";
import { PortalParams } from "../../model/PortalParams";
import { ContractConns } from "../../utils/contracts";
import ViewContractLink from "../components/ViewContractLink";
import EscrowTable from "./EscrowTable";
import { ModalInfo } from "./exchangeActions";
import {
  CancelModal,
  ConfirmOrderModal,
  ConfirmTradeModal,
  PleaseConnectModal,
  ProveModal,
  SlashModal,
} from "./exchangeModals";
import OrderForm from "./OrderForm";
import OrdersTable from "./OrdersTable";

interface ExchangeProps {
  contracts: ContractConns;
  connectedAddress?: string;
  addRecentTransaction: (tx: NewTransaction) => void;
}

interface ExchangeState {
  modal: ModalInfo;
  params?: PortalParams;
  orders?: Orderbook;
  escrow?: EscrowsForAddr;
}

export default class Exchange extends React.PureComponent<ExchangeProps> {
  state = {
    modal: { type: "none" },
  } as ExchangeState;

  _reloadInterval = 0;

  /** Load data + reload periodically. */
  async componentDidMount() {
    for (let delay = 1000; ; delay *= 2) {
      console.log("Loading Portal parameters...");
      try {
        const params = await loadParams(this.props.contracts.read.portal);
        this.setState({ params });
        break;
      } catch (e) {
        console.log("Param loading failed. Waiting, then retrying...", e);
        await new Promise((resolve) => setTimeout(resolve, delay));
      }
    }

    this._reloadInterval = window.setInterval(this.reloadData, 60_000);
    this.reloadData();
  }

  componentWillUnmount() {
    window.clearInterval(this._reloadInterval);
  }

  /** Reloads the orderbook and open escrows. */
  reloadData = async () => {
    const { contracts, connectedAddress } = this.props;

    console.log("Loading orderbook...");
    const orders = await loadOrderbook(contracts.read.portal);
    this.setState({ orders });

    if (connectedAddress) {
      console.log("Loading escrows...");
      const escrow = await loadEscrowForAddr(
        connectedAddress,
        contracts.read.portal
      );
      this.setState({ escrow });
    } else {
      this.setState({ escrow: undefined });
    }
  };

  /** Dispatch all actions thru a dispatcher. Like Redux, but simple. */
  dispatch = (modal: ModalInfo) => {
    // TODO: proper action dispatcher.
    console.log(`Dispatch: ${JSON.stringify(modal)}`);
    if (modal.type !== "none" && !this.props.connectedAddress) {
      modal = { type: "please-connect" };
    }
    this.setState({ modal });
    if (modal.type === "none") this.reloadData();
  };

  closeModal = () => this.dispatch({ type: "none" });

  render() {
    const { contracts, connectedAddress, addRecentTransaction } = this.props;
    const { params, orders, escrow, modal } = this.state;
    console.log(`Rendering Exchange`, params);
    if (params == null) return null;
    const { ethNetwork, contractAddr } = params;

    const bbo = orders ? orders.getBestBidAsk() : [];
    const onClose = this.closeModal;
    const props = {
      contracts,
      params,
      bbo,
      connectedAddress,
      addRecentTransaction,
      onClose,
    };

    return (
      <div>
        <h2>Order</h2>
        <OrderForm orders={orders} dispatch={this.dispatch} />
        <h2>
          Orderbook{" "}
          <small>
            <ViewContractLink network={ethNetwork} contract={contractAddr} />
          </small>
        </h2>
        <OrdersTable orders={orders} params={params} dispatch={this.dispatch} />
        <EscrowTable escrow={escrow} params={params} dispatch={this.dispatch} />
        {modal.type === "please-connect" && <PleaseConnectModal {...props} />}
        {(modal.type === "bid" || modal.type === "ask") && (
          <ConfirmOrderModal {...props} {...modal} />
        )}
        {(modal.type === "sell" || modal.type === "buy") && (
          <ConfirmTradeModal {...props} {...modal} />
        )}
        {modal.type === "cancel" && (
          <CancelModal {...props} order={modal.order} />
        )}
        {modal.type === "prove" && (
          <ProveModal {...props} escrow={modal.escrow} />
        )}
        {modal.type === "slash" && (
          <SlashModal {...props} escrow={modal.escrow} />
        )}
      </div>
    );
  }
}
