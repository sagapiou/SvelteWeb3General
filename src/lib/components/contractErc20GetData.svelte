<script>
  import ethersStore from "../store/ethersStore.js";
  import { ethers } from "ethers";
  import { roundedBalanceEthFromWei, sliceAddress } from "../utils/various.js";
  import {
    connectToContract,
    connectSignerToContract,
  } from "../utils/ethersContracts.js";
  import abiSaga from "../../../constants/abiERC.json";
  import addressSaga from "../../../constants/contractERC20Addresses.json";
  import { onMount } from "svelte";
  import TrReceipt from "./trReceipt.svelte";

  $: metamaskConnected = window.ethereum
    ? window.ethereum.isConnected()
    : false;
  $: slicedSigner = sliceAddress($ethersStore.signerAddress);
  $: walletConnected = $ethersStore.walletConnected;
  $: balanceSigner = roundedBalanceEthFromWei($ethersStore.balance, 8);
  $: chainId = $ethersStore.selectedChainId;

  export let contractERC20;
  let contractAddress;
  let contractToLoad;
  let chainSupported = false;
  let ercName;
  let ercSymbol;
  let ercDecimals = 1;
  let ercTotalSupply;
  let ercTotalSupplyDec;
  let balanceOf = "";
  let addressOf;
  let balanceOfDec = "";
  let allowance = "";
  let allowanceDec = "";
  let allowanceOwner, allowanceSpender;
  let somethingsUp = false;
  let transactionError = null;

  onMount(async () => {
    if (walletConnected == true && contractERC20 != null) {
      ethersStore.resetContractChanged();
      await contractToLoadFunctions().catch((error) => {
        somethingsUp = true;
        transactionError = { error };
      });
      await getInitialData().catch((error) => {
        console.log(error);
      });
    }
  });

  async function contractToLoadFunctions() {
    if (chainId == 11155111 || chainId == 31337) {
      chainSupported = true;
      contractAddress = $ethersStore.contract;
      console.log(contractAddress);
      contractToLoad = await connectToContract(contractAddress, abiSaga);
      connectSignerToContract(contractToLoad);
    } else {
      chainSupported = false;
      throw new Error(
        "Chain not supported. At the moment only Ropsen and Rinkeby are supported"
      );
    }
  }

  async function getInitialData() {
    await ercGetName();
    await ercGetSymbol();
    await ercGetDecimals();
    await ercGetTotalSupply();
  }

  async function ercGetName() {
    // run specific functions of the contract that are with no state change
    try {
      ercName = await contractToLoad.name();
    } catch (error) {
      somethingsUp = true;
      transactionError = { error };
    }
  }

  async function ercGetSymbol() {
    try {
      ercSymbol = await contractToLoad.symbol();
    } catch (error) {
      somethingsUp = true;
      transactionError = { error };
    }
  }

  async function ercGetDecimals() {
    try {
      ercDecimals = await contractToLoad.decimals();
    } catch (error) {
      somethingsUp = true;
      transactionError = { error };
    }
  }

  async function ercGetTotalSupply() {
    ercTotalSupply = await contractToLoad.totalSupply();
    ercTotalSupplyDec = (parseInt(ercTotalSupply) / 10 ** ercDecimals)
      .toString()
      .replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  }

  async function ercGetBalanceOf() {
    try {
      balanceOf = await contractToLoad.balanceOf(addressOf);
      balanceOfDec = (parseInt(balanceOf) / 10 ** ercDecimals)
        .toString()
        .replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    } catch (error) {
      somethingsUp = true;
      transactionError = { error };
    }
  }

  async function ercGetAllowance() {
    try {
      allowance = await contractToLoad.allowance(
        allowanceOwner,
        allowanceSpender
      );
      allowanceDec = (parseInt(allowance) / 10 ** ercDecimals)
        .toString()
        .replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    } catch (error) {
      somethingsUp = true;
      transactionError = { error };
    }
  }

  function toggleMessage() {
    somethingsUp = false;
    transactionError = null;
  }
</script>

{#if contractAddress && chainSupported}
  <input type="checkbox" id="my-modal-5" class="modal-toggle" />
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
        <TrReceipt transReceipt={null} transError={transactionError} />
      </p>
      <div class="modal-action">
        <label for="my-modal-5" class="btn" on:click={toggleMessage}>OK</label>
      </div>
    </div>
  </div>
  <div class="grid flex-grow card bg-base-300 rounded-box place-items-center">
    <div class="h-1 m-1" />
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
          <label for="my-modal-5" class="btn modal-button">see</label>
        </div>
      </div>
      <div class="h-2 m-4" />
    {/if}

    <div class="stats ">
      <div class="stat">
        <div class="stat-title">NAME</div>
        <div class="stat-title font-extrabold">{ercName}</div>
        <!-- <div class="stat-actions">
                    <button class="btn btn-sm btn-success" on:click={ercGetName}
                        >REQUEST NAME</button
                    >
                </div> -->
      </div>
      <div class="stat">
        <div class="stat-title">SYMBOL</div>
        <div class="stat-title font-bold">{ercSymbol}</div>
        <!-- <div class="stat-actions">
                    <button class="btn btn-sm btn-success" on:click={ercGetSymbol}
                        >REQUEST SYMBOL</button
                    >
                </div> -->
      </div>
      <div class="stat">
        <div class="stat-title">DECIMALS</div>
        <div class="stat-title font-bold">{ercDecimals}</div>
        <!-- <div class="stat-actions">
                    <button class="btn btn-sm btn-success" on:click={ercGetDecimals}
                        >REQUEST DECIMALS</button
                    >
                </div> -->
      </div>
      <div class="stat">
        <div class="stat-title">TOTAL SUPPLY</div>
        <div class="stat-title font-bold">{ercTotalSupplyDec}</div>
        <div class="stat-desc">
          This is the total supply ({ercDecimals} decimals).
        </div>
        <!-- <div class="stat-actions">
                    <button class="btn btn-sm btn-success" on:click={ercGetTotalSupply}
                        >REQUEST TOTAL SUPPLY</button
                    >
                </div> -->
      </div>
    </div>
    <div class="h-2 m-2" />
    <tr>
      <div class="join">
        <td>
          <div>
            <input
              class="input input-bordered join-item"
              bind:value={addressOf}
              placeholder="Balance of Address"
            />
          </div>
        </td>
        <td>&nbsp;&nbsp;&nbsp;&nbsp;</td>
        <td>
          <div class="indicator">
            <button class="btn join-item" on:click={ercGetBalanceOf}
              >Get Balance</button
            >
          </div>
        </td>
        <td>&nbsp;&nbsp;&nbsp;&nbsp;</td>
        <td>
          <div
            class="tooltip"
            data-tip="Address Balance without/with the decimals"
          >
            <h2 class="text-xl">
              {balanceOfDec}<br />{balanceOf}
            </h2>
          </div>
        </td>
      </div>
    </tr>
    <div class="h-2 m-2" />
    <hr style="width:50%;text-align:left;margin-left:0" />
    <tr>
      <div class="join">
        <td>
          <div>
            <input
              class="input input-bordered join-item"
              bind:value={allowanceOwner}
              placeholder="Allowance Owner Address"
            />
            <div class="h-1 m-1" />
            <div>
              <input
                class="input input-bordered join-item"
                bind:value={allowanceSpender}
                placeholder="Allowance Spender Address"
              />
            </div>
          </div>
        </td>
        <td>&nbsp;&nbsp;&nbsp;&nbsp;</td>
        <td valign="middle">
          <div class="indicator">
            <button class="btn join-item" on:click={ercGetAllowance}
              >Get Allowance</button
            >
          </div>
        </td>
        <td>&nbsp;&nbsp;&nbsp;&nbsp;</td>
        <td valign="middle">
          <div
            class="tooltip"
            data-tip="Allowance Balance without/with the decimals"
          >
            <h2 class="text-xl">
              {allowanceDec}<br />{allowance}
            </h2>
          </div>
        </td>
      </div>
    </tr>
    <div class="h-2 m-4" />
  </div>
{/if}
