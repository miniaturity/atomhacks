<script lang="ts">
    import { FBXLoader } from 'three/addons/loaders/FBXLoader.js';
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
    import clouds from "$lib/assets/earth_bump_roughness_clouds_4096.jpg";
    import type { Position } from '$lib/types/types';

     let { 
        position = $bindable(), 
        issPosition = $bindable<[number, number] | null>(null), 
        overlayActive = $bindable<boolean>(false),
    }: { 
        position?: Position,
        issPosition?: [number, number] | null;
        overlayActive?: boolean;
    } = $props();

    let issObject: THREE.Object3D | undefined;

    function latLonAltToVector3(lat: number, lon: number, alt: number): THREE_m.Vector3 {
        const EARTH_RADIUS_KM = 6371;
        const SCENE_RADIUS = 1; // your sphere's radius
        const r = SCENE_RADIUS * (1 + alt / EARTH_RADIUS_KM);

        const latRad = lat * (Math.PI / 180);
        // Subtract globe.rotation.y to counteract the cosmetic spin
        const lonRad = lon * (Math.PI / 180) - globe.rotation.y;

        return new THREE_m.Vector3(
            r * Math.cos(latRad) * Math.sin(lonRad),
            r * Math.sin(latRad),
            r * Math.cos(latRad) * Math.cos(lonRad)
        );
    }

    // React to position prop changes
    $effect(() => {
        if (position && issObject) {
            const pos = latLonAltToVector3(position.latitude, position.longitude, position.altitude);
            issObject.position.copy(pos);
        }
    });


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
            clouds
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
        if (issObject)
            controls.target.copy(issObject?.position);
        controls.update();

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

        const loader = new FBXLoader();
        loader.load('/iss.fbx', (object) => {
            const scaleFactor = 0.000008;
            object.scale.set(scaleFactor, scaleFactor, scaleFactor);
            issObject = object;
            scene.add(object);
            console.log("ISS Loaded!");
        });

    }

    function onWindowResize(): void {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix(); 

        renderer.setSize(window.innerWidth, window.innerHeight);
    }

    async function animate(): Promise<void> {
        timer.update();
        const delta = timer.getDelta();
        globe.rotation.y += delta * 0.005;
        controls.update();
        renderer.render(scene, camera);

        // Project ISS world position tp screen coords each frame
        if (issObject) {
            const worldPos = new THREE_m.Vector3();
            issObject.getWorldPosition(worldPos);
            const direction = worldPos.clone().sub(camera.position).normalize();
            const raycaster = new THREE_m.Raycaster(camera.position, direction);
            const intersects = raycaster.intersectObject(globe);

            // Occluded if the globe surface is hit before we reach the ISS!
            const distToISS = camera.position.distanceTo(worldPos);
            const occluded = intersects.length > 0 && intersects[0].distance < distToISS;

            worldPos.project(camera);
            const x = (worldPos.x * 0.5 + 0.5) * canvas.clientWidth;
            const y = (-worldPos.y * 0.5 + 0.5) * canvas.clientHeight;

            issPosition = [x, y];
            overlayActive = !occluded;
        }
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