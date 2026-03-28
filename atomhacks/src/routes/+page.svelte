<script lang="ts">
 import Earth from "$lib/components/earth.svelte";
    import Overlay from "$lib/components/overlay.svelte";
    import type { Position } from "$lib/types/types";
    import { onMount } from "svelte";

    let position = $state<Position | undefined>();
    let issPosition = $state<[number, number] | null>(null);
    let overlayActive = $state<boolean>(false);

    async function fetchISS() {
        try {
            const res = await fetch("https://api.wheretheiss.at/v1/satellites/25544");
            if (res.ok) position = await res.json() as Position;
        } catch (e) {
            console.error("ISS fetch failed", e);
        }
    }

    onMount(() => {
        fetchISS();
        const interval = setInterval(fetchISS, 2500);
        return () => clearInterval(interval);
    });

</script>
<div class="page">
  <Earth {position} bind:issPosition bind:overlayActive />
  {#if issPosition && position}
      <Overlay
          active={overlayActive}
          {issPosition}
          {position}
      />
    {/if}
</div>
<style lang="scss">
  :global(:root) {
    --bg: #070D0D;
      
  }

  :global(body) {
    margin: 0; padding: 0;
    background: var(--bg);
  }
  .page {
    position: relative;
    width: 100vw; height: 100vh;
  }
</style>        