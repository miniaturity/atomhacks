<script lang="ts">
    import Earth from "$lib/components/earth.svelte";
  import type { Position } from "$lib/types/types";
  import { onMount } from "svelte";

  const RATE_LIMIT_MS = 1000; 

  let lastReqTimestamp = $state<number>(Date.now());
  let capturedPosition = $state<Position>();
  let position = $state<Position>();

  async function update() {
    if (Date.now() - lastReqTimestamp <= RATE_LIMIT_MS) return;
    const res = await fetch("https://api.wheretheiss.at/v1/satellites/25544");
    if (!res.ok) {
      throw new Error("Request for update failed.");
    } else {
      const data = await res.json() as Position;
      capturedPosition = data;
      lastReqTimestamp = Date.now();
    }
  }

  async function requestCapture(timestamp: number) {
    if (Date.now() - lastReqTimestamp <= RATE_LIMIT_MS) return;
    const res = await fetch(`https://api.wheretheiss.at/v1/satellites/25544/positions?timestamps=${timestamp}&units=kilometers`);
  
    if (!res.ok) {
      throw new Error("Request for capture failed. Timestamp: " + timestamp);
    } else {
      const data = await res.json() as Position;
      capturedPosition = data;
      lastReqTimestamp = Date.now();
    }
  }
  

  onMount(() => {

  });


</script>
<div class="page">
  <Earth />
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

    width: 100vw; height: 100vh;
  }
</style>        