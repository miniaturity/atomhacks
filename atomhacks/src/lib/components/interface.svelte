<script lang="ts">
    import type { People, Position } from "$lib/types/types";

    let { position, people }: {
        position: Position,
        people: People
    } = $props();

</script>

<div class="interface">
    <header>[ISS Live Position]</header>
    <div class="lat dat">[latitude: {position.latitude}]</div>
    <div class="lon dat">[longitude: {position.longitude}]</div>
    <div class="alt dat">[altitude: {position.altitude} km]</div>
    <div class="time dat">[timestamp: {position.timestamp}]</div>
</div>

<div class="people">
    <header>[ISS Current Crew]</header>
    {#each people.people as person}
        {#if person.craft === "ISS"}
            <div class="dat">
                [{person.name}]
            </div>
        {/if}
    {/each}
</div>

<style lang="scss">
    .interface {
        --pad: 5px;
        position: absolute;
        top: var(--pad); left: var(--pad);

        color: var(--primary);
        font-family: "Geist";
    }
    .people {
        --pad: 5px;
        position: absolute;
        bottom: var(--pad); left: var(--pad);

        color: var(--primary);
        font-family: "Geist";
    }
    header {
        font-size: 1.2rem;
        font-weight: bold;
    }
    .dat {
        font-size: 0.7rem;
    }
</style>