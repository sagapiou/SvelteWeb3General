<script>
  import ethersStore from "../store/ethersStore.js";
  import { roundedBalanceEthFromWei, sliceAddress } from "../utils/various.js";
  import {
    connectToContract,
    connectSignerToContract,
  } from "../utils/ethersContracts.js";
  import abiFundMe from "../../../constants/abiFundMe.json";
  import addressFundMe from "../../../constants/contractFundMeAddresses.json";
  import { onMount } from "svelte";
  import { createEventDispatcher } from "svelte";
  import TrReceipt from "./trReceipt.svelte";
  import { ethers } from "ethers";

  $: walletConnected = $ethersStore.walletConnected;
  $: chainId = $ethersStore.selectedChainId;

  let chainSupported = false;
  let contractToLoad;
  let somethingsUp = false;
  let transactionError = null;
  let FundMeOwner;
  let FundMePriceFeed;
  let FundMeV3AggregatorVersion;
  let FundMeMinUsd;
  let sendTransactionTransfer = false;
  let sendTransactionWithdraw = false;
  let FundMeMinUsdDec;
  let contractBalance;
  let contractBalanceDec;
  let addressOf;
  let balanceOf;
  let balanceOfDec;
  let funderAmount;
  let funderAmountDec;
  let funder;
  let funderAddress;
  let fundAmount;
  let idx;
  let transactionReceipt = null;
  let ercDecimals = 18;
  let slicedOwner;
  let slicedAggreg;

  onMount(async () => {
    try {
      if (walletConnected == true) {
        await contractToLoadFunctions().catch((error) => {
          somethingsUp = true;
          transactionError = { error };
        });
        await getInitialData().catch((error) => {
          console.log(error);
        });
      }
    } catch (error) {
      console.log(error);
    }
  });

  const dispatch = createEventDispatcher();

  async function contractToLoadFunctions() {
    if (chainId == 11155111 || chainId == 31337) {
      chainSupported = true;
      contractToLoad = await connectToContract(
        addressFundMe[chainId].toString(),
        abiFundMe
      );
      connectSignerToContract(contractToLoad);
    } else {
      chainSupported = false;
      throw new Error(
        "Chain not supported. At the moment only Anvil and Sepolia are supported!"
      );
    }
  }

  async function getInitialData() {
    console.log(contractToLoad);
    console.log(chainId);
    console.log($ethersStore.provider.getNetwork());

    await getFundMeOwner();
    await getFundMePriceFeed();
    await getFundMeAggregatorVersion();
    await getFundMeMinUSDDonations();
    await getContractBalance();
    slicedOwner = sliceAddress(FundMeOwner);
    slicedAggreg = sliceAddress(FundMePriceFeed);
  }

  async function getFundMeOwner() {
    try {
      FundMeOwner = await contractToLoad.getOwner();
    } catch (error) {
      somethingsUp = true;
      transactionError = { error };
    }
  }

  async function getFundMePriceFeed() {
    try {
      FundMePriceFeed = await contractToLoad.getPriceFeed();
    } catch (error) {
      somethingsUp = true;
      transactionError = { error };
    }
  }

  async function getFundMeAggregatorVersion() {
    try {
      FundMeV3AggregatorVersion = await contractToLoad.getVersion();
    } catch (error) {
      somethingsUp = true;
      transactionError = { error };
    }
  }

  async function getFundMeMinUSDDonations() {
    try {
      FundMeMinUsd = await contractToLoad.MINIMUM_USD();
      FundMeMinUsdDec = (parseInt(FundMeMinUsd) / 10 ** ercDecimals)
        .toString()
        .replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    } catch (error) {
      somethingsUp = true;
      transactionError = { error };
    }
  }

  async function getContractBalance() {
    try {
      contractBalance = await $ethersStore.provider.getBalance(
        addressFundMe[chainId].toString()
      );
      contractBalanceDec = (parseInt(contractBalance) / 10 ** ercDecimals)
        .toString()
        .replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    } catch (error) {
      somethingsUp = true;
      transactionError = { error };
    }
  }

  async function fundFundMe() {
    try {
      sendTransactionTransfer = true;
      let tx;
      tx = await contractToLoad.fund({
        value: ethers.utils.parseEther(fundAmount),
      });
      transactionReceipt = await tx.wait();
      somethingsUp = true;
      //console.log("transactionReceipt: ", transactionReceipt)
      sendTransactionTransfer = false;
      //console.error("vgika trans")
      await getContractBalance();
    } catch (error) {
      somethingsUp = true;
      transactionError = { error };
      sendTransactionTransfer = false;
    }
  }

  async function withdrawFundMe() {
    try {
      sendTransactionWithdraw = true;
      let tx;
      tx = await contractToLoad.withdraw();
      transactionReceipt = await tx.wait();
      somethingsUp = true;
      //console.log("transactionReceipt: ", transactionReceipt)
      sendTransactionWithdraw = false;
      //console.error("vgika trans")
      await getContractBalance();
    } catch (error) {
      somethingsUp = true;
      transactionError = { error };
      sendTransactionWithdraw = false;
    }
  }

  function toggleMessage() {
    somethingsUp = false;
    transactionError = null;
  }
</script>

{#if chainSupported}
  <table class=" flex-row w-full h-full">
    <tr>
      <input type="checkbox" id="my-modal-10" class="modal-toggle" />
      <div class="modal">
        <div class="modal-box w-11/12 max-w-5xl">
          <h3 class="font-bold text-lg">
            {#if transactionError !== null}
              Transaction Error!
            {:else}
              Info!
            {/if}
          </h3>
          <p class="py-4">
            <TrReceipt
              transReceipt={transactionReceipt}
              transError={transactionError}
            />
          </p>
          <div class="modal-action">
            <label for="my-modal-10" class="btn" on:click={toggleMessage}
              >OK</label
            >
          </div>
        </div>
      </div>
    </tr>
    <tr>
      <div class="h-1 m-1" />
    </tr>
    <tr>
      <div class="stats shadow">
        <div class="stat">
          <div class="stat-figure text-secondary">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              class="inline-block w-8 h-8 stroke-current"
              ><path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              /></svg
            >
          </div>
          <div class="stat-title">Aggregator Version</div>
          <div class="stat-value">{FundMeV3AggregatorVersion}</div>
          <div class="stat-desc">Chainlink Aggregator Version</div>
        </div>
        <div class="stat">
          <div class="stat-figure text-secondary">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              class="inline-block w-8 h-8 stroke-current"
              ><path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              /></svg
            >
          </div>
          <div class="stat-title">Minimum Funding</div>
          <div class="stat-value">{FundMeMinUsdDec} $</div>
          <div class="stat-desc">Minimum allowed USD amount</div>
        </div>

        <div class="stat">
          <div class="stat-figure text-secondary">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              class="inline-block w-8 h-8 stroke-current"
              ><path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              /></svg
            >
          </div>
          <div class="stat-title">Price Feed</div>
          <div class="stat-desc">{slicedAggreg}</div>
          <div class="stat-desc">Contract with the price feed</div>
        </div>

        <div class="stat">
          <div class="stat-figure text-secondary">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              class="inline-block w-8 h-8 stroke-current"
              ><path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              /></svg
            >
          </div>
          <div class="stat-title">Contract Balance</div>
          <div class="stat-value">{contractBalanceDec}</div>
          <div class="stat-desc">Balance of the contract in eth</div>
        </div>
        <div class="stat">
          <div class="stat-figure text-secondary">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              class="inline-block w-8 h-8 stroke-current"
              ><path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              /></svg
            >
          </div>
          <div class="stat-title">Contract Owner</div>
          <div class="stat-desc">{slicedOwner}</div>
          <div class="stat-desc">Owner of the contract</div>
        </div>
      </div>
    </tr>
    <tr>
      <div class="h-20 m-1" />
    </tr>
    <tr>
      <div class="join">
        <div>
          <table>
            <div>
              <input
                class="input input-bordered join-item"
                placeholder="Amount in eth"
                bind:value={fundAmount}
              />
              {#if !sendTransactionTransfer}
                <button
                  id="fundMeBtn"
                  class="btn join-item"
                  on:click={fundFundMe}>Fund</button
                >
              {:else}
                <button class="btn join-item">
                  <svg class="spinner" viewBox="0 0 40 40">
                    <circle cx="20" cy="20" r="18" />
                  </svg>
                </button>
              {/if}
              {#if !sendTransactionWithdraw}
                <button
                  id="fundMeBtn"
                  class="btn join-item"
                  on:click={withdrawFundMe}>Withdraw</button
                >
              {:else}
                <button class="btn join-item">
                  <svg class="spinner" viewBox="0 0 40 40">
                    <circle cx="20" cy="20" r="18" />
                  </svg>
                </button>
              {/if}
              &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
              &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
            </div>
          </table>
        </div>
      </div>
    </tr>
    <tr>
      <div class="h-1 m-1" />
    </tr>

    <tr>
      {#if somethingsUp}
        <div class="alert shadow-lg">
          <div>
            <svg
              xmlns="www.saga.net"
              fill="none"
              viewBox="0 0 24 24"
              class="stroke-info flex-shrink-0 w-6 h-6"
              ><path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              /></svg
            >
            <div>
              <h3 class="font-bold">New message!</h3>
              <div class="text-xs">You have 1 unread message</div>
            </div>
          </div>
          <div class="flex-none">
            <label for="my-modal-10" class="btn modal-button">see</label>
          </div>
        </div>
        <div class="h-2 m-4" />
      {/if}
    </tr>
    <tr>
      <div class="h-full" />
    </tr>
    <tr>
      <div class="h-1 m-1" />
    </tr>
  </table>
{/if}

<style>
  .spinner {
    margin-left: 0.2em;
    font-size: 40px;
    width: 0.5em;
    fill: transparent;
    stroke: #ffffff;
    stroke-width: 4;
    stroke-linecap: round;
    stroke-dasharray: 125;
    animation: spinner 4s linear infinite;
  }

  @keyframes spinner {
    0% {
      stroke-dashoffset: 25;
      transform: rotate(0deg);
    }
    50% {
      stroke-dashoffset: 125;
      transform: rotate(720deg);
    }
    100% {
      stroke-dashoffset: 25;
      transform: rotate(1080deg);
    }
  }

  .spinner > circle {
    fill: transparent;
  }

  /*   table {
    border: 1px solid #668;
  } */
</style>
