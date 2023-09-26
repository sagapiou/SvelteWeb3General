<script>
  import { onMount } from "svelte";
  import connectWallet from "../utils/connectWallet.js";
  import ethersStore from "../store/ethersStore.js";
  import { ethers } from "ethers";
  import { sliceAddress, roundedBalanceEthFromWei } from "../utils/various.js";
  import { createEventDispatcher } from "svelte";

  const dispatch = createEventDispatcher();

  onMount(async () => {
    await connectWallet();
  });

  //     function copyAddress() {
  //     navigator.clipboard.writeText($selectedAccount)
  // }
  $: metamaskConnected = window.ethereum
    ? window.ethereum.isConnected()
    : false;
  $: slicedSigner = sliceAddress($ethersStore.signerAddress);
  $: balanceSigner = roundedBalanceEthFromWei($ethersStore.balance, 8);
  //  $: balance = $connected && $selectedAccount ? $web3.eth.getBalance($selectedAccount) : ""
</script>

<header class="h-10">
  <div class="navbar bg-base-100 ">
    <div class="flex-1" />

    <div class="flex-none">
      <div class="stats shadow" />
      <div class="flex-none normal-case text-xl font-bold " />
      {#if $ethersStore.walletConnected == true}
        <div class="stats shadow">
          <div class="flex-none">
            <div class="stat">
              <div class="stat-title">BALANCE</div>
              <div class="stat-title font-bold">{balanceSigner}</div>
              <!-- <div class="stat-actions">
                                <button class="btn btn-sm btn-success">Add funds</button>
                            </div> -->
            </div>
          </div>
          <div class="flex-none">
            <div class="stat">
              <div class="stat-title">ADDRESS</div>
              <div class="stat-title font-bold">{slicedSigner}</div>
              <!-- <div class="stat-actions">
                                <button class="btn btn-sm btn-failure">Disconnect</button>
                            </div> -->
            </div>
          </div>
          {#if metamaskConnected == true}
            <div class="flex-none">
              <div class="stat">
                <div class="stat-figure text-secondary">
                  <div class="avatar online">
                    <div class="w-10 rounded-full">
                      <img src="connection.jpg" alt="Connected" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          {/if}
        </div>
      {:else}
        <div class="stats shadow flex-none">
          <div class="flex-none">
            <div class="stat">
              <div class="stat-figure text-secondary">
                <div class="avatar online">
                  <div class="w-12 rounded-full">
                    <img src="noConnection.jpg" alt="Disconnected" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      {/if}
      <div />
    </div>
  </div>
</header>
