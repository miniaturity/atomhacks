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
        <div class="dot"></div>
        <div class="ii-content">
            [ISS]
        </div>
    </div>
{/if}

<style>
    .iss-info {
        position: absolute;
        transform: translate(-50%, -50%);
        pointer-events: none;

        font-size: 12px;
        color: var(--primary);
        font-family: "Geist";
    }

    .ii-content {
        position: absolute;
        left: 15px; top: 15px;
        color: var(--primary);
    }

    .dot {
        position: absolute;
        left: 0; top: 0;
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
</style>