<script>
  import "./app.css";
  import Footer from "../src/lib/components/Footer.svelte";
  import Header from "../src/lib/components/Header.svelte";
  import ethersStore from "./lib/store/ethersStore.js";
  import ConnectWallet from "./lib/components/connectWallet.svelte";
  import ContractERC20 from "./lib/components/contractSelector.svelte";

  // 0 for no contracts
  // 1 for contract Factory ERC20
  // 2 for Saga Coin
  // 3 for FundMe
  // 4 for Lottery
  // 5 for ERC721
  let selector = 0;
</script>

<div class="flex flex-col h-screen justify-between">
  <Header />

  <main class="mb-auto h-10 ">
    <div class="w-full ">
      <ConnectWallet />
      {#if $ethersStore.walletConnected == true}
        <div class="btn-group">
          <button
            id="none"
            class="btn btn-active"
            on:click={() => {
              selector = 0;
              let fact = document.getElementById("mobile-menu");
            }}>None</button
          >
          <button
            id="FundMe"
            class="btn"
            on:click={() => {
              selector = 3;
            }}>Fund Me</button
          >
          <button
            id="Lottery"
            class="btn"
            on:click={() => {
              selector = 4;
            }}>Lottery</button
          >
          <button
            id="fact"
            class="btn"
            on:click={() => {
              selector = 1;
            }}>Factory ERC20</button
          >
          <button
            id="contract"
            class="btn"
            on:click={() => {
              selector = 5;
            }}>NFTs</button
          >
        </div>
      {/if}
      <!-- Leave space between the navigator and the content -->
      <div class="h-2 m-4" />
      <ContractERC20 {selector} />
    </div>
  </main>

  <Footer />
</div>
