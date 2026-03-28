<script lang="ts">
    import { onMount } from 'svelte';

    let startTime = $state<string>("...");
    let endTime = $state<string>("...");

    let latitude = $state<number | null>(null);
    let longitude = $state<number | null>(null);

    onMount(() => {getLocation()});

    async function fetchPassTime() {
        if (!latitude || !longitude) return;
        try {
            const res = await fetch(`/api/pass?lat=${latitude}&lon=${longitude}`);
            if (res.ok) {
                const json = await res.json();

                startTime = convertTime(json.start);
                endTime = convertTime(json.end);
            }
        } catch (e) {
            console.error("Failed to fetch pass time ", e);
        }
    }

    function convertTime(ms: number) {
        const date = new Date(ms);
        const options: Intl.DateTimeFormatOptions = {
            hour: 'numeric',
            minute: 'numeric',
        };

        return date.toLocaleTimeString(undefined, options);
    }

    function getLocation() {
        navigator.geolocation.getCurrentPosition(
			(position) => {
				latitude = position.coords.latitude;
				longitude = position.coords.longitude;
                fetchPassTime();
			},
			(err) => {
				console.error(err);
			}
		);
    }

    onMount(() => {
        getLocation();
    })
</script>

<div class="overhead">
    <div>[The ISS will pass overhead at your location]</div>
    <div>[from: {startTime}]</div>
    <div>[to: {endTime}]</div>
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
    }


</style>