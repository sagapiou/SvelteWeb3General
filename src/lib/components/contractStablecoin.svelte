<script>
  import ethersStore from "../store/ethersStore.js";
  import { roundedBalanceEthFromWei, sliceAddress } from "../utils/various.js";
  import {
    connectToContract,
    connectSignerToContract,
  } from "../utils/ethersContracts.js";
  import abiStablecoin from "../../../constants/abiStablecoin.json";
  import abiERC20 from "../../../constants/abiERC.json";
  import addressesStableCoin from "../../../constants/contractStablecoinAddresses.json";
  import { onMount } from "svelte";
  import { createEventDispatcher } from "svelte";
  import TrReceipt from "./trReceipt.svelte";
  import { ethers } from "ethers";

  $: walletConnected = $ethersStore.walletConnected;
  $: chainId = $ethersStore.selectedChainId;

  let chainSupported = false;
  let contractToLoad;
  let contractToLoadERC;
  let somethingsUp = false;
  let transactionError = null;
  let dscMinHealth;
  let dscLiqBonus;
  let dscLiqThresh;
  let dscAddressSliced;
  let dscAddress;
  let collateralTokens = [];

  let collateralToken;

  let hfCalculation;
  let hfCollateralUSD;
  let hfDSCMinted;

  let hfAddress;
  let hfAddressToSearch;

  let colAddress;
  let colAddressToSearch;
  let colAddressWei;
  let colAddressDsc;
  let colAddressDscWei;

  let sendTransactionDepositAndMint = false;
  let dmTokenCollateralAddress;
  let dmAmountCollateral;
  let dmAmountDSCToMint;

  let sendTransactionRedeemAndBurn = false;
  let rbTokenCollateralAddress;
  let rbAmountCollateral;
  let rbAmountDSCToMint;

  let sendTransactionDeposit = false;
  let dTokenCollateralAddress;
  let dAmountCollateral;

  let sendTransactionRedeem = false;
  let rTokenCollateralAddress;
  let rAmountCollateral;

  let cbAddress;
  let cbBalance;
  let cbBalanceWei;
  let cbToken;

  let sendTransactionMint = false;
  let mintAmountDsc;

  let sendTransactionBurn = false;
  let burnAmountDsc;

  let nftTokenSelected;
  let nftTokenSelectedStatus;
  let tokenStatus;
  let tokenStatusId;
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
  let selectedTokenUri;
  let selectedTokenUriImage;
  let nftTokenSelectedChangeState;

  onMount(() => {
    try {
      if (chainId == 11155111 || chainId == 31337) {
        chainSupported = true;
        if (walletConnected == true) {
          console.log(addressesStableCoin);
          contractAddresses = addressesStableCoin[chainId];
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
    contractToLoad = await connectToContract(selectedContract, abiStablecoin);
    connectSignerToContract(contractToLoad);
    await getInitialData().catch((error) => {
      console.log(error);
    });
    contractSelected = true;
  }

  async function getInitialData() {
    await getLiqThresh();
    await getDscAddress();
    await getLiqBonus();
    await getContractBalance();
    await getMinHealthFactor();
    await getCollateralTokens();
    dscAddressSliced = sliceAddress(dscAddress);
  }

  function getPercentageOf(valueToShow) {
    return valueToShow / 10e15;
  }

  async function refreshContractData() {
    await getContractBalance();
  }

  async function getLiqThresh() {
    try {
      dscLiqThresh = await contractToLoad.getLiquidationThreshold();
    } catch (error) {
      somethingsUp = true;
      transactionError = { error };
    }
  }

  async function getDscAddress() {
    try {
      dscAddress = await contractToLoad.getDsc();
    } catch (error) {
      somethingsUp = true;
      transactionError = { error };
    }
  }

  async function getLiqBonus() {
    try {
      dscLiqBonus = await contractToLoad.getLiquidationBonus();
    } catch (error) {
      somethingsUp = true;
      transactionError = { error };
    }
  }

  async function getMinHealthFactor() {
    try {
      dscMinHealth = getPercentageOf(await contractToLoad.getMinHealthFactor());
    } catch (error) {
      somethingsUp = true;
      transactionError = { error };
    }
  }

  async function getCollateralTokens() {
    try {
      collateralTokens = await contractToLoad.getCollateralTokens();
    } catch (error) {
      somethingsUp = true;
      transactionError = { error };
    }
  }

  async function calculateHF() {
    try {
      hfCalculation = getPercentageOf(
        await contractToLoad.calculateHealthFactor(hfDSCMinted, hfCollateralUSD)
      );
    } catch (error) {
      somethingsUp = true;
      transactionError = { error };
    }
  }

  async function getHF() {
    try {
      hfAddress = getPercentageOf(
        await contractToLoad.getHealthFactor(hfAddressToSearch)
      );
    } catch (error) {
      somethingsUp = true;
      transactionError = { error };
    }
  }

  async function getColUSD() {
    try {
      [colAddressDscWei, colAddressWei] =
        await contractToLoad.getAccountInformation(colAddressToSearch);
      colAddress = roundedBalanceEthFromWei(colAddressWei, 18);
      colAddressDsc = roundedBalanceEthFromWei(colAddressDscWei, 18);
    } catch (error) {
      somethingsUp = true;
      transactionError = { error };
    }
  }

  async function getCollateralBalanceOfUser() {
    try {
      cbBalanceWei = await contractToLoad.getCollateralBalanceOfUser(
        cbAddress,
        cbToken
      );
      cbBalance = ethers.utils.formatEther(cbBalanceWei);
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

  async function depositAndMint() {
    try {
      sendTransactionDepositAndMint = true;
      let tx;
      tx = await contractToLoad.depositCollateralAndMintDSC(
        dmTokenCollateralAddress,
        dmAmountCollateral,
        ethers.utils.parseUnits(dmAmountDSCToMint, "ether")
      );
      transactionReceipt = await tx.wait();
      somethingsUp = true;
      sendTransactionDepositAndMint = false;
    } catch (error) {
      somethingsUp = true;
      transactionError = { error };
      sendTransactionDepositAndMint = false;
    }
  }

  async function RedeemAndBurn() {
    try {
      sendTransactionRedeemAndBurn = true;
      let tx1, tx2;
      let burnUsd = ethers.utils.parseUnits(rbAmountDSCToMint, "ether");
      let burnCol = ethers.utils.parseUnits(rbAmountCollateral, "ether");
      contractToLoadERC = await connectToContract(dscAddress, abiERC20);
      tx1 = await contractToLoadERC.increaseAllowance(
        selectedContract,
        burnUsd
      );
      transactionReceipt = await tx1.wait();

      tx2 = await contractToLoad.redeemCollateralForDsc(
        rbTokenCollateralAddress,
        burnCol,
        burnUsd
      );
      transactionReceipt = await tx2.wait();
      somethingsUp = true;
      sendTransactionRedeemAndBurn = false;
    } catch (error) {
      somethingsUp = true;
      transactionError = { error };
      sendTransactionRedeemAndBurn = false;
    }
  }

  async function deposit() {
    try {
      sendTransactionDeposit = true;
      let tx;
      console.log(
        dTokenCollateralAddress,
        ethers.utils.parseUnits(dAmountCollateral, "ether")
      );
      tx = await contractToLoad.depositCollateral(
        dTokenCollateralAddress,
        ethers.utils.parseUnits(dAmountCollateral, "ether")
      );
      transactionReceipt = await tx.wait();
      somethingsUp = true;
      //console.log("transactionReceipt: ", transactionReceipt)
      sendTransactionDeposit = false;
      //console.error("vgika transaction")
    } catch (error) {
      somethingsUp = true;
      transactionError = { error };
      sendTransactionDeposit = false;
    }
  }

  async function redeem() {
    try {
      sendTransactionRedeem = true;
      let tx;
      tx = await contractToLoad.redeemCollateral(
        rTokenCollateralAddress,
        ethers.utils.parseUnits(rAmountCollateral, "ether")
      );
      transactionReceipt = await tx.wait();
      somethingsUp = true;
      //console.log("transactionReceipt: ", transactionReceipt)
      sendTransactionRedeem = false;
      //console.error("vgika transaction")
    } catch (error) {
      somethingsUp = true;
      transactionError = { error };
      sendTransactionRedeem = false;
    }
  }

  async function mintDsc() {
    try {
      sendTransactionMint = true;
      let tx;
      tx = await contractToLoad.mintDSC(
        ethers.utils.parseUnits(mintAmountDsc, "ether")
      );
      transactionReceipt = await tx.wait();
      somethingsUp = true;
      //console.log("transactionReceipt: ", transactionReceipt)
      sendTransactionMint = false;
      //console.error("vgika transaction")
    } catch (error) {
      somethingsUp = true;
      transactionError = { error };
      sendTransactionMint = false;
    }
  }

  async function burnDscApproved() {
    try {
      sendTransactionBurn = true;
      let tx1, tx2;
      let burnUsd = ethers.utils.parseUnits(burnAmountDsc, "ether");
      contractToLoadERC = await connectToContract(dscAddress, abiERC20);
      tx1 = await contractToLoadERC.increaseAllowance(
        selectedContract,
        burnUsd
      );
      transactionReceipt = await tx1.wait();

      tx2 = await contractToLoad.burnDsc(burnUsd);
      transactionReceipt = await tx2.wait();
      somethingsUp = true;
      //console.log("transactionReceipt: ", transactionReceipt)
      sendTransactionBurn = false;
      //console.error("vgika transaction")
    } catch (error) {
      somethingsUp = true;
      transactionError = { error };
      sendTransactionBurn = false;
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
            <div class="stat-title">M.H.F.</div>
            <div class="stat-desc font-extrabold">{dscMinHealth} %</div>
            <div class="stat-desc">Minimum Health Factor</div>
            <div class="stat-desc">(ratio stablecoin vs collateral)</div>
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
            <div class="stat-title">Liquidation</div>
            <div class="stat-desc font-extrabold">{dscLiqThresh} %</div>
            <div class="stat-desc">Liquidation Threshold</div>
            <div class="stat-desc">(% ration of liq. to occur)</div>
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
            <div class="stat-title">Liq. Bonus</div>
            <div class="stat-desc font-extrabold">{dscLiqBonus} %</div>
            <div class="stat-desc">Liquidation Bonus</div>
            <div class="stat-desc">(% bonus you get for liquidating)</div>
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
            <div class="stat-title">DSC</div>
            <div class="stat-desc font-extrabold">{dscAddressSliced}</div>
            <div class="stat-desc">DSC Address</div>
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
            <div class="stat-title">Collateral Addresses:</div>
            <div class="stat-desc font-extrabold">{collateralToken}</div>
            <div class="stat-desc">
              <select
                class="select select-primary w-full max-w-xs"
                bind:value={collateralToken}
              >
                <option disabled selected>Collateral Addresses</option>
                {#each collateralTokens as collateralToken}
                  <option value={collateralToken}>{collateralToken}</option>
                {/each}
              </select>
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
            <div class="stat-title">Collateral Balance:</div>

            <div class="stat-desc font-extrabold">
              {cbBalance}
            </div>

            <tr>
              <div class="join stat-actions">
                <div>
                  <input
                    class="input input-bordered join-item"
                    placeholder="Address"
                    bind:value={cbAddress}
                  />
                </div>
                <div class="stat-desc">
                  <select
                    class="select select-primary w-full max-w-xs"
                    bind:value={cbToken}
                  >
                    <option disabled selected>Collateral</option>
                    {#each collateralTokens as cbToken}
                      {#if cbToken == 0x2b77278636a67550108a4ae30b89401a9758a983}
                        <option value={cbToken}>Wrapped Eth</option>
                      {:else if cbToken == 0x22c3e8695ccf9bdcb134ebbceac653ce7d6e1e76}
                        <option value={cbToken}>Wrapped Btc</option>
                      {:else}
                        <option value={cbToken}>{cbToken}</option>
                      {/if}
                    {/each}
                  </select>
                </div>
              </div>
              <div class="indicator stat-actions">
                <button
                  class="btn join-item btn-sm"
                  on:click={getCollateralBalanceOfUser}>Search</button
                >
              </div>
            </tr>
          </div>
          <div class="stat">
            <div class="stat-title">Total Collateral (USD):</div>

            <div class="stat-desc font-extrabold">
              {colAddress} USD<br />
              {colAddressDsc} saga USD
            </div>
            <tr>
              <div class="join stat-actions">
                <div>
                  <input
                    class="input input-bordered join-item"
                    placeholder="Address"
                    bind:value={colAddressToSearch}
                  />
                </div>
              </div>
              <div class="indicator stat-actions">
                <button class="btn join-item btn-sm" on:click={getColUSD}
                  >Search</button
                >
              </div>
            </tr>
          </div>
          <div class="stat">
            <div class="stat-title">Health Factor:</div>

            <div class="stat-desc font-extrabold">
              {hfAddress} %
            </div>
            <tr>
              <div class="join stat-actions">
                <div>
                  <input
                    class="input input-bordered join-item"
                    placeholder="Address"
                    bind:value={hfAddressToSearch}
                  />
                </div>
              </div>
              <div class="indicator stat-actions">
                <button class="btn join-item btn-sm" on:click={getHF}
                  >Search</button
                >
              </div>
            </tr>
          </div>
          <div class="stat">
            <div class="stat-title">Health Factor Calculation:</div>

            <div class="stat-desc font-extrabold">
              {hfCalculation} %
            </div>

            <tr>
              <div class="join stat-actions">
                <div>
                  <input
                    class="input input-bordered join-item"
                    placeholder="Stablecoin Minted"
                    bind:value={hfDSCMinted}
                  />
                </div>
                <div>
                  <input
                    class="input input-bordered join-item"
                    placeholder="USD Collateral"
                    bind:value={hfCollateralUSD}
                  />
                </div>
              </div>
              <div class="indicator stat-actions">
                <button class="btn join-item btn-sm" on:click={calculateHF}
                  >Calculate</button
                >
              </div>
            </tr>
          </div>
        </div>
      </tr>
      <tr>
        <div class="h-1 m-1" />
      </tr>
      <tr>
        <div class="stats">
          <div class="stat">
            <div class="stat-title">Deposit Collateral</div>
            <div class="join stat-actions">
              <div>
                <input
                  class="input input-bordered join-item"
                  placeholder="Collateral (Eth/Btc)"
                  bind:value={dAmountCollateral}
                />
              </div>
            </div>
            <div class="stat-desc">
              <select
                class="select select-primary w-full max-w-xs"
                bind:value={dTokenCollateralAddress}
              >
                <option disabled selected>Collateral To Use</option>
                {#each collateralTokens as dTokenCollateralAddress}
                  {#if dTokenCollateralAddress == 0x2b77278636a67550108a4ae30b89401a9758a983}
                    <option value={dTokenCollateralAddress}>Wrapped Eth</option>
                  {:else if dTokenCollateralAddress == 0x22c3e8695ccf9bdcb134ebbceac653ce7d6e1e76}
                    <option value={dTokenCollateralAddress}>Wrapped Btc</option>
                  {:else}
                    <option value={dTokenCollateralAddress}
                      >{dTokenCollateralAddress}</option
                    >
                  {/if}
                {/each}
              </select>
            </div>
            <div>
              {#if !sendTransactionDeposit}
                <button id="fundMeBtn" class="btn join-item" on:click={deposit}
                  >Deposit</button
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
            <div class="stat-title">Redeem Collateral</div>
            <div class="join stat-actions">
              <div>
                <input
                  class="input input-bordered join-item"
                  placeholder="Collateral (Eth/Btc)"
                  bind:value={rAmountCollateral}
                />
              </div>
            </div>
            <div class="stat-desc">
              <select
                class="select select-primary w-full max-w-xs"
                bind:value={rTokenCollateralAddress}
              >
                <option disabled selected>Collateral To Use</option>
                {#each collateralTokens as rTokenCollateralAddress}
                  {#if rTokenCollateralAddress == 0x2b77278636a67550108a4ae30b89401a9758a983}
                    <option value={rTokenCollateralAddress}>Wrapped Eth</option>
                  {:else if rTokenCollateralAddress == 0x22c3e8695ccf9bdcb134ebbceac653ce7d6e1e76}
                    <option value={rTokenCollateralAddress}>Wrapped Btc</option>
                  {:else}
                    <option value={rTokenCollateralAddress}
                      >{rTokenCollateralAddress}</option
                    >
                  {/if}
                {/each}
              </select>
            </div>
            <div>
              {#if !sendTransactionRedeem}
                <button id="fundMeBtn" class="btn join-item" on:click={redeem}
                  >Redeem</button
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
            <div class="stat-title">Mint SSUSD</div>
            <div class="join stat-actions">
              <div>
                <input
                  class="input input-bordered join-item"
                  placeholder="MINT SSUSDs"
                  bind:value={mintAmountDsc}
                />
              </div>
            </div>

            <div>
              {#if !sendTransactionMint}
                <button id="fundMeBtn" class="btn join-item" on:click={mintDsc}
                  >MINT</button
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
            <div class="stat-title">Burn SSUSD</div>
            <div class="join stat-actions">
              <div>
                <input
                  class="input input-bordered join-item"
                  placeholder="BURN SSUSDs"
                  bind:value={burnAmountDsc}
                />
              </div>
            </div>

            <div>
              {#if !sendTransactionBurn}
                <button
                  id="fundMeBtn"
                  class="btn join-item"
                  on:click={burnDscApproved}>BURN</button
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
            <div class="stat-title">Deposit and Mint</div>
            <div class="join stat-actions">
              <div>
                <input
                  class="input input-bordered join-item"
                  placeholder="Collateral (Eth/Btc)"
                  bind:value={dmAmountCollateral}
                />
                <input
                  class="input input-bordered join-item"
                  placeholder="StableCoin Mint"
                  bind:value={dmAmountDSCToMint}
                />
              </div>
            </div>
            <div class="stat-desc">
              <select
                class="select select-primary w-full max-w-xs"
                bind:value={dmTokenCollateralAddress}
              >
                <option disabled selected>Collateral To Use</option>
                {#each collateralTokens as dmTokenCollateralAddress}
                  {#if dmTokenCollateralAddress == 0x2b77278636a67550108a4ae30b89401a9758a983}
                    <option value={dmTokenCollateralAddress}>Wrapped Eth</option
                    >
                  {:else if dmTokenCollateralAddress == 0x22c3e8695ccf9bdcb134ebbceac653ce7d6e1e76}
                    <option value={dmTokenCollateralAddress}>Wrapped Btc</option
                    >
                  {:else}
                    <option value={dmTokenCollateralAddress}
                      >{dmTokenCollateralAddress}</option
                    >
                  {/if}
                {/each}
              </select>
            </div>
            <div>
              {#if !sendTransactionDepositAndMint}
                <button
                  id="fundMeBtn"
                  class="btn join-item"
                  on:click={depositAndMint}>Deposit and Mint</button
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
            <div class="stat-title">Redeem Collateral and Burn SSUSD</div>
            <div class="join stat-actions">
              <div>
                <input
                  class="input input-bordered join-item"
                  placeholder="Collateral (Eth/Btc)"
                  bind:value={rbAmountCollateral}
                />
                <input
                  class="input input-bordered join-item"
                  placeholder="StableCoin Mint"
                  bind:value={rbAmountDSCToMint}
                />
              </div>
            </div>
            <div class="stat-desc">
              <select
                class="select select-primary w-full max-w-xs"
                bind:value={rbTokenCollateralAddress}
              >
                <option disabled selected>Collateral To Use</option>
                {#each collateralTokens as rbTokenCollateralAddress}
                  {#if rbTokenCollateralAddress == 0x2b77278636a67550108a4ae30b89401a9758a983}
                    <option value={rbTokenCollateralAddress}>Wrapped Eth</option
                    >
                  {:else if rbTokenCollateralAddress == 0x22c3e8695ccf9bdcb134ebbceac653ce7d6e1e76}
                    <option value={rbTokenCollateralAddress}>Wrapped Btc</option
                    >
                  {:else}
                    <option value={rbTokenCollateralAddress}
                      >{rbTokenCollateralAddress}</option
                    >
                  {/if}
                {/each}
              </select>
            </div>
            <div>
              {#if !sendTransactionRedeemAndBurn}
                <button
                  id="fundMeBtn"
                  class="btn join-item"
                  on:click={RedeemAndBurn}>Redeem And Burn</button
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
