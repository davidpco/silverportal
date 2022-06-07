import * as React from "react";
import Intro from "./Intro";
import { Routes, Route } from "react-router-dom";
import Header from "./Header";
import SwapEthToBtc from "./Swap";

export default function Main() {
  return (
    <main>
      <h1>hello world</h1>
      <Header />
      <Routes>
        <Route path="/" element={<Intro />} />
        <Route path="/swap" element={<SwapEthToBtc />} />
        <Route path="/btc-to-eth" element={<div>todo 1</div>} />
      </Routes>
    </main>
  );
}
