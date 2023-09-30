<script>
  import ethersStore from "../store/ethersStore.js";
  import { roundedBalanceEthFromWei, sliceAddress } from "../utils/various.js";
  import {
    connectToContract,
    connectSignerToContract,
  } from "../utils/ethersContracts.js";
  import abiLottery from "../../../constants/abiLottery.json";
  import addressesLottery from "../../../constants/contractLotteryAddresses.json";
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
  let recentWinner;
  let slicedWinner;
  let entranceFeeWei;
  let entranceFeeEth;
  let raffleState;
  let lastTimeStamp;
  let sendTransactionTransfer = false;
  let sendTransactionWithdraw = false;
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
  let contractSelected = false;
  let contractAddresses = [];
  let selectedContract;

  onMount(() => {
    try {
      if (chainId == 11155111 || chainId == 31337) {
        chainSupported = true;
        if (walletConnected == true) {
          contractAddresses = addressesLottery[chainId];
          console.log(contractAddresses);
        }
      } else {
        chainSupported = false;
        throw new Error(
          "Chain not supported. At the moment only Anvil and Sepolia are supported!"
        );
      }
    } catch (error) {
      console.log(error);
    }
  });

  //const dispatch = createEventDispatcher();

  async function loadContractData() {
    contractToLoad = await connectToContract(selectedContract, abiLottery);
    connectSignerToContract(contractToLoad);
    await getInitialData().catch((error) => {
      console.log(error);
    });
    contractSelected = true;
  }

  async function getInitialData() {
    await getRecentWinner();
    await getEntranceFee();
    await getLastTimeStamp();
    await getRaffleState();
    await getContractBalance();
    slicedWinner = sliceAddress(recentWinner);
    entranceFeeEth = roundedBalanceEthFromWei(entranceFeeWei, 2);
  }

  async function getRecentWinner() {
    try {
      recentWinner = await contractToLoad.getRecentWinner();
    } catch (error) {
      somethingsUp = true;
      transactionError = { error };
    }
  }

  async function getEntranceFee() {
    try {
      entranceFeeWei = await contractToLoad.getEntranceFee();
    } catch (error) {
      somethingsUp = true;
      transactionError = { error };
    }
  }

  async function getLastTimeStamp() {
    try {
      lastTimeStamp = await contractToLoad.getLastTimeStamp();
    } catch (error) {
      somethingsUp = true;
      transactionError = { error };
    }
  }

  async function getRaffleState() {
    try {
      raffleState = await contractToLoad.getRaffleState();
    } catch (error) {
      somethingsUp = true;
      transactionError = { error };
    }
  }

  async function getContractBalance() {
    try {
      contractBalance = await $ethersStore.provider.getBalance(
        selectedContract
      );
      contractBalanceDec = (parseInt(contractBalance) / 10 ** ercDecimals)
        .toString()
        .replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    } catch (error) {
      somethingsUp = true;
      transactionError = { error };
    }
  }

  async function enterRaffle() {
    try {
      sendTransactionTransfer = true;
      let tx;
      tx = await contractToLoad.enterRaffle({
        value: entranceFeeWei,
      });
      transactionReceipt = await tx.wait();
      somethingsUp = true;
      //console.log("transactionReceipt: ", transactionReceipt)
      sendTransactionTransfer = false;
      //console.error("vgika transaction")
      await getContractBalance();
    } catch (error) {
      somethingsUp = true;
      transactionError = { error };
      sendTransactionTransfer = false;
    }
  }

  function toggleMessage() {
    somethingsUp = false;
    transactionError = null;
  }
</script>

{#if chainSupported}
  <table class=" flex-row w-full h-full">
    <select
      class="select select-primary w-full max-w-xs"
      bind:value={selectedContract}
      on:change={() => {
        //dispatch("contractSelected", selectedContract)
        ethersStore.resetLotteryContract();
        ethersStore.updateLotteryContract(selectedContract);
        loadContractData();
      }}
    >
      <option disabled selected>Which Contract to load?</option>
      {#each contractAddresses as contractAddress}
        <option value={contractAddress}>{contractAddress}</option>
      {/each}
    </select>
    {#if contractSelected}
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
            <div class="stat-title">Entrance fee</div>
            <div class="stat-value">{entranceFeeEth} $</div>
            <div class="stat-desc">Entrance particiapation Fee in eth</div>
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
            <div class="stat-title">Time Stamp</div>
            <div class="stat-desc">{lastTimeStamp}</div>
            <div class="stat-desc">Last block winner was elected</div>
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
            <div class="stat-title">Winner</div>
            <div class="stat-value">{slicedWinner}</div>
            <div class="stat-desc">The most recent winner</div>
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
            <div class="stat-title">Contract State</div>
            <div class="stat-value">{raffleState}</div>
            <div class="stat-desc">State : (0 = open/ 1 = calculating)</div>
          </div>
          <div class="stat">
            <button
              class="btn btn-xs sm:btn-sm md:btn-md lg:btn-lg"
              on:click={getInitialData}>Refresh</button
            >
          </div>
        </div>
      </tr>
      <tr>
        <div class="h-5 m-1" />
      </tr>
      <tr>
        <div class="join">
          <div>
            <table>
              <div>
                {#if !sendTransactionTransfer}
                  <button
                    id="fundMeBtn"
                    class="btn join-item"
                    on:click={enterRaffle}>Enter Lottery</button
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
    {/if}
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
