<script>
  import ContractgetData from "./contractErc20GetData.svelte";
  import ContractSetData from "./contractErc20SetData.svelte";
  import ContractFactory from "./contractErc20Factory.svelte";
  import ethersStore from "../store/ethersStore.js";
  import ContractFundMe from "./contractFundMe.svelte";
  import ContractLottery from "./contractLottery.svelte";
  import ContractERC721 from "./contractERC721General.svelte";
  import ContractStableCoin from "./contractStablecoin.svelte";

  export let selector;

  $: contractERC20Address =
    $ethersStore.contract == null || $ethersStore.contract == ""
      ? ""
      : $ethersStore.contract;
  $: changedContract = $ethersStore.changedContract
    ? $ethersStore.changedContract
    : false;
  // $: console.log("contractERC20Address", contractERC20Address)
  // $: console.log("ethersStore", $ethersStore.changedContract)
  // $: console.log("changedContract", changedContract)

  // function selectedContract(event) {
  //     contractERC20Address = event.detail
  //     console.log("contractERC20Address", contractERC20Address)
  //     selector = selector
  // }
</script>

{#if selector == 1}
  <div class="flex flex-col w-full">
    <div class="grid h-35 card bg-base-300 rounded-box place-items-center">
      <!-- <ContractFactory on:contractSelected={selectedContract} /> -->
      <ContractFactory />
    </div>
    <div class="divider" />
  </div>
{/if}

{#if selector == 1 || selector == 2}
  <div class="flex flex-col w-full lg:flex-row">
    <div class="grid flex-grow card bg-base-300 rounded-box place-items-center">
      {#if selector == 1 && contractERC20Address != ""}
        {#if changedContract}
          <ContractgetData contractERC20="" />
        {:else}
          <ContractgetData contractERC20="" />
        {/if}
      {:else if selector == 2}
        <ContractgetData contractERC20="saga" />
      {/if}
    </div>
    <div class="divider lg:divider-horizontal">-</div>
    <div class="grid flex-grow card bg-base-300 rounded-box place-items-center">
      {#if selector == 1 && contractERC20Address != ""}
        {#if changedContract}
          <ContractSetData contractERC20="" />
        {:else}
          <ContractSetData contractERC20="" />
        {/if}
      {:else if selector == 2}
        <ContractSetData contractERC20="saga" />
      {/if}
    </div>
  </div>
{/if}

{#if selector == 3}
  <div class="flex flex-col w-full">
    <div class="grid h-200 card bg-base-300 rounded-box place-items-center">
      <ContractFundMe />
    </div>
  </div>
{/if}

{#if selector == 4}
  <div class="flex flex-col w-full">
    <div class="grid h-200 card bg-base-300 rounded-box place-items-center">
      <ContractLottery />
    </div>
  </div>
{/if}

{#if selector == 5}
  <div class="flex flex-col w-full">
    <div class="grid h-200 card bg-base-300 rounded-box place-items-center">
      <ContractERC721 />
    </div>
  </div>
{/if}

{#if selector == 6}
  <div class="flex flex-col w-full">
    <div class="grid h-200 card bg-base-300 rounded-box place-items-center">
      <ContractStableCoin />
    </div>
  </div>
{/if}
