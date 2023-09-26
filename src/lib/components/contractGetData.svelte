<script>
    import ethersStore from "../store/ethersStore.js"
    import { ethers } from "ethers"
    import { roundedBalanceEthFromWei, sliceAddress } from "../utils/various.js"
    import { connectToContract, connectSignerToContract } from "../utils/ethersContracts.js"
    import abiSaga from "../../../constants/abiERC.json"
    import addressSaga from "../../../constants/contractERC20Addresses.json"
    import { onMount } from "svelte"
    import TrReceipt from "./trReceipt.svelte"

    $: metamaskConnected = window.ethereum ? window.ethereum.isConnected() : false
    $: slicedSigner = sliceAddress($ethersStore.signerAddress)
    $: walletConnected = $ethersStore.walletConnected
    $: balanceSigner = roundedBalanceEthFromWei($ethersStore.balance, 8)
    $: chainId = $ethersStore.selectedChainId

    export let contractERC20
    let contractAddress
    let contractToLoad
    let chainSupported = false
    let ercName
    let ercSymbol
    let ercDecimals = 1
    let ercTotalSupply
    let balanceOf = ""
    let addressOf
    let balanceOfDec = ""
    let allowance = ""
    let allowanceDec = ""
    let allowanceOwner, allowanceSpender
    let somethingsUp = false
    let transactionError = null

    onMount(async () => {
        if (walletConnected == true && contractERC20 != null) {
            ethersStore.resetContractChanged()
            await contractToLoadFunctions().catch((error) => {
                somethingsUp = true
                transactionError = { error }
            })
            await getInitialData().catch((error) => {
                console.log(error)
            })
        }
    })

    async function contractToLoadFunctions() {
        if (chainId == 3 || chainId == 4 || chainId == 31337) {
            chainSupported = true
            if (contractERC20 == "saga") {
                contractAddress = addressSaga[chainId].toString()
            } else {
                contractAddress = $ethersStore.contract
            }
            console.log(contractAddress)
            contractToLoad = await connectToContract(contractAddress, abiSaga)
            connectSignerToContract(contractToLoad)
        } else {
            chainSupported = false
            throw new Error(
                "Chain not supported. At the moment only Ropsen and Rinkeby are supported"
            )
        }
    }

    async function getInitialData() {
        ercName = await contractToLoad.name()
        ercSymbol = await contractToLoad.symbol()
        ercDecimals = await contractToLoad.decimals()
        ercTotalSupply = await contractToLoad.totalSupply()
    }

    async function ercGetName() {
        // run specific functions of the contract that are with no state change
        ercName = await contractToLoad.name()
    }

    async function ercGetSymbol() {
        ercSymbol = await contractToLoad.symbol()
    }

    async function ercGetDecimals() {
        ercDecimals = await contractToLoad.decimals()
    }

    async function ercGetTotalSupply() {
        ercTotalSupply = await contractToLoad.totalSupply()
    }

    async function ercGetBalanceOf() {
        try {
            balanceOf = await contractToLoad.balanceOf(addressOf)
            balanceOfDec = (parseInt(balanceOf) / 10 ** ercDecimals)
                .toString()
                .replace(/\B(?=(\d{3})+(?!\d))/g, ",")
        } catch (error) {
            somethingsUp = true
            transactionError = { error }
        }
    }

    async function ercGetAllowance() {
        try {
            allowance = await contractToLoad.allowance(allowanceOwner, allowanceSpender)
            allowanceDec = (parseInt(allowance) / 10 ** ercDecimals)
                .toString()
                .replace(/\B(?=(\d{3})+(?!\d))/g, ",")
        } catch (error) {
            somethingsUp = true
            transactionError = { error }
        }
    }

    function toggleMessage() {
        somethingsUp = false
        transactionError = null
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
        <div class="h-2 m-4" />
        <h2 class="text-xl">ERC20 DATA CALLS (NO GAS COST)</h2>
        <div class="h-2 m-4" />
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
                <div class="stat-title font-bold">{ercTotalSupply}</div>
                <!-- <div class="stat-actions">
                    <button class="btn btn-sm btn-success" on:click={ercGetTotalSupply}
                        >REQUEST TOTAL SUPPLY</button
                    >
                </div> -->
            </div>
        </div>
        <div class="h-2 m-4" />

        <div class="form-control align-middle flex border-8">
            <div class="input-group align-middle">
                <div class="tooltip" data-tip={`ADDRESS: TO RETURN AMOUNT OF ${ercName} COINS`}>
                    <input
                        type="text"
                        placeholder="Address to search..."
                        class="input input-bordered align-middle "
                        bind:value={addressOf}
                    />
                </div>
                &nbsp;
                <button class="btn btn-square align-middle" on:click={ercGetBalanceOf}>
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        class="h-6 w-6"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        ><path
                            stroke-linecap="round"
                            stroke-linejoin="round"
                            stroke-width="2"
                            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                        /></svg
                    >
                </button>
                &nbsp;&nbsp;&nbsp;&nbsp;
                <div class="tooltip" data-tip="ADDRESS BALANCE">
                    <h2 class="text-xl">
                        {balanceOf}
                        <span class="badge badge-outline">balance</span>
                    </h2>
                </div>
                &nbsp;&nbsp;&nbsp;&nbsp;
                <div class="tooltip" data-tip="ADDRESS BALANCE WITHOUT THE DECIMALS">
                    <h2 class="text-xl">
                        {balanceOfDec}
                        <span class="badge badge-outline">balance/decimals</span>
                    </h2>
                </div>
            </div>
        </div>
        <div class="h-2 m-4" />

        <div class="form-control align-middle border-8 flex">
            <div class="input-group align-middle">
                <div class="tooltip" data-tip={`ADDRESS: ALLOWANCE OWNER`}>
                    <input
                        type="text"
                        placeholder="Address of owner..."
                        class="input input-bordered align-middle "
                        bind:value={allowanceOwner}
                    />
                </div>
                &nbsp;
                <div class="tooltip" data-tip={`ADDRESS: ALLOWANCE SPENDER`}>
                    <input
                        type="text"
                        placeholder="Address of spender..."
                        class="input input-bordered align-middle "
                        bind:value={allowanceSpender}
                    />
                </div>
                &nbsp;
                <button class="btn btn-square align-middle" on:click={ercGetAllowance}>
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        class="h-6 w-6"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        ><path
                            stroke-linecap="round"
                            stroke-linejoin="round"
                            stroke-width="2"
                            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                        /></svg
                    >
                </button>
                &nbsp;&nbsp;&nbsp;&nbsp;
                <div class="tooltip" data-tip="ADDRESS BALANCE">
                    <h2 class="text-xl">
                        {allowance}
                        <span class="badge badge-outline">balance</span>
                    </h2>
                </div>
                &nbsp;&nbsp;&nbsp;&nbsp;
                <div class="tooltip" data-tip="ADDRESS BALANCE WITHOUT THE DECIMALS">
                    <h2 class="text-xl">
                        {allowanceDec}
                        <span class="badge badge-outline">balance/decimals</span>
                    </h2>
                </div>
            </div>
        </div>

        <div class="h-2 m-4" />
    </div>
{/if}
