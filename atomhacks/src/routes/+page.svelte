<script lang="ts">
 import Earth from "$lib/components/earth.svelte";
    import Interface from "$lib/components/interface.svelte";
    import Overlay from "$lib/components/overlay.svelte";
    import type { People, Position } from "$lib/types/types";
    import { onMount } from "svelte";

    let people = $state<People | undefined>();
    let position = $state<Position | undefined>();
    let issPosition = $state<[number, number] | null>(null);
    let overlayActive = $state<boolean>(false);

    async function fetchSat() {
        try {
          const res = await fetch("https://api.wheretheiss.at/v1/satellites/25544");
          if (res.ok) position = await res.json() as Position;
        } catch (e) {
          console.error("ISS fetch failed ", e);
        }
    }

    async function fetchCrew() {
      try {
        const res = await fetch("http://api.open-notify.org/astros.json");
        if (res.ok) people = await res.json() as People;
      } catch (e) {
        console.error("Astro fetch failed ", e);
      }
    }

    onMount(() => {
        fetchSat();
        fetchCrew();
        const interval = setInterval(fetchSat, 2500);
        return () => clearInterval(interval);
    });

</script>
<div class="page">
  {#if position && people}
    <Interface {position} {people}/>
  {/if}
  <Earth {position} bind:issPosition bind:overlayActive />
  {#if issPosition && position}
    <Overlay
        active={overlayActive}
        {issPosition}
        {position}
    />

    {#if !overlayActive}
      <div class="iss-pos" style="left: {issPosition[0]}px; top: {issPosition[1]}px;">
        
      </div>
    {/if}
  {/if}
</div>
<style lang="scss">
  :global(:root) {
    --bg: #070D0D;
    --primary: #ff0000;
  }

  :global(body) {
    margin: 0; padding: 0;
    background: var(--bg);
  }
  .page {
    position: relative;
    width: 100vw; height: 100vh;
    overflow: hidden;
  }

  .iss-pos {
    position: absolute;
    pointer-events: none;
    background-color: var(--primary);
    width: 10px; height: 10px;
    border-radius: 50%;
    transform: translate(-50%, -50%);

    &::before {
      content: '';
      position: absolute;
      background-color: var(--primary);
      width: 10px; height: 10px;
      top: 0; left: 0;
      border-radius: 50%;
      z-index: 2;
      opacity: 0.5;
      transform-origin: center center;
      animation: pulse infinite linear 1s;
    } 
  }

  @keyframes pulse {
    from {
      opacity: 0.8;
      scale: 1;
    } to {
      opacity: 0;
      scale: 2;
    }
  }

  @font-face {
    src: url("$lib/assets/fonts/Geist-Regular.ttf") format("truetype");
    font-family: "Geist";
  }

</style>        