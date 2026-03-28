<script lang="ts">
    import { onMount } from 'svelte';

    let startTime = $state<string>("...");
    let endTime = $state<string>("...");
    let locationLabel = $state<string>("your location");
    let searchQuery = $state<string>("");
    let searching = $state<boolean>(false);
    let error = $state<string | null>(null);
    let showInput = $state<boolean>(false);

    let latitude = $state<number | null>(null);
    let longitude = $state<number | null>(null);

    async function fetchPassTime() {
        if (latitude === null || longitude === null) return;
        startTime = "...";
        endTime = "...";
        error = null;
        try {
            const res = await fetch(`/api/pass?lat=${latitude}&lon=${longitude}`);
            if (res.ok) {
                const json = await res.json();
                startTime = convertTime(json.start * 1000);
                endTime = convertTime(json.end * 1000);
            } else {
                error = "no pass found";
            }
        } catch (e) {
            console.error("Failed to fetch pass time ", e);
            error = "fetch failed";
        }
    }

    function convertTime(ms: number) {
        const date = new Date(ms);
        return date.toLocaleTimeString(undefined, { hour: 'numeric', minute: 'numeric' });
    }

    function useGPS() {
        navigator.geolocation.getCurrentPosition(
            (pos) => {
                latitude = pos.coords.latitude;
                longitude = pos.coords.longitude;
                locationLabel = "your location";
                fetchPassTime();
            },
            (err) => {
                console.error(err);
                error = "GPS unavailable";
            }
        );
    }

    async function searchLocation() {
        if (!searchQuery.trim()) return;
        searching = true;
        error = null;
        try {
            const res = await fetch(
                `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(searchQuery)}&format=json&limit=1`,
                { headers: { 'Accept-Language': 'en' } }
            );
            const results = await res.json();
            if (results.length === 0) {
                error = "location not found";
                searching = false;
                return;
            }
            latitude = parseFloat(results[0].lat);
            longitude = parseFloat(results[0].lon);
            locationLabel = results[0].display_name.split(",").slice(0, 2).join(",").trim();
            showInput = false;
            searchQuery = "";
            await fetchPassTime();
        } catch (e) {
            console.error(e);
            error = "search failed";
        }
        searching = false;
    }

    function handleKeydown(e: KeyboardEvent) {
        if (e.key === "Enter") searchLocation();
        if (e.key === "Escape") { showInput = false; searchQuery = ""; }
    }

    onMount(() => { useGPS(); });
</script>

<div class="overhead">
    <header>[ISS next pass over {locationLabel}]</header>

    {#if error}
        <div class="error">[{error}]</div>
    {:else}
        <div>[from: {startTime}]</div>
        <div>[to: {endTime}]</div>
    {/if}

    <div class="controls">
        {#if showInput}
            <div class="search-row">
                <input
                    type="text"
                    placeholder="city or address..."
                    bind:value={searchQuery}
                    onkeydown={handleKeydown}
                />
                <button onclick={searchLocation} disabled={searching}>
                    {searching ? "..." : "[go]"}
                </button>
                <button onclick={() => { showInput = false; searchQuery = ""; }}>[x]</button>
            </div>
        {:else}
            <button onclick={() => (showInput = true)}>[change location]</button>
            <button onclick={useGPS}>[use GPS]</button>
        {/if}
    </div>
</div>

<style lang="scss">
    .overhead {
        --pad: 5px;
        position: absolute;
        right: var(--pad);
        top: var(--pad);

        color: var(--primary);
        font-family: "Geist";
        text-align: right;
        font-size: 0.85rem;
    }

    .error { opacity: 0.7; }

    .controls { margin-top: 4px; }

    button {
        background: none;
        border: none;
        color: var(--primary);
        font-family: "Geist";
        font-size: 0.75rem;
        cursor: pointer;
        padding: 0 2px;
        opacity: 0.7;
        transition: opacity 0.15s;

        &:hover { opacity: 1; }
        &:disabled { cursor: default; opacity: 0.4; }
    }

    header {
        font-size: 1.2rem;
        font-weight: bold;
    }

    .search-row {
        display: flex;
        align-items: center;
        gap: 4px;
        justify-content: flex-end;

        input {
            background: transparent;
            border: none;
            border-bottom: 1px solid var(--primary);
            color: var(--primary);
            font-family: "Geist";
            font-size: 0.75rem;
            width: 130px;
            text-align: right;
            outline: none;

            &::placeholder { opacity: 0.4; color: var(--primary); }
        }
    }
</style>