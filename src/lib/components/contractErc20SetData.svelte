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
  $: contractAddress = $ethersStore.contract == "" ? "" : $ethersStore.contract;

  export let contractERC20;
  let addressToConnect;
  let chainSupported = false;
  let contractToLoad;
  let somethingsUp = false;
  let transactionError = null;
  let sendTransactionTransfer = false;
  let sendTransactionApprove = false;
  let sendTransactionIncrAllowance = false;
  let sendTransactionDecrAllowance = false;
  let sendTransactionTransferFrom = false;
  let transactionReceipt = null;
  let trasnferTo;
  let transferAmount;
  let approveAddress;
  let approveAmount;
  let incrAllowanceAddress;
  let incrAllowanceAmount;
  let decrAllowanceAddress;
  let decrAllowanceAmount;
  let trasnferFromTo;
  let transferFromAmount;
  let trasnferFromFrom;

  onMount(async () => {
    try {
      if (walletConnected == true) {
        await contractToLoadFunctions();
      }
    } catch (error) {
      console.log(error);
    }
  });

  async function contractToLoadFunctions() {
    if (chainId == 11155111 || chainId == 31337) {
      addressToConnect = contractAddress;
      chainSupported = true;
      contractToLoad = await connectToContract(addressToConnect, abiSaga);
      connectSignerToContract(contractToLoad);
    } else {
      chainSupported = false;
      // throw new Error(
      //     "Chain not supported. At the moment only Ropsen and Rinkeby are supported"
      // )
    }
  }

  async function ercTransfer() {
    sendTransactionTransfer = true;
    let tx;
    try {
      tx = await contractToLoad.transfer(trasnferTo, transferAmount);
      transactionReceipt = await tx.wait();
      somethingsUp = true;
      //console.log("transactionReceipt: ", transactionReceipt)
      sendTransactionTransfer = false;
      //console.error("vgika trans")
    } catch (error) {
      somethingsUp = true;
      transactionError = { error };
      sendTransactionTransfer = false;
    }
  }

  async function ercApprove() {
    sendTransactionApprove = true;
    let tx;
    try {
      tx = await contractToLoad.approve(approveAddress, approveAmount);
      transactionReceipt = await tx.wait();
      somethingsUp = true;
      //console.log("transactionReceipt: ", transactionReceipt)
      sendTransactionApprove = false;
      //console.error("vgika trans")
    } catch (error) {
      somethingsUp = true;
      transactionError = { error };
      sendTransactionApprove = false;
    }
  }

  async function ercIncreaseAllowance() {
    sendTransactionIncrAllowance = true;
    let tx;
    try {
      tx = await contractToLoad.increaseAllowance(
        incrAllowanceAddress,
        incrAllowanceAmount
      );
      transactionReceipt = await tx.wait();
      somethingsUp = true;
      //console.log("transactionReceipt: ", transactionReceipt)
      sendTransactionIncrAllowance = false;
      //console.error("vgika trans")
    } catch (error) {
      somethingsUp = true;
      transactionError = { error };
      sendTransactionIncrAllowance = false;
    }
  }

  async function ercDecreaseAllowance() {
    sendTransactionDecrAllowance = true;
    let tx;
    try {
      tx = await contractToLoad.decreaseAllowance(
        decrAllowanceAddress,
        decrAllowanceAmount
      );
      transactionReceipt = await tx.wait();
      somethingsUp = true;
      //console.log("transactionReceipt: ", transactionReceipt)
      sendTransactionDecrAllowance = false;
      //console.error("vgika trans")
    } catch (error) {
      somethingsUp = true;
      transactionError = { error };
      sendTransactionDecrAllowance = false;
    }
  }

  async function ercTransferFrom() {
    sendTransactionTransferFrom = true;
    let tx;
    try {
      tx = await contractToLoad.transferFrom(
        trasnferFromFrom,
        trasnferFromTo,
        transferFromAmount
      );
      transactionReceipt = await tx.wait();
      somethingsUp = true;
      //console.log("transactionReceipt: ", transactionReceipt)
      sendTransactionTransferFrom = false;
      //console.error("vgika trans")
    } catch (error) {
      somethingsUp = true;
      transactionError = { error };
      sendTransactionTransferFrom = false;
    }
  }

  function toggleMessage() {
    somethingsUp = false;
    transactionError = null;
  }
</script>

{#if addressToConnect != "" && chainSupported}
  <input type="checkbox" id="my-modal-6" class="modal-toggle" />
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
        <label for="my-modal-6" class="btn" on:click={toggleMessage}>OK</label>
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
          <label for="my-modal-6" class="btn modal-button">see</label>
        </div>
      </div>
      <div class="h-1 m-1" />
    {/if}

    <!-- TRANFER FUNCTION -->
    <div class="form-control align-middle flex border-b-4">
      <h2 class=" text-xl align-middle underline">TRANSFER AMOUNT</h2>
      <div class="h-1 m-1" />
      <div class="input-group align-middle">
        <div class="tooltip" data-tip={`ADDRESS: TRANSFER TO`}>
          <input
            type="text"
            placeholder="Address to transfer..."
            class="input input-bordered align-middle "
            bind:value={trasnferTo}
          />
        </div>
        &nbsp;
        <div class="tooltip" data-tip={`AMOUNT : TO TRASNFER`}>
          <input
            type="text"
            placeholder="Amount to transfer..."
            class="input input-bordered align-middle "
            bind:value={transferAmount}
          />
        </div>
        &nbsp;&nbsp;&nbsp;&nbsp;
        <div
          class="tooltip"
          data-tip="SEND AMOUNT FROM YOUR ADDRESS TO ADDRESS INSERTED"
        >
          {#if sendTransactionTransfer}
            <button class="btn loading btn-wide" disabled>Transfer</button>
          {:else}
            <button class="btn btn-wide" on:click={ercTransfer}
              >Transfer Amount</button
            >
          {/if}
        </div>
      </div>
      <div class="h-1 m-1" />
    </div>

    <!-- APPROVE FUNCTION -->
    <div class="form-control align-middle flex border-b-4">
      <h2 class=" text-xl align-middle underline">
        APPROVE ADDRESS FOR AN AMOUNT
      </h2>
      <div class="h-1 m-1" />
      <div class="input-group align-middle">
        <div class="tooltip" data-tip={`ADDRESS: TO APPROVE`}>
          <input
            type="text"
            placeholder="Address approving..."
            class="input input-bordered align-middle "
            bind:value={approveAddress}
          />
        </div>
        &nbsp;
        <div class="tooltip" data-tip={`APPROVED AMOUNT`}>
          <input
            type="text"
            placeholder="Amount approving..."
            class="input input-bordered align-middle "
            bind:value={approveAmount}
          />
        </div>
        &nbsp;&nbsp;&nbsp;&nbsp;
        <div
          class="tooltip"
          data-tip="APPROVE AN AMOUNT OF YOUR ACCOUNT TO BE SENT BY THE ADDRESS YOU ARE APPROVING"
        >
          {#if sendTransactionApprove}
            <button class="btn loading btn-wide" disabled>Approve</button>
          {:else}
            <button class="btn btn-wide" on:click={ercApprove}
              >Approve amount</button
            >
          {/if}
        </div>
      </div>
      <div class="h-1 m-1" />
    </div>

    <!-- INCREASE ALLOWANCE FUNCTION -->
    <div class="form-control align-middle flex border-b-4">
      <h2 class=" text-xl align-middle underline">
        INCREASE APPROVED ALLOWANCE
      </h2>
      <div class="h-1 m-1" />
      <div class="input-group align-middle">
        <div class="tooltip" data-tip={`ADDRESS: TO INCREASE ALLOWANCE`}>
          <input
            type="text"
            placeholder="Address increasing allowance..."
            class="input input-bordered align-middle "
            bind:value={incrAllowanceAddress}
          />
        </div>
        &nbsp;
        <div class="tooltip" data-tip={`AMOUNT TO INCREASE`}>
          <input
            type="text"
            placeholder="Amount increasing by..."
            class="input input-bordered align-middle "
            bind:value={incrAllowanceAmount}
          />
        </div>
        &nbsp;&nbsp;&nbsp;&nbsp;
        <div
          class="tooltip"
          data-tip="INCREASE THE AMOUNT OF THE ALLOWANCE OF THE SPECIFIC ADDRESS"
        >
          {#if sendTransactionIncrAllowance}
            <button class="btn loading btn-wide" disabled>Increase</button>
          {:else}
            <button class="btn btn-wide" on:click={ercIncreaseAllowance}
              >Increase Allowance</button
            >
          {/if}
        </div>
      </div>
      <div class="h-1 m-1" />
    </div>

    <!-- DECREASE ALLOWANCE FUNCTION -->
    <div class="form-control align-middle flex border-b-4">
      <h2 class=" text-xl align-middle underline">
        DECREASE APPROVED ALLOWANCE
      </h2>
      <div class="h-1 m-1" />
      <div class="input-group align-middle">
        <div class="tooltip" data-tip={`ADDRESS: TO DECREASE ALLOWANCE`}>
          <input
            type="text"
            placeholder="Address decreasing allowance..."
            class="input input-bordered align-middle "
            bind:value={decrAllowanceAddress}
          />
        </div>
        &nbsp;
        <div class="tooltip" data-tip={`AMOUNT TO DECREASE`}>
          <input
            type="text"
            placeholder="Amount decreasing by..."
            class="input input-bordered align-middle "
            bind:value={decrAllowanceAmount}
          />
        </div>
        &nbsp;&nbsp;&nbsp;&nbsp;
        <div
          class="tooltip"
          data-tip="DECREASE THE AMOUNT OF THE ALLOWANCE OF THE SPECIFIC ADDRESS"
        >
          {#if sendTransactionDecrAllowance}
            <button class="btn loading btn-wide" disabled>Decrease</button>
          {:else}
            <button class="btn btn-wide" on:click={ercDecreaseAllowance}
              >Decrease Allowance</button
            >
          {/if}
        </div>
      </div>
      <div class="h-1 m-1" />
    </div>

    <!-- TRANSFER FROM ALLOWANCE FUNCTION -->
    <div class="form-control align-middle flex border-b-4 justify-items-start">
      <h2 class=" text-xl align-middle underline">
        TRANSFER AN APPROVED ALLOWANCE
      </h2>
      <div class="h-1 m-1" />
      <div class="tooltip flex float-left" data-tip={`ADDRESS: FROM ALLOWANCE`}>
        <input
          type="text"
          placeholder="Address using allowance..."
          class="input input-bordered align-middle "
          bind:value={trasnferFromFrom}
        />
      </div>

      <div class="input-group align-middle">
        &nbsp;
        <div class="tooltip" data-tip={`ADDRESS: TO SEND`}>
          <input
            type="text"
            placeholder="Address sending to ..."
            class="input input-bordered align-middle "
            bind:value={trasnferFromTo}
          />
        </div>
        <div class="tooltip" data-tip={`AMOUNT TO DECREASE`}>
          <input
            type="text"
            placeholder="Amount sending..."
            class="input input-bordered align-middle "
            bind:value={transferFromAmount}
          />
        </div>
        &nbsp;&nbsp;&nbsp;&nbsp;
        <div
          class="tooltip"
          data-tip="TRANSFER ALLOWANCE AMOUNT OF TO THE TO ADDRESS"
        >
          {#if sendTransactionTransferFrom}
            <button class="btn loading btn-wide" disabled>Transfer From</button>
          {:else}
            <button class="btn btn-wide" on:click={ercTransferFrom}
              >Transfer allowance</button
            >
          {/if}
        </div>
      </div>
      <div class="h-1 m-1" />
    </div>

    <div class="h-1 m-1" />
  </div>
{/if}
