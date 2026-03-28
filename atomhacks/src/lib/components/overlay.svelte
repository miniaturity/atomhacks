<script lang="ts">
    import type { Position } from "$lib/types/types";

    let { active, issPosition, position }: {
        active: boolean;
        issPosition: [number, number];
        position: Position;
    } = $props();


</script>

{#if active}
    <div class="iss-info" style="left: {issPosition[0]}px; top: {issPosition[1]}px;">
        asdasdasd
    </div>
{/if}

<style>
    .iss-info {
        position: absolute;
        transform: translate(-50%, -50%);
        pointer-events: none;

        font-size: 12px;
        color: red;
    }
</style>