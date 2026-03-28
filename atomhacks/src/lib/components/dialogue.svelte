<div class="dialogue slide-left">
    <header>[/About the ISS/]</header>
    <div class="note">* Not to scale. The ISS is scaled ~3000x up. The dot is about 150x it's size.</div>
    <div>This is an accurate model of the position of the ISS. It's longitude/latitude and altitude is tracked every 4 seconds, and converted to world coordinates relative to the model of earth.</div>
</div>

<div class="dialoguer slide-right">
    <header>[/Made By Rayhan Alwi/]</header>
    <div>for atom hacks 12 @ 2026</div>
</div>

<style lang="scss">
    .dialogue {
        --height: 225px;
        --pad: 5px;
        position: absolute;
        right: var(--pad);
        top: calc(50% - calc(var(--height) / 2));

        color: var(--primary);
        font-family: "Geist";
        text-align: right;
        width: 200px;
        height: var(--height);

        border-top: 1px solid var(--primary);
        border-bottom: 1px solid var(--primary);
        padding: var(--pad);
    }

    .dialoguer {
        --height: 60px;
        --pad: 5px;
        position: absolute;
        left: var(--pad);
        top: calc(50% - calc(var(--height) / 2));

        color: var(--primary);
        font-family: "Geist";
        text-align: left;
        width: 250px;
        height: var(--height);

        border-top: 1px solid var(--primary);
        border-bottom: 1px solid var(--primary);
        padding: var(--pad);
    }

    .note {
        font-size: .7rem;
        opacity: 0.8;
    }

    header {
        font-size: 1.2rem;
        font-weight: bold;
    }

    .slide-left {
        animation: slide-left 2s ease-out forwards;
    }

    .slide-right {
        animation: slide-right 2s ease-out forwards;
    }

    @keyframes slide-left {
        from {
            clip-path: inset(0 0 0 100%);
        } to {
            clip-path: inset(0 0 0 0);
        }
    }

    @keyframes slide-right {
        from {
            clip-path: inset(0 100% 0 0);
        } to {
            clip-path: inset(0 0 0 0);
        }
    }
</style>