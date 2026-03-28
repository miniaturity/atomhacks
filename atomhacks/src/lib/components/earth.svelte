<script lang="ts">
    import { OBJLoader } from 'three/addons/loaders/OBJLoader.js';
    import * as THREE_m from 'three';
    import { onMount } from 'svelte';
    import * as THREE from 'three/webgpu';
    import {
        step,
        normalWorldGeometry,
        output,
        texture,
        vec3,
        vec4,
        normalize,
        positionWorld,
        bumpMap,
        cameraPosition,
        color,
        uniform,
        mix,
        uv,
        max
    } from 'three/tsl';
    import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
    // import { Inspector } from 'three/addons/inspector/Inspector.js';

    import earth_day from "$lib/assets/earth_day_4096.jpg";
    import earth_night from "$lib/assets/earth_night_4096.jpg";


    let canvas: HTMLCanvasElement;

    let camera: THREE.PerspectiveCamera;
    let scene: THREE.Scene;
    let renderer: THREE.WebGPURenderer;
    let controls: OrbitControls;
    let globe: THREE.Mesh;
    let timer: THREE.Timer;

    

    function init(): void {
        timer = new THREE.Timer();
        timer.connect(document);

        camera = new THREE.PerspectiveCamera(25, canvas.clientWidth / canvas.clientHeight, 0.1, 100);
        camera.position.set(4.5, 2, 3);

        scene = new THREE.Scene();

        // Sun
        const sun = new THREE.DirectionalLight('#ffffff', 2);
        sun.position.set(0, 0, 3);
        scene.add(sun);

        // Uniforms
        const atmosphereDayColor = uniform(color('#4db2ff'));
        const atmosphereTwilightColor = uniform(color('#bc490b'));
        const roughnessLow = uniform(0.25);
        const roughnessHigh = uniform(0.35);

        // Textures
        const textureLoader = new THREE.TextureLoader();

        const dayTexture = textureLoader.load(earth_day);
        dayTexture.colorSpace = THREE.SRGBColorSpace;
        dayTexture.anisotropy = 8;

        const nightTexture = textureLoader.load(earth_night);
        nightTexture.colorSpace = THREE.SRGBColorSpace;
        nightTexture.anisotropy = 8;

        const bumpRoughnessCloudsTexture = textureLoader.load(
            './textures/planets/earth_bump_roughness_clouds_4096.jpg'
        );
        bumpRoughnessCloudsTexture.anisotropy = 8;

        // Fresnel
        const viewDirection = positionWorld.sub(cameraPosition).normalize();
        const fresnel = viewDirection.dot(normalWorldGeometry).abs().oneMinus().toVar();

        // Sun orientation
        const sunOrientation = normalWorldGeometry.dot(normalize(sun.position)).toVar();

        // Atmosphere color
        const atmosphereColor = mix(
            atmosphereTwilightColor,
            atmosphereDayColor,
            sunOrientation.smoothstep(-0.25, 0.75)
        );

        // Globe material
        const globeMaterial = new THREE.MeshStandardNodeMaterial();

        const cloudsStrength = texture(bumpRoughnessCloudsTexture, uv()).b.smoothstep(0.2, 1);
        globeMaterial.colorNode = mix(texture(dayTexture), vec3(1), cloudsStrength.mul(2));

        const roughness = max(
            texture(bumpRoughnessCloudsTexture).g,
            step(0.01, cloudsStrength)
        );
        globeMaterial.roughnessNode = roughness.remap(0, 1, roughnessLow, roughnessHigh);

        const night = texture(nightTexture);
        const dayStrength = sunOrientation.smoothstep(-0.25, 0.5);

        const atmosphereDayStrength = sunOrientation.smoothstep(-0.5, 1);
        const atmosphereMix = atmosphereDayStrength.mul(fresnel.pow(2)).clamp(0, 1);

        let finalOutput = mix(night.rgb, output.rgb, dayStrength);
        finalOutput = mix(finalOutput, atmosphereColor, atmosphereMix);
        globeMaterial.outputNode = vec4(finalOutput, output.a);

        const bumpElevation = max(texture(bumpRoughnessCloudsTexture).r, cloudsStrength);
        globeMaterial.normalNode = bumpMap(bumpElevation);

        const sphereGeometry = new THREE.SphereGeometry(1, 64, 64);
        globe = new THREE.Mesh(sphereGeometry, globeMaterial);
        scene.add(globe);

        // Atmosphere
        const atmosphereMaterial = new THREE.MeshBasicNodeMaterial({
            side: THREE.BackSide,
            transparent: true
        });
        let alpha = fresnel.remap(0.73, 1, 1, 0).pow(3);
        alpha = alpha.mul(sunOrientation.smoothstep(-0.5, 1));
        atmosphereMaterial.outputNode = vec4(atmosphereColor, alpha);

        const atmosphere = new THREE.Mesh(sphereGeometry, atmosphereMaterial);
        atmosphere.scale.setScalar(1.04);
        scene.add(atmosphere);

        // Renderer
        renderer = new THREE.WebGPURenderer({ canvas });
        renderer.setPixelRatio(window.devicePixelRatio);
        renderer.setSize(canvas.clientWidth, canvas.clientHeight, false);
        renderer.setAnimationLoop(animate);
        // const inspector = new Inspector();
        // renderer.inspector = inspector;

        // Controls
        controls = new OrbitControls(camera, renderer.domElement);
        controls.enableDamping = true;
        controls.minDistance = 0.1;
        controls.maxDistance = 50;

        // Debug GUI
        // const gui = inspector.createParameters('Parameters');

        // gui
        //     .addColor({ color: atmosphereDayColor.value.getHex(THREE.SRGBColorSpace) }, 'color')
        //     .onChange((value: number) => {
        //         atmosphereDayColor.value.set(value);
        //     })
        //     .name('atmosphereDayColor');

        // gui
        //     .addColor({ color: atmosphereTwilightColor.value.getHex(THREE.SRGBColorSpace) }, 'color')
        //     .onChange((value: number) => {
        //         atmosphereTwilightColor.value.set(value);
        //     })
        //     .name('atmosphereTwilightColor');

        // gui.add(roughnessLow, 'value', 0, 1, 0.001).name('roughnessLow');
        // gui.add(roughnessHigh, 'value', 0, 1, 0.001).name('roughnessHigh');

        const loader = new OBJLoader();
        loader.load(
            '/cube.obj',
            function (object) {
                const scaleFactor = 0.05;
                object.scale.set(scaleFactor, scaleFactor, scaleFactor);
                globe.add(object);
                object.position.set(0, 0, 2);
                console.log("ISS Loaded!");
            }
        );
    }

    function onWindowResize(): void {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix(); // Fixed typo from original: 'camra' → 'camera'

        renderer.setSize(window.innerWidth, window.innerHeight);
    }

    async function animate(): Promise<void> {
        timer.update();

        const delta = timer.getDelta();
        globe.rotation.y += delta * 0.025;

        controls.update();

        renderer.render(scene, camera);
    }

    onMount(() => {
        init();
        window.addEventListener('resize', onWindowResize);

        return () => {
            window.removeEventListener('resize', onWindowResize);
            renderer?.setAnimationLoop(null);
            renderer?.dispose();
            controls?.dispose();
            timer?.disconnect();
        };
    });
</script>

<canvas bind:this={canvas}></canvas>    

<style>
    canvas {
        display: block;
        width: 100%;
        height: 100vh;
    }
</style>