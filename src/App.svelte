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
  // 6 for Stablecoin
  let selector = 0;
</script>

<div class="flex flex-col h-screen justify-between">
  <Header />

  <main class="mb-auto h-1 m-1  ">
    <div>
      <ConnectWallet />
      {#if $ethersStore.walletConnected == true}
        <div class="join join-vertical lg:join-horizontal">
          <ul class="menu menu-horizontal bg-base-200">
            <li>
              <button
                id="none"
                on:click={() => {
                  selector = 0;
                  let fact = document.getElementById("mobile-menu");
                }}>None</button
              >
            </li>
            <li>
              <button
                id="FundMe"
                on:click={() => {
                  selector = 3;
                }}>Fund Me</button
              >
            </li>
            <li>
              <button
                id="Lottery join-item"
                on:click={() => {
                  selector = 4;
                }}>Lottery</button
              >
            </li>
            <li>
              <button
                id="fact"
                on:click={() => {
                  selector = 1;
                }}>Factory ERC20</button
              >
            </li>
            <li>
              <button
                id="contract join-item"
                on:click={() => {
                  selector = 5;
                }}>NFTs</button
              >
            </li>
            <li>
              <button
                id="contract join-item"
                on:click={() => {
                  selector = 6;
                }}>Stablecoin</button
              >
            </li>
          </ul>
        </div>
      {/if}
      <!-- Leave space between the navigator and the content -->
      <div class="h-1 m-1 " />
      <ContractERC20 {selector} />
    </div>
  </main>

  <Footer />
</div>
