<script>
    import ethersStore from "../store/ethersStore.js"
    import { roundedBalanceEthFromWei, sliceAddress } from "../utils/various.js"
    import { connectToContract, connectSignerToContract } from "../utils/ethersContracts.js"
    import abiFact from "../../../constants/abiFact.json"
    import addressFact from "../../../constants/contractFact20Addresses.json"
    import { onMount } from "svelte"
    import { createEventDispatcher } from "svelte"
    import TrReceipt from "./trReceipt.svelte"

    $: metamaskConnected = window.ethereum ? window.ethereum.isConnected() : false
    $: slicedSigner = sliceAddress($ethersStore.signerAddress)
    $: walletConnected = $ethersStore.walletConnected
    $: balanceSigner = roundedBalanceEthFromWei($ethersStore.balance, 8)
    $: chainId = $ethersStore.selectedChainId

    let chainSupported = false
    let contractToLoad
    let somethingsUp = false
    let transactionError = null
    let ercNewName
    let ercNewSymbol
    let ercNewSupply
    let sendTransactionNewContract
    let transactionReceipt = null
    let contractAddresses = []
    let selectedContract

    onMount(async () => {
        try {
            if (walletConnected == true) {
                await contractToLoadFunctions().catch((error) => {
                    somethingsUp = true
                    transactionError = { error }
                })
                await getERCContracts().catch((error) => {
                    console.log(error)
                })
            }
        } catch (error) {
            console.log(error)
        }
    })

    const dispatch = createEventDispatcher()

    async function contractToLoadFunctions() {
        if (chainId == 3 || chainId == 4 || chainId == 31337) {
            chainSupported = true
            contractToLoad = await connectToContract(addressFact[chainId].toString(), abiFact)
            connectSignerToContract(contractToLoad)
        } else {
            chainSupported = false
            throw new Error(
                "Chain not supported. At the moment only Ropsen and Rinkeby are supported"
            )
        }
    }

    async function ercCreate() {
        sendTransactionNewContract = true
        let tx
        try {
            tx = await contractToLoad.deployNewERC20Token(ercNewName, ercNewSymbol, ercNewSupply)
            transactionReceipt = await tx.wait()
            somethingsUp = true
            //console.log("transactionReceipt: ", transactionReceipt)
            sendTransactionNewContract = false
            await getERCContracts()
            //console.error("vgika trans")
        } catch (error) {
            somethingsUp = true
            transactionError = { error }
            sendTransactionNewContract = false
        }
    }

    async function getERCContracts() {
        try {
            contractAddresses = await contractToLoad.getDeployedERC20()
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

{#if chainSupported}
    <table class=" flex-row w-full">
        <tr>
            <input type="checkbox" id="my-modal-7" class="modal-toggle" />
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
                        <label for="my-modal-7" class="btn" on:click={toggleMessage}>OK</label>
                    </div>
                </div>
            </div>
        </tr>
        <tr>
            <div class="h-1 m-1" />
        </tr>
        <tr>
            <td class="w-1/6 ">
                <div class=" align-middle">
                    <div class="form-control flex float-left">
                        <label class="input-group float-left align-middle">
                            <span>name</span>
                            <input
                                type="text"
                                placeholder="Token name"
                                class="input input-bordered"
                                bind:value={ercNewName}
                            />
                        </label>
                    </div>
                </div>
            </td>
            <td class="w-1/6">
                <div class=" align-middle">
                    <div class="form-control flex float-left">
                        <label class="input-group float-left align-middle">
                            <span>symbol</span>
                            <input
                                type="text"
                                placeholder="Token symbol"
                                class="input input-bordered"
                                bind:value={ercNewSymbol}
                            />
                        </label>
                    </div>
                </div>
            </td>
            <td class="w-1/6">
                <div class=" align-middle">
                    <div class="form-control flex float-left">
                        <label class="input-group float-left align-middle">
                            <span>supply</span>
                            <input
                                type="text"
                                placeholder="Initial Supply"
                                class="input input-bordered"
                                bind:value={ercNewSupply}
                            />
                        </label>
                    </div>
                </div>
            </td>
            <td class="w-1/4  align-middle" />
            <td class="w-1/4  align-middle">
                <select
                    class="select select-primary w-full max-w-xs"
                    bind:value={selectedContract}
                    on:change={() => {
                        //dispatch("contractSelected", selectedContract)
                        ethersStore.resetContract()
                        ethersStore.updateContract(selectedContract)
                    }}
                >
                    <option disabled selected>Which Contract to load?</option>
                    {#each contractAddresses as contractAddress}
                        <option value={contractAddress}>{contractAddress}</option>
                    {/each}
                </select>
            </td>
        </tr>
        <tr>
            <div class="h-1 m-1" />
        </tr>
        <tr>
            <td />
            <td class="  ">
                <div class="tooltip align-middle" data-tip="CREATE THE NEW ERC20 CONTRACT">
                    {#if sendTransactionNewContract}
                        <button class="btn loading btn-wide align-middle" disabled>Create</button>
                    {:else}
                        <button class="btn btn-wide align-middle" on:click={ercCreate}
                            >Create Contract</button
                        >
                    {/if}
                </div>
            </td>
            <td>
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
                            <label for="my-modal-7" class="btn modal-button">see</label>
                        </div>
                    </div>
                    <div class="h-2 m-4" />
                {/if}
            </td>
            <td />
            <td />
        </tr>
        <tr>
            <div class="h-1 m-1" />
        </tr>
    </table>
{/if}
