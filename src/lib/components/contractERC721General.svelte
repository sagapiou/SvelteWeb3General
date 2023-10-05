<script>
  import ethersStore from "../store/ethersStore.js";
  import { roundedBalanceEthFromWei, sliceAddress } from "../utils/various.js";
  import {
    connectToContract,
    connectSignerToContract,
  } from "../utils/ethersContracts.js";
  import abiERC721 from "../../../constants/abiERC721.json";
  import addressesERC721 from "../../../constants/contractERC721Addresses.json";
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
  let nftName;
  let nftSymbol;
  let nftContractOwner;
  let nftSlicedContractOwner;
  let nftTokenCounter;
  let nftTokenSelected;
  let nftTokenSelectedStatus;
  let tokenStatus;
  let tokenStatusId;
  let entranceFeeWei;
  let sendTransactionTransfer = false;
  let sendTransactionTransferChangeMood = false;
  let contractBalance;
  let contractBalanceDec;
  let transactionReceipt = null;
  let ercDecimals = 18;
  let contractSelected = false;
  let contractAddresses = [];
  let selectedContract;
  let playerAddress;
  let tokenOwnerAddress;
  let tokenSlicedOwnerAddress;
  let nrOfTokensOwner;
  let nftTokensOwner;
  let selectedTokenUri;
  let selectedTokenUriImage;
  let nftTokenSelectedChangeState;

  onMount(() => {
    try {
      if (chainId == 11155111 || chainId == 31337) {
        chainSupported = true;
        if (walletConnected == true) {
          console.log(addressesERC721);
          contractAddresses = addressesERC721[chainId];
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
    contractToLoad = await connectToContract(selectedContract, abiERC721);
    connectSignerToContract(contractToLoad);
    await getInitialData().catch((error) => {
      console.log(error);
    });
    contractSelected = true;
  }

  async function getInitialData() {
    await getName();
    await getSymbol();
    await getContractBalance();
    await getContractOwner();
    await getTokenCounter();
    nftSlicedContractOwner = sliceAddress(nftContractOwner);
  }

  async function refreshContractData() {
    await getContractBalance();
    await getTokenCounter();
  }

  async function getName() {
    try {
      nftName = await contractToLoad.name();
    } catch (error) {
      somethingsUp = true;
      transactionError = { error };
    }
  }

  async function getSymbol() {
    try {
      nftSymbol = await contractToLoad.symbol();
    } catch (error) {
      somethingsUp = true;
      transactionError = { error };
    }
  }

  async function getContractOwner() {
    try {
      nftContractOwner = await contractToLoad.owner();
    } catch (error) {
      somethingsUp = true;
      transactionError = { error };
    }
  }

  async function getTokenCounter() {
    try {
      nftTokenCounter = (await contractToLoad.getTokenCounter()).toNumber();
    } catch (error) {
      somethingsUp = true;
      transactionError = { error };
    }
  }

  async function loadAddressAtIdx() {
    try {
      tokenOwnerAddress = await contractToLoad.ownerOf(nftTokenSelected);
      tokenSlicedOwnerAddress = sliceAddress(tokenOwnerAddress);
    } catch (error) {
      playerAddress = "Does not exist";
    }
  }

  async function getTokenUri() {
    try {
      selectedTokenUri = await contractToLoad.tokenURI(nftTokenSelected);
      const json = window.atob(selectedTokenUri.substring(29));
      const result = JSON.parse(json);
      selectedTokenUriImage = result.image;
    } catch (error) {
      playerAddress = "Does not exist";
    }
  }

  async function getNrOfContractsOwner() {
    try {
      nrOfTokensOwner = await contractToLoad.balanceOf(nftTokensOwner);
    } catch (error) {
      playerAddress = "Does not exist";
    }
  }

  async function getTokenStatus() {
    try {
      tokenStatusId = await contractToLoad.getTokenState(
        nftTokenSelectedStatus
      );
      if (tokenStatusId == 0) {
        tokenStatus = "HAPPY";
      } else {
        tokenStatus = "SAD";
      }
      tokenStatus;
    } catch (error) {
      playerAddress = "Does not exist";
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

  async function mintNft() {
    try {
      sendTransactionTransfer = true;
      let tx;
      tx = await contractToLoad.mintNft();
      transactionReceipt = await tx.wait();
      somethingsUp = true;
      //console.log("transactionReceipt: ", transactionReceipt)
      sendTransactionTransfer = false;
      //console.error("vgika transaction")
      await refreshContractData();
    } catch (error) {
      somethingsUp = true;
      transactionError = { error };
      sendTransactionTransfer = false;
    }
  }

  async function changeMood() {
    try {
      sendTransactionTransferChangeMood = true;
      let tx;
      tx = await contractToLoad.flipMood(nftTokenSelectedChangeState);
      transactionReceipt = await tx.wait();
      somethingsUp = true;
      //console.log("transactionReceipt: ", transactionReceipt)
      sendTransactionTransferChangeMood = false;
      //console.error("vgika transaction")
      await refreshContractData();
    } catch (error) {
      somethingsUp = true;
      transactionError = { error };
      sendTransactionTransferChangeMood = false;
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
            <div class="stat-title">Balance</div>
            <div class="stat-desc font-extrabold">{contractBalanceDec}</div>
            <div class="stat-desc">Balance (eth)</div>
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
            <div class="stat-title">Name</div>
            <div class="stat-desc font-extrabold">{nftName}</div>
            <div class="stat-desc">NFT Name</div>
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
            <div class="stat-title">Symbol</div>
            <div class="stat-desc font-extrabold">{nftSymbol}</div>
            <div class="stat-desc">NFT Symbol</div>
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
            <div class="stat-title">Owner</div>
            <div class="stat-desc font-extrabold">{nftSlicedContractOwner}</div>
            <div class="stat-desc">Contract Owner</div>
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
            <div class="stat-title">Total:</div>
            <div class="stat-desc font-extrabold">{nftTokenCounter}</div>
            <div class="stat-desc">Total Tokens</div>
          </div>
        </div>
      </tr>
      <tr>
        <div class="h-5 m-1" />
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
            <div class="stat-title">Token Owner</div>
            <div class="stat-desc font-extrabold">
              {tokenSlicedOwnerAddress}
            </div>
            <tr>
              <div class="h-1 m-1" />
            </tr>
            <div class="stat-desc">
              Token:
              <select
                class="select select-info w-full max-w-xs"
                bind:value={nftTokenSelected}
                on:change={() => {
                  //dispatch("contractSelected", selectedContract)
                  loadAddressAtIdx();
                  getTokenUri();
                }}
              >
                <option disabled selected>Token</option>
                {#if nftTokenCounter > 0}
                  {#each Array(nftTokenCounter) as _, nftTokenSelected}
                    <option value={nftTokenSelected}>{nftTokenSelected}</option>
                  {/each}
                {/if}
              </select>
            </div>
          </div>
          <div class="stat">
            <div class="avatar">
              <div class="w-20 h-20">
                <img src={selectedTokenUriImage} alt="Decoded Image" />
              </div>
            </div>
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
            <div class="stat-title">Owner of:</div>

            <div class="stat-desc font-extrabold">
              {nrOfTokensOwner}
            </div>

            <tr>
              <div class="join stat-actions">
                <div>
                  <input
                    class="input input-bordered join-item"
                    placeholder="Search"
                    bind:value={nftTokensOwner}
                  />
                </div>
              </div>
              <div class="indicator stat-actions">
                <button
                  class="btn join-item btn-sm"
                  on:click={getNrOfContractsOwner}>Search</button
                >
              </div>
            </tr>
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
            <div class="stat-title">Token Status</div>
            <div class="stat-desc font-extrabold">
              {tokenStatus}
            </div>
            <tr>
              <div class="h-1 m-1" />
            </tr>
            <div class="stat-desc">
              Token:
              <select
                class="select select-info w-full max-w-xs"
                bind:value={nftTokenSelectedStatus}
                on:change={() => {
                  //dispatch("contractSelected", selectedContract)
                  getTokenStatus();
                }}
              >
                <option disabled selected>Token</option>
                {#if nftTokenCounter > 0}
                  {#each Array(nftTokenCounter) as _, nftTokenSelectedStatus}
                    <option value={nftTokenSelectedStatus}
                      >{nftTokenSelectedStatus}</option
                    >
                  {/each}
                {/if}
              </select>
            </div>
          </div>
        </div></tr
      >
      <tr>
        <div class="h-5 m-1" />
      </tr>
      <div class="divider">Send Transactions</div>
      <tr>
        <div class="stats">
          <div class="stat">
            <div class="stat-title">Mint</div>
            <div>
              {#if !sendTransactionTransfer}
                <button id="fundMeBtn" class="btn join-item" on:click={mintNft}
                  >Mint NFT</button
                >
              {:else}
                <button class="btn join-item">
                  <svg class="spinner" viewBox="0 0 40 40">
                    <circle cx="20" cy="20" r="18" />
                  </svg>
                </button>
              {/if}
            </div>
          </div>
          <div class="stat">
            <div class="stat-title">Change Mood</div>
            <tr>
              <div class="h-1 m-1" />
            </tr>
            <select
              class="select select-bordered"
              bind:value={nftTokenSelectedChangeState}
            >
              <option disabled selected>Token Id</option>
              {#if nftTokenCounter > 0}
                {#each Array(nftTokenCounter) as _, nftTokenSelectedChangeState}
                  <option value={nftTokenSelectedChangeState}
                    >{nftTokenSelectedChangeState}</option
                  >
                {/each}
              {/if}
            </select>
            <tr>
              <div class="h-1 m-1" />
            </tr>
            <div class="indicator">
              {#if !sendTransactionTransferChangeMood}
                <button class="btn" on:click={changeMood}>Change</button>
              {:else}
                <button class="btn ">
                  <svg class="spinner" viewBox="0 0 40 40">
                    <circle cx="20" cy="20" r="18" />
                  </svg>
                </button>
              {/if}
            </div>
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
