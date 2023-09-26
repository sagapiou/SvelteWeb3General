<script>
    import connectWallet from "../utils/connectWallet.js"
    import ethersStore from "../store/ethersStore.js"
    import { ethers } from "ethers"

    async function connect() {
        await connectWallet()
    }

    $: metamaskConnected = window.ethereum ? window.ethereum.isConnected() : false
</script>

{#if $ethersStore.walletConnected == false}
    <button class="btn btn-wide align-middle" on:click={connect}>Connect</button>
{/if}
