// js/world.js - Escenarios y Territorios de Colombia: NINJA COLOMBIA ARENA
// 4 Biomas Auténticos: Selva Amazónica, Eje Cafetero, Páramo Andino y Caribe Colombiano
// Incluye: Cajas Sorpresa con '?', Airdrops con Paracaídas, Cristales de Biodiversidad y Portales Precolombinos

import * as THREE from 'three';
import { CAMPAIGN_WORLDS } from './campaign.js?v=20.0';
import { resourceManager } from './core/resourceManager.js';

export const MAPS_CONFIG = {
    selva: {
        id: 'selva',
        name: 'Selva Amazónica',
        badge: '🌴 AMAZONAS',
        desc: 'Ceibas gigantes, río Amazonas cristalino, puentes de bambú, orquídeas y ruinas doradas.',
        missionTitle: 'Misión del Amazonas',
        missionDesc: 'Derrota 6 cazadores furtivos, recoge 3 Cristales de Biodiversidad y abre 6 Cajas Sorpresa.',
        bgColor: 0x38bdf8,
        fogColor: 0xbae6fd,
        fogDensity: 0.012,
        sunColor: 0xfef08a,
        gemColor: 0xa855f7
    },
    eje_cafetero: {
        id: 'eje_cafetero',
        name: 'Eje Cafetero',
        badge: '☕ EJE CAFETERO',
        desc: 'Colinas verdes ondulantes, arbustos de café con cerezas rojas, hacienda tradicional paisa y canastos.',
        missionTitle: 'Misión Cafetera',
        missionDesc: 'Derrota 7 esbirros, recoge 4 Cristales de Biodiversidad y abre 6 Cajas Sorpresa de café.',
        bgColor: 0x7dd3fc,
        fogColor: 0xa7f3d0,
        fogDensity: 0.013,
        sunColor: 0xffedd5,
        gemColor: 0xa855f7
    },
    paramo: {
        id: 'paramo',
        name: 'Páramo Andino & Nevado',
        badge: '🏔️ PÁRAMO',
        desc: 'Frailejones emblemáticos, arroyos de deshielo, neblina fresca y la cumbre del volcán nevado.',
        missionTitle: 'Misión de las Cumbres Andinas',
        missionDesc: 'Derrota 8 esbirros helados, recoge 4 Cristales de Biodiversidad y abre 8 Cajas Sorpresa.',
        bgColor: 0xcfe8f9,
        fogColor: 0xdbeafe,
        fogDensity: 0.015,
        sunColor: 0xf8fafc,
        gemColor: 0xa855f7
    },
    caribe: {
        id: 'caribe',
        name: 'Caribe Colombiano',
        badge: '🏖️ CARIBE',
        desc: 'Playas doradas, mar turquesa animado, palmeras de coco altas y murallas históricas de Cartagena.',
        missionTitle: 'Misión de las Costas del Caribe',
        missionDesc: 'Derrota 10 esbirros, recoge 5 Cristales de Biodiversidad y derrota a El Invernal.',
        bgColor: 0x38bdf8,
        fogColor: 0x7dd3fc,
        fogDensity: 0.011,
        sunColor: 0xfef9c3,
        gemColor: 0xa855f7
    },
    desierto: {
        id: 'desierto',
        name: 'El desierto de los secretos',
        badge: '🏜️ LA GUAJIRA',
        desc: 'Dunas doradas de Taroa, cactus gigantes y pilares de arcilla roja.',
        missionTitle: 'Misión del Desierto',
        missionDesc: 'Cruza las dunas, esquiva arenas movedizas y recolecta 3 cristales.',
        bgColor: 0xfed7aa,
        fogColor: 0xfdba74,
        fogDensity: 0.013,
        sunColor: 0xfde047,
        gemColor: 0xa855f7
    },
    pacifico: {
        id: 'pacifico',
        name: 'Los misterios del Pacífico',
        badge: '🌊 CHOCÓ PACÍFICO',
        desc: 'Selva húmeda, manglares gigantes, lianas y cascadas de aguas profundas.',
        missionTitle: 'Misión del Pacífico',
        missionDesc: 'Supera las mareas y el laberinto de raíces de mangle.',
        bgColor: 0x99f6e4,
        fogColor: 0x5eead4,
        fogDensity: 0.012,
        sunColor: 0x5eead4,
        gemColor: 0xa855f7
    },
    sabana: {
        id: 'sabana',
        name: 'La sabana de los gigantes',
        badge: '🌾 LLANOS ORIENTALES',
        desc: 'Sabanas doradas infinitas, esteros, morichales y chigüiros en libertad.',
        missionTitle: 'Misión de la Sabana',
        missionDesc: 'Navega los esteros y plataformas flotantes de los llanos.',
        bgColor: 0xfef08a,
        fogColor: 0xd9f99d,
        fogDensity: 0.013,
        sunColor: 0xfef08a,
        gemColor: 0xa855f7
    },
    cano_cristales: {
        id: 'cano_cristales',
        name: 'El río de los cinco colores',
        badge: '🌈 CAÑO CRISTALES',
        desc: 'Pozas circulares rocosas y plantas acuáticas de cinco colores radiantes.',
        missionTitle: 'Misión del Río Arcoíris',
        missionDesc: 'Salta entre los remolinos y cascadas de cuarzo de colores.',
        bgColor: 0xfbcfe8,
        fogColor: 0xf5d0fe,
        fogDensity: 0.013,
        sunColor: 0xf472b6,
        gemColor: 0xa855f7
    },
    ciudad_perdida: {
        id: 'ciudad_perdida',
        name: 'La ciudad perdida',
        badge: '🏛️ TEYUNA TAYRONA',
        desc: 'Terrazas circulares de piedra, monolitos ancestrales y selva de montaña.',
        missionTitle: 'Misión de la Ciudad Perdida',
        missionDesc: 'Asciende las escaleras milenarias y sortea las trampas antiguas.',
        bgColor: 0xcfd8dc,
        fogColor: 0x90a4ae,
        fogDensity: 0.014,
        sunColor: 0xe2e8f0,
        gemColor: 0xa855f7
    },
    templo_biodiversidad: {
        id: 'templo_biodiversidad',
        name: 'El templo de la biodiversidad',
        badge: '💎 TEMPLO SUPREMO',
        desc: 'Santuario de energía pura en la cima nevada custodiado por El Invernal.',
        missionTitle: 'Misión Definitiva',
        missionDesc: 'Vence la tormenta cósmica y derrota a El Invernal en su forma suprema.',
        bgColor: 0xe9d5ff,
        fogColor: 0xd8b4fe,
        fogDensity: 0.015,
        sunColor: 0xc084fc,
        gemColor: 0xa855f7
    }
};

// Aliases para compatibilidad
MAPS_CONFIG.amazonas = MAPS_CONFIG.selva;
MAPS_CONFIG.cafetero = MAPS_CONFIG.eje_cafetero;
MAPS_CONFIG.frailejones = MAPS_CONFIG.paramo;
MAPS_CONFIG.forest = MAPS_CONFIG.selva;
MAPS_CONFIG.volcano = MAPS_CONFIG.eje_cafetero;
MAPS_CONFIG.snow = MAPS_CONFIG.paramo;

export class World {
    constructor(scene) {
        this.scene = scene;
        this.currentMapId = 'selva';
        this.platforms = [];
        this.isCampaignMode = false;
        this.campaignEnemySpawns = [];
        this.currentCampaignWorldNum = 1;
        this.currentCampaignLevelNum = 1;
        this.trampolines = [];
        this.floatingCoins = [];
        this.crates = [];
        this.missionGems = [];
        this.airdrops = [];
        this.totems = [];
        this.portal = null;
        this.animatedUpdaters = [];

        this.mapRoot = new THREE.Group();
        this.mapRoot.name = 'mapRoot';
        this.scene.add(this.mapRoot);

        this.loadMap('selva');
    }

    setMap(mapId) {
        const canonicalId = mapId === 'forest' ? 'selva' : (mapId === 'volcano' ? 'eje_cafetero' : (mapId === 'snow' ? 'paramo' : mapId));
        if (!MAPS_CONFIG[canonicalId]) return;
        this.currentMapId = canonicalId;
        this.loadMap(canonicalId);
    }

    loadMap(mapId) {
        const canonicalId = mapId === 'forest' ? 'selva' : (mapId === 'volcano' ? 'eje_cafetero' : (mapId === 'snow' ? 'paramo' : mapId));

        while (this.mapRoot.children.length > 0) {
            const child = this.mapRoot.children[0];
            this.mapRoot.remove(child);
            this.disposeObject(child);
        }

        this.trampolines = [];
        this.floatingCoins = [];
        this.crates = [];
        this.missionGems = [];
        this.airdrops = [];
        this.totems = [];
        this.portal = null;
        this.animatedUpdaters = [];

        const cfg = MAPS_CONFIG[canonicalId] || MAPS_CONFIG.selva;
        if (this.scene.background && this.scene.background.setHex) {
            this.scene.background.setHex(cfg.bgColor);
        } else {
            this.scene.background = new THREE.Color(cfg.bgColor);
        }

        if (this.scene.fog) {
            this.scene.fog.color.setHex(cfg.fogColor);
            this.scene.fog.density = cfg.fogDensity;
        } else {
            this.scene.fog = new THREE.FogExp2(cfg.fogColor, cfg.fogDensity);
        }

        if (canonicalId === 'eje_cafetero') {
            this.buildEjeCafetero();
        } else if (canonicalId === 'paramo') {
            this.buildParamoAndino();
        } else if (canonicalId === 'caribe') {
            this.buildCaribeColombiano();
        } else {
            this.buildSelvaAmazonica();
        }
    }

    isMobileDevice() {
        return (typeof window !== 'undefined') && (
            ('ontouchstart' in window) || (navigator.maxTouchPoints > 0) || (window.innerWidth <= 850)
        );
    }

    getCrateQuestionTexture() {
        if (this._crateQTex) return this._crateQTex;
        const canvas = document.createElement('canvas');
        canvas.width = 128;
        canvas.height = 128;
        const ctx = canvas.getContext('2d');
        ctx.fillStyle = '#fef08a';
        ctx.font = 'bold 96px sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('?', 64, 64);
        this._crateQTex = new THREE.CanvasTexture(canvas);
        resourceManager.markPersistent(this._crateQTex);
        return this._crateQTex;
    }

    disposeObject(obj) {
        if (!obj) return;
        resourceManager.disposeHierarchy(obj);
    }

    // =========================================================================
    // MEJORAS GRÁFICAS AAA: DOMO DE CIELO, TERRENO PROCEDURAL Y VEGETACIÓN VIVA
    // =========================================================================
    buildSkyDome(topColorHex = '#0284c7', horizColorHex = '#7dd3fc') {
        const canvas = document.createElement('canvas');
        canvas.width = 128;
        canvas.height = 512;
        const ctx = canvas.getContext('2d');

        const grad = ctx.createLinearGradient(0, 0, 0, 512);
        grad.addColorStop(0, topColorHex);
        grad.addColorStop(0.58, horizColorHex);
        grad.addColorStop(1, '#ffffff');
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, 128, 512);

        const tex = new THREE.CanvasTexture(canvas);
        const skyGeom = new THREE.SphereGeometry(140, 24, 16);
        const skyMat = new THREE.MeshBasicMaterial({
            map: tex,
            side: THREE.BackSide,
            depthWrite: false
        });
        const sky = new THREE.Mesh(skyGeom, skyMat);
        sky.position.y = 8;
        this.mapRoot.add(sky);

        // Nubes bajas caricaturescas flotantes (Low-Poly Cartoon Clouds)
        const isMobile = this.isMobileDevice();
        const cloudsGroup = new THREE.Group();
        const cloudMat = new THREE.MeshStandardMaterial({
            color: 0xffffff,
            roughness: 0.95,
            metalness: 0.05,
            flatShading: true
        });

        const cloudPuffs = [];
        const cloudCount = isMobile ? 6 : 12;
        for (let c = 0; c < cloudCount; c++) {
            const singleCloud = new THREE.Group();
            const puffCount = isMobile ? 3 : (3 + Math.floor(Math.random() * 3));
            for (let p = 0; p < puffCount; p++) {
                const r = 2.4 + Math.random() * 2.0;
                const puff = new THREE.Mesh(new THREE.DodecahedronGeometry(r, 1), cloudMat);
                puff.position.set((p - puffCount / 2) * 2.8, (Math.random() - 0.5) * 0.9, (Math.random() - 0.5) * 1.8);
                singleCloud.add(puff);
            }
            const ang = (c / cloudCount) * Math.PI * 2;
            const dist = 38 + Math.random() * 25;
            singleCloud.position.set(Math.cos(ang) * dist, 26 + (c % 3) * 5, Math.sin(ang) * dist);
            cloudsGroup.add(singleCloud);
            cloudPuffs.push(singleCloud);
        }
        this.mapRoot.add(cloudsGroup);

        this.animatedUpdaters.push((delta, time) => {
            for (let i = 0; i < cloudPuffs.length; i++) {
                const cl = cloudPuffs[i];
                cl.position.x += delta * 1.4;
                if (cl.position.x > 75) cl.position.x = -75;
            }
        });
    }

    createStylizedGroundTexture(primaryHex, secondaryHex) {
        const canvas = document.createElement('canvas');
        canvas.width = 512;
        canvas.height = 512;
        const ctx = canvas.getContext('2d');

        const col1 = '#' + primaryHex.toString(16).padStart(6, '0');
        const col2 = '#' + secondaryHex.toString(16).padStart(6, '0');

        ctx.fillStyle = col1;
        ctx.fillRect(0, 0, 512, 512);

        // Moteado orgánico
        ctx.fillStyle = col2;
        for (let i = 0; i < 450; i++) {
            const x = Math.random() * 512;
            const y = Math.random() * 512;
            const r = 1.5 + Math.random() * 4.0;
            ctx.beginPath();
            ctx.arc(x, y, r, 0, Math.PI * 2);
            ctx.fill();
        }

        // Briznas estilizadas / adoquines sutiles
        ctx.fillStyle = 'rgba(255, 255, 255, 0.12)';
        for (let i = 0; i < 200; i++) {
            const x = Math.random() * 512;
            const y = Math.random() * 512;
            ctx.fillRect(x, y, Math.random() * 8 + 3, Math.random() * 4 + 1.5);
        }

        const tex = new THREE.CanvasTexture(canvas);
        tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
        tex.repeat.set(12, 12);
        return tex;
    }

    addGrassAndFlowerPatches(count = 55, radius = 42, grassColor = 0x22c55e, flowerColor = 0xfacc15) {
        const isMobile = this.isMobileDevice();
        const effectiveCount = isMobile ? Math.min(count, 22) : count;
        const patchesGroup = new THREE.Group();
        const grassMat = new THREE.MeshStandardMaterial({
            color: grassColor,
            roughness: 0.7,
            metalness: 0.1,
            side: THREE.DoubleSide
        });
        const flowerMat = new THREE.MeshStandardMaterial({
            color: flowerColor,
            roughness: 0.3,
            metalness: 0.1
        });

        const patchMeshes = [];
        for (let i = 0; i < effectiveCount; i++) {
            const ang = Math.random() * Math.PI * 2;
            const r = 5.0 + Math.random() * (radius - 6);
            const px = Math.cos(ang) * r;
            const pz = Math.sin(ang) * r;

            const patch = new THREE.Group();
            patch.position.set(px, 0.05, pz);

            const bladeGeom = new THREE.ConeGeometry(0.12, 0.65, 4);
            bladeGeom.translate(0, 0.32, 0);

            for (let b = 0; b < 4; b++) {
                const blade = new THREE.Mesh(bladeGeom, grassMat);
                blade.rotation.set((Math.random() - 0.5) * 0.3, Math.random() * Math.PI, (Math.random() - 0.5) * 0.3);
                blade.scale.set(0.8 + Math.random() * 0.4, 0.8 + Math.random() * 0.5, 0.8 + Math.random() * 0.4);
                patch.add(blade);
            }

            if (i % 3 === 0) {
                const flower = new THREE.Mesh(new THREE.SphereGeometry(0.14, 8, 8), flowerMat);
                flower.position.y = 0.55;
                patch.add(flower);
            }

            patchesGroup.add(patch);
            patchMeshes.push(patch);
        }
        this.mapRoot.add(patchesGroup);

        this.animatedUpdaters.push((delta, time) => {
            const wind = Math.sin(time * 2.8) * 0.15;
            for (let i = 0; i < patchMeshes.length; i++) {
                patchMeshes[i].rotation.z = wind + Math.sin(time * 2.0 + i) * 0.05;
            }
        });
    }

    addAmbientPollenMotes(count = 35) {
        const isMobile = this.isMobileDevice();
        const effectiveCount = isMobile ? Math.min(count, 12) : count;
        const motesGroup = new THREE.Group();
        const moteGeom = new THREE.SphereGeometry(0.08, 6, 6);
        const moteMat = new THREE.MeshBasicMaterial({
            color: 0xfef08a,
            transparent: true,
            opacity: 0.75
        });

        const motes = [];
        for (let i = 0; i < effectiveCount; i++) {
            const m = new THREE.Mesh(moteGeom, moteMat);
            const ang = Math.random() * Math.PI * 2;
            const r = Math.random() * 38;
            m.position.set(Math.cos(ang) * r, 1.0 + Math.random() * 6.0, Math.sin(ang) * r);
            motesGroup.add(m);
            motes.push({
                mesh: m,
                baseY: m.position.y,
                phase: Math.random() * Math.PI * 2,
                speed: 0.4 + Math.random() * 0.8
            });
        }
        this.mapRoot.add(motesGroup);

        this.animatedUpdaters.push((delta, time) => {
            for (let i = 0; i < motes.length; i++) {
                const item = motes[i];
                item.mesh.position.y = item.baseY + Math.sin(time * item.speed + item.phase) * 0.5;
                item.mesh.position.x += Math.cos(time * 0.5 + item.phase) * delta * 0.8;
                item.mesh.position.z += Math.sin(time * 0.5 + item.phase) * delta * 0.8;
            }
        });
    }

    // =========================================================================
    // 1. BIOMA: SELVA AMAZÓNICA
    // =========================================================================
    buildSelvaAmazonica() {
        this.buildSkyDome('#0284c7', '#7dd3fc');

        const groundTex = this.createStylizedGroundTexture(0x15803d, 0x166534);
        const groundMat = new THREE.MeshStandardMaterial({
            color: 0xffffff,
            map: groundTex,
            roughness: 0.82
        });
        const groundGeom = new THREE.CylinderGeometry(56, 58, 2.2, 36);
        const ground = new THREE.Mesh(groundGeom, groundMat);
        ground.position.y = -1.1;
        ground.receiveShadow = true;
        this.mapRoot.add(ground);

        this.addGrassAndFlowerPatches(65, 46, 0x22c55e, 0xfacc15);
        this.addAmbientPollenMotes(40);

                // Plaza Central de Aventura Colombiana en (0,0)
        const plazaGroup = new THREE.Group();
        const stoneMat = new THREE.MeshStandardMaterial({ color: 0x78716c, roughness: 0.75, metalness: 0.1 });
        const goldAccentMat = new THREE.MeshStandardMaterial({ color: 0xf59e0b, metalness: 0.8, roughness: 0.2 });
        const grassRimMat = new THREE.MeshStandardMaterial({ color: 0x22c55e, roughness: 0.85 });

        // Pedestal circular de piedra tallada
        const plazaBase = new THREE.Mesh(new THREE.CylinderGeometry(3.6, 3.8, 0.22, 32), stoneMat);
        plazaBase.position.y = 0.08;
        plazaBase.receiveShadow = true;
        plazaGroup.add(plazaBase);

        // Borde dorado con motivo precolombino
        const goldRing = new THREE.Mesh(new THREE.TorusGeometry(3.65, 0.06, 8, 36), goldAccentMat);
        goldRing.rotation.x = Math.PI / 2;
        goldRing.position.y = 0.18;
        plazaGroup.add(goldRing);

        // Flores y orquídeas colombianas decorativas alrededor del pedestal
        for (let f = 0; f < 10; f++) {
            const ang = (f / 10) * Math.PI * 2;
            const fx = Math.cos(ang) * 4.4;
            const fz = Math.sin(ang) * 4.4;
            const orchid = new THREE.Mesh(
                new THREE.SphereGeometry(0.18, 8, 8),
                new THREE.MeshStandardMaterial({ color: (f % 2 === 0 ? 0xd946ef : 0xfacc15), roughness: 0.3 })
            );
            orchid.position.set(fx, 0.2, fz);
            plazaGroup.add(orchid);
        }
        this.mapRoot.add(plazaGroup);

        // Río Amazonas serpenteante flanqueando el fondo
        const riverGroup = new THREE.Group();
        const waterMat = new THREE.MeshStandardMaterial({
            color: 0x0284c7,
            roughness: 0.15,
            metalness: 0.35,
            transparent: true,
            opacity: 0.85
        });
        const river = new THREE.Mesh(new THREE.BoxGeometry(70, 0.1, 10), waterMat);
        river.position.set(0, 0.02, -22);
        riverGroup.add(river);

        // Rocas ribereñas
        for (let i = 0; i < 16; i++) {
            const rx = -30 + i * 4.2 + (Math.random() - 0.5) * 1.5;
            const rz = -22 + (i % 2 === 0 ? 4.8 : -4.8);
            const rock = new THREE.Mesh(
                new THREE.DodecahedronGeometry(0.7 + (i % 3) * 0.25, 1),
                new THREE.MeshStandardMaterial({ color: 0x64748b, roughness: 0.9 })
            );
            rock.position.set(rx, 0.3, rz);
            riverGroup.add(rock);
        }
        this.mapRoot.add(riverGroup);

        this.animatedUpdaters.push((delta, time) => {
            river.position.y = 0.02 + Math.sin(time * 2.2) * 0.02;
        });

        // Ceibas gigantes del Amazonas
        const ceibaSpots = [
            [-22, -18], [22, -18], [-28, 12], [26, 14],
            [-14, 28], [16, 28], [-38, -6], [38, -6]
        ];
        ceibaSpots.forEach(([cx, cz]) => {
            this.buildCeibaTree(new THREE.Vector3(cx, 0, cz));
        });

        // Puentes colgantes de bambú
        this.buildBambooBridge(new THREE.Vector3(0, 0, 0));

        // Monolito precolombino dorado
        this.buildPrecolumbianMonolith(new THREE.Vector3(0, 0, -32));

        // Portal Místico de la Selva (Siempre activo y reluciente)
        this.buildMysticPortal(new THREE.Vector3(0, 0, 26), 0, 0x10b981);
        this.activatePortal();

        // Trampolines de lianas
        this.buildTrampoline(new THREE.Vector3(-14, 0, 4));
        this.buildTrampoline(new THREE.Vector3(14, 0, -4));

        // Cajas Sorpresa con '?'
        const crateSpots = [
            new THREE.Vector3(-7, 0.45, -7),
            new THREE.Vector3(7, 0.45, -7),
            new THREE.Vector3(-9, 0.45, 9),
            new THREE.Vector3(9, 0.45, 9),
            new THREE.Vector3(-18, 0.45, -2),
            new THREE.Vector3(18, 0.45, 2)
        ];
        crateSpots.forEach((pos, idx) => {
            this.buildCrate(pos, idx % 2 === 0 ? 'fruit' : 'coffee');
        });

        // Airdrop con paracaídas amarillo en el claro de la selva
        this.buildAirdrop(new THREE.Vector3(0, 0.55, -16));

        // Cristales de Energía de la Biodiversidad
        const gemSpots = [
            new THREE.Vector3(-15, 1.3, -15),
            new THREE.Vector3(15, 1.3, -15),
            new THREE.Vector3(0, 1.4, -26)
        ];
        gemSpots.forEach((pos, idx) => {
            this.buildBiodiversityCrystal(pos, `selva_crystal_${idx + 1}`);
        });

        this.spawnFloatingParkourCoins([
            new THREE.Vector3(-5, 1.2, 0),
            new THREE.Vector3(0, 1.2, 0),
            new THREE.Vector3(5, 1.2, 0)
        ]);
    }

    // =========================================================================
    // 2. BIOMA: EJE CAFETERO
    // =========================================================================
    buildEjeCafetero() {
        this.buildSkyDome('#0284c7', '#fde047');

        const groundTex = this.createStylizedGroundTexture(0x16a34a, 0x15803d);
        const grassMat = new THREE.MeshStandardMaterial({
            color: 0xffffff,
            map: groundTex,
            roughness: 0.8
        });
        const ground = new THREE.Mesh(new THREE.CylinderGeometry(56, 58, 2.2, 36), grassMat);
        ground.position.y = -1.1;
        ground.receiveShadow = true;
        this.mapRoot.add(ground);

        this.addGrassAndFlowerPatches(60, 46, 0x65a30d, 0xef4444);
        this.addAmbientPollenMotes(35);

        // Colinas verdes ondulantes de café
        for (let i = 0; i < 8; i++) {
            const angle = (i / 8) * Math.PI * 2;
            const hill = new THREE.Mesh(
                new THREE.SphereGeometry(12, 16, 12, 0, Math.PI * 2, 0, Math.PI * 0.45),
                new THREE.MeshStandardMaterial({ color: 0x15803d, roughness: 0.85 })
            );
            hill.position.set(Math.cos(angle) * 36, -3.5, Math.sin(angle) * 36);
            this.mapRoot.add(hill);
        }

        // Arbustos de café con granos rojos
        const coffeeSpots = [
            [-18, -12], [-14, -16], [-10, -20],
            [18, -12], [14, -16], [10, -20],
            [-22, 8], [-18, 14], [-24, 18],
            [22, 8], [18, 14], [24, 18]
        ];
        coffeeSpots.forEach(([cx, cz]) => {
            this.buildCoffeeBush(new THREE.Vector3(cx, 0, cz));
        });

        // Hacienda Paisa tradicional con tejado de teja de barro rojo y balcones
        this.buildPaisaHacienda(new THREE.Vector3(0, 0, -30));

        // Portal Místico Cafetero (Siempre activo y reluciente)
        this.buildMysticPortal(new THREE.Vector3(0, 0, 26), 0, 0xf59e0b);
        this.activatePortal();

        // Trampolines de costales de café
        this.buildTrampoline(new THREE.Vector3(-12, 0, 0));
        this.buildTrampoline(new THREE.Vector3(12, 0, 0));

        // Cajas Sorpresa con '?' de café y frutas
        const crateSpots = [
            new THREE.Vector3(-8, 0.45, -6),
            new THREE.Vector3(8, 0.45, -6),
            new THREE.Vector3(-10, 0.45, 10),
            new THREE.Vector3(10, 0.45, 10),
            new THREE.Vector3(0, 0.45, 12),
            new THREE.Vector3(-18, 0.45, 2)
        ];
        crateSpots.forEach((pos, idx) => {
            this.buildCrate(pos, idx % 2 === 0 ? 'coffee' : 'coins');
        });

        // Airdrop con paracaídas amarillo entre los cafetales
        this.buildAirdrop(new THREE.Vector3(0, 0.55, -14));

        // Cristales de Energía de la Biodiversidad
        const gemSpots = [
            new THREE.Vector3(-16, 1.3, -12),
            new THREE.Vector3(16, 1.3, -12),
            new THREE.Vector3(-16, 1.3, 16),
            new THREE.Vector3(16, 1.3, 16)
        ];
        gemSpots.forEach((pos, idx) => {
            this.buildBiodiversityCrystal(pos, `cafetero_crystal_${idx + 1}`);
        });

        this.spawnFloatingParkourCoins([
            new THREE.Vector3(-6, 1.2, 0),
            new THREE.Vector3(0, 1.2, 0),
            new THREE.Vector3(6, 1.2, 0)
        ]);
    }

    // =========================================================================
    // 3. BIOMA: PÁRAMO ANDINO & NEVADO
    // =========================================================================
    buildParamoAndino() {
        this.buildSkyDome('#312e81', '#a5b4fc');

        const groundTex = this.createStylizedGroundTexture(0x475569, 0x334155);
        const paramoMat = new THREE.MeshStandardMaterial({
            color: 0xffffff,
            map: groundTex,
            roughness: 0.88
        });
        const ground = new THREE.Mesh(new THREE.CylinderGeometry(56, 58, 2.2, 36), paramoMat);
        ground.position.y = -1.1;
        ground.receiveShadow = true;
        this.mapRoot.add(ground);

        this.addGrassAndFlowerPatches(50, 46, 0x94a3b8, 0x38bdf8);
        this.addAmbientPollenMotes(30);

        // Cumbre del Volcán Nevado al fondo
        const nevadoMat = new THREE.MeshStandardMaterial({ color: 0xf8fafc, roughness: 0.8 });
        const mountain = new THREE.Mesh(new THREE.ConeGeometry(38, 28, 16), nevadoMat);
        mountain.position.set(0, 10, -58);
        this.mapRoot.add(mountain);

        // Frailejones emblemáticos
        const frailejonSpots = [
            [-14, -10], [-18, -14], [-12, -22], [-20, -26],
            [14, -10], [18, -14], [12, -22], [20, -26],
            [-22, 6], [-16, 12], [-24, 18], [-18, 24],
            [22, 6], [16, 12], [24, 18], [18, 24]
        ];
        frailejonSpots.forEach(([fx, fz]) => {
            this.buildFrailejon(new THREE.Vector3(fx, 0, fz));
        });

        // Santuario Andino de Piedra
        this.buildAndeanShrine(new THREE.Vector3(0, 0, -30));

        // Portal Místico Andino (Siempre activo y reluciente)
        this.buildMysticPortal(new THREE.Vector3(0, 0, 26), 0, 0x06b6d4);
        this.activatePortal();

        // Géiseres y manantiales termales
        this.buildThermalSpring(new THREE.Vector3(-12, 0, 0));
        this.buildThermalSpring(new THREE.Vector3(12, 0, 0));

        // Cajas Sorpresa con '?'
        const crateSpots = [
            new THREE.Vector3(-8, 0.45, -6),
            new THREE.Vector3(8, 0.45, -6),
            new THREE.Vector3(-10, 0.45, 10),
            new THREE.Vector3(10, 0.45, 10),
            new THREE.Vector3(0, 0.45, 14),
            new THREE.Vector3(-16, 0.45, 0),
            new THREE.Vector3(16, 0.45, 0),
            new THREE.Vector3(0, 0.45, -14)
        ];
        crateSpots.forEach((pos, idx) => {
            this.buildCrate(pos, idx % 2 === 0 ? 'fruit' : 'coffee');
        });

        // Airdrop con paracaídas amarillo en el valle del páramo
        this.buildAirdrop(new THREE.Vector3(0, 0.55, 6));

        // Cristales de Energía de la Biodiversidad
        const gemSpots = [
            new THREE.Vector3(-16, 1.4, -16),
            new THREE.Vector3(16, 1.4, -16),
            new THREE.Vector3(-16, 1.4, 16),
            new THREE.Vector3(16, 1.4, 16)
        ];
        gemSpots.forEach((pos, idx) => {
            this.buildBiodiversityCrystal(pos, `paramo_crystal_${idx + 1}`);
        });
    }

    // =========================================================================
    // 4. BIOMA: CARIBE COLOMBIANO
    // =========================================================================
    buildCaribeColombiano() {
        this.buildSkyDome('#0284c7', '#38bdf8');

        const groundTex = this.createStylizedGroundTexture(0xfef08a, 0xfde047);
        const sandMat = new THREE.MeshStandardMaterial({
            color: 0xffffff,
            map: groundTex,
            roughness: 0.88
        });
        const ground = new THREE.Mesh(new THREE.CylinderGeometry(56, 58, 2.2, 36), sandMat);
        ground.position.y = -1.1;
        ground.receiveShadow = true;
        this.mapRoot.add(ground);

        this.addGrassAndFlowerPatches(45, 46, 0x22c55e, 0xec4899);
        this.addAmbientPollenMotes(30);

        // Océano Caribe con olas turquesas animadas
        const seaGroup = new THREE.Group();
        const seaMat = new THREE.MeshStandardMaterial({
            color: 0x06b6d4,
            roughness: 0.1,
            metalness: 0.4,
            transparent: true,
            opacity: 0.85
        });
        const sea = new THREE.Mesh(new THREE.CylinderGeometry(14, 14, 0.08, 32), seaMat);
        sea.position.set(0, 0.03, -12);
        seaGroup.add(sea);
        this.mapRoot.add(seaGroup);

        this.animatedUpdaters.push((delta, time) => {
            sea.position.y = 0.03 + Math.sin(time * 2.5) * 0.03;
        });

        // Palmeras de coco altas
        const palmSpots = [
            [-22, -18], [-18, -24], [22, -18], [18, -24],
            [-26, 8], [-22, 16], [26, 8], [22, 16],
            [-12, 26], [12, 26]
        ];
        palmSpots.forEach(([px, pz]) => {
            this.buildCoconutPalm(new THREE.Vector3(px, 0, pz));
        });

        // Murallas históricas de piedra coralina de Cartagena
        this.buildCartagenaFortress(new THREE.Vector3(0, 0, -32));

        // Portal Místico Caribeño (Siempre activo y reluciente)
        this.buildMysticPortal(new THREE.Vector3(0, 0, 26), 0, 0x0284c7);
        this.activatePortal();

        // Trampolines de red de pesca
        this.buildTrampoline(new THREE.Vector3(-14, 0, 0));
        this.buildTrampoline(new THREE.Vector3(14, 0, 0));

        // Cajas Sorpresa con '?'
        const crateSpots = [
            new THREE.Vector3(-8, 0.45, -6),
            new THREE.Vector3(8, 0.45, -6),
            new THREE.Vector3(-12, 0.45, 10),
            new THREE.Vector3(12, 0.45, 10),
            new THREE.Vector3(-18, 0.45, -2),
            new THREE.Vector3(18, 0.45, 2),
            new THREE.Vector3(0, 0.45, 14),
            new THREE.Vector3(0, 0.45, -2)
        ];
        crateSpots.forEach((pos, idx) => {
            this.buildCrate(pos, idx % 2 === 0 ? 'fruit' : 'coins');
        });

        // Airdrop con paracaídas amarillo en la playa
        this.buildAirdrop(new THREE.Vector3(0, 0.55, 6));

        // Cristales de Energía de la Biodiversidad
        const gemSpots = [
            new THREE.Vector3(-16, 1.4, -14),
            new THREE.Vector3(16, 1.4, -14),
            new THREE.Vector3(-18, 1.4, 16),
            new THREE.Vector3(18, 1.4, 16),
            new THREE.Vector3(0, 1.4, -26)
        ];
        gemSpots.forEach((pos, idx) => {
            this.buildBiodiversityCrystal(pos, `caribe_crystal_${idx + 1}`);
        });
    }

    // =========================================================================
    // ELEMENTOS ARQUITECTÓNICOS Y VEGETACIÓN COLOMBIANA
    // =========================================================================

    // Árbol de Ceiba Amazónica
    buildCeibaTree(pos) {
        const tree = new THREE.Group();
        tree.position.copy(pos);

        const trunkMat = new THREE.MeshStandardMaterial({ color: 0x52525b, roughness: 0.9 });
        const leafMat = new THREE.MeshStandardMaterial({ color: 0x166534, roughness: 0.7 });

        const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.65, 1.1, 5.2, 12), trunkMat);
        trunk.position.y = 2.6;
        trunk.castShadow = true;
        tree.add(trunk);

        for (let r = 0; r < 4; r++) {
            const angle = (r / 4) * Math.PI * 2;
            const root = new THREE.Mesh(new THREE.BoxGeometry(0.35, 1.6, 1.2), trunkMat);
            root.position.set(Math.cos(angle) * 0.9, 0.8, Math.sin(angle) * 0.9);
            root.rotation.y = angle;
            tree.add(root);
        }

        const foliage = new THREE.Mesh(new THREE.SphereGeometry(3.6, 16, 14), leafMat);
        foliage.scale.set(1.4, 0.75, 1.4);
        foliage.position.y = 5.6;
        foliage.castShadow = true;
        tree.add(foliage);

        this.mapRoot.add(tree);
    }

    // Arbusto de Café con granos rojos
    buildCoffeeBush(pos) {
        const bush = new THREE.Group();
        bush.position.copy(pos);

        const leafMat = new THREE.MeshStandardMaterial({ color: 0x15803d, roughness: 0.6 });
        const berryMat = new THREE.MeshStandardMaterial({ color: 0xdc2626, roughness: 0.3, emissive: 0x991b1b, emissiveIntensity: 0.3 });

        const body = new THREE.Mesh(new THREE.SphereGeometry(1.2, 14, 12), leafMat);
        body.position.y = 1.1;
        body.scale.set(1.1, 0.9, 1.1);
        bush.add(body);

        for (let b = 0; b < 12; b++) {
            const angle = (b / 12) * Math.PI * 2;
            const cherry = new THREE.Mesh(new THREE.SphereGeometry(0.12, 8, 8), berryMat);
            cherry.position.set(Math.cos(angle) * 1.05, 0.8 + (b % 3) * 0.25, Math.sin(angle) * 1.05);
            bush.add(cherry);
        }

        this.mapRoot.add(bush);
    }

    // Frailejón del Páramo Andino
    buildFrailejon(pos) {
        const f = new THREE.Group();
        f.position.copy(pos);

        const stemMat = new THREE.MeshStandardMaterial({ color: 0x78716c, roughness: 0.95 });
        const leafMat = new THREE.MeshStandardMaterial({ color: 0xca8a04, roughness: 0.9 });
        const flowerMat = new THREE.MeshStandardMaterial({ color: 0xfacc15, roughness: 0.4 });

        const stem = new THREE.Mesh(new THREE.CylinderGeometry(0.28, 0.34, 1.8, 12), stemMat);
        stem.position.y = 0.9;
        f.add(stem);

        for (let l = 0; l < 8; l++) {
            const angle = (l / 8) * Math.PI * 2;
            const leaf = new THREE.Mesh(new THREE.ConeGeometry(0.18, 0.9, 8), leafMat);
            leaf.position.set(Math.cos(angle) * 0.4, 1.8, Math.sin(angle) * 0.4);
            leaf.rotation.x = Math.PI / 3;
            leaf.rotation.y = angle;
            f.add(leaf);
        }

        const flower = new THREE.Mesh(new THREE.SphereGeometry(0.22, 10, 10), flowerMat);
        flower.position.y = 2.05;
        f.add(flower);

        this.mapRoot.add(f);
    }

    // Palmera de Coco del Caribe
    buildCoconutPalm(pos) {
        const palm = new THREE.Group();
        palm.position.copy(pos);

        const trunkMat = new THREE.MeshStandardMaterial({ color: 0x854d0e, roughness: 0.8 });
        const frondMat = new THREE.MeshStandardMaterial({ color: 0x22c55e, roughness: 0.6 });

        const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.24, 0.45, 6.5, 12), trunkMat);
        trunk.position.set(0.3, 3.25, 0);
        trunk.rotation.z = 0.08;
        palm.add(trunk);

        for (let fr = 0; fr < 6; fr++) {
            const angle = (fr / 6) * Math.PI * 2;
            const frond = new THREE.Mesh(new THREE.BoxGeometry(0.35, 0.04, 3.2), frondMat);
            frond.position.set(Math.cos(angle) * 1.4, 6.4, Math.sin(angle) * 1.4);
            frond.rotation.x = 0.35;
            frond.rotation.y = angle;
            palm.add(frond);
        }

        this.mapRoot.add(palm);
    }

    // Hacienda Paisa tradicional
    buildPaisaHacienda(pos) {
        const h = new THREE.Group();
        h.position.copy(pos);

        const wallMat = new THREE.MeshStandardMaterial({ color: 0xf8fafc, roughness: 0.8 });
        const tileRoofMat = new THREE.MeshStandardMaterial({ color: 0xb91c1c, roughness: 0.8 });
        const woodTrimMat = new THREE.MeshStandardMaterial({ color: 0x854d0e, roughness: 0.6 });

        const base = new THREE.Mesh(new THREE.BoxGeometry(22, 1.2, 14), wallMat);
        base.position.y = 0.6;
        h.add(base);

        const walls = new THREE.Mesh(new THREE.BoxGeometry(19, 5.2, 11), wallMat);
        walls.position.y = 3.6;
        h.add(walls);

        const balcony = new THREE.Mesh(new THREE.BoxGeometry(17, 0.8, 1.4), woodTrimMat);
        balcony.position.set(0, 4.0, 5.8);
        h.add(balcony);

        const roof = new THREE.Mesh(new THREE.ConeGeometry(17, 3.6, 4), tileRoofMat);
        roof.rotation.y = Math.PI / 4;
        roof.position.y = 7.8;
        roof.scale.set(1.15, 1.0, 0.85);
        h.add(roof);

        this.mapRoot.add(h);
    }

    // Murallas de Cartagena
    buildCartagenaFortress(pos) {
        const fort = new THREE.Group();
        fort.position.copy(pos);

        const stoneMat = new THREE.MeshStandardMaterial({ color: 0xd97706, roughness: 0.9 });
        const wall = new THREE.Mesh(new THREE.BoxGeometry(26, 4.8, 6), stoneMat);
        wall.position.y = 2.4;
        fort.add(wall);

        [-13, 13].forEach(gx => {
            const sentry = new THREE.Mesh(new THREE.CylinderGeometry(1.2, 1.4, 6.2, 12), stoneMat);
            sentry.position.set(gx, 3.1, 0);
            fort.add(sentry);

            const dome = new THREE.Mesh(new THREE.SphereGeometry(1.2, 12, 10), stoneMat);
            dome.position.set(gx, 6.2, 0);
            fort.add(dome);
        });

        this.mapRoot.add(fort);
    }

    buildPrecolumbianMonolith(pos) {
        const mono = new THREE.Group();
        mono.position.copy(pos);
        const goldStoneMat = new THREE.MeshStandardMaterial({ color: 0xca8a04, roughness: 0.6, metalness: 0.4 });

        const pillar = new THREE.Mesh(new THREE.BoxGeometry(3.5, 8.5, 3.5), goldStoneMat);
        pillar.position.y = 4.25;
        mono.add(pillar);

        const maskFace = new THREE.Mesh(new THREE.BoxGeometry(2.8, 3.2, 0.6), new THREE.MeshStandardMaterial({ color: 0xfacc15, metalness: 0.8 }));
        maskFace.position.set(0, 5.2, 1.8);
        mono.add(maskFace);

        this.mapRoot.add(mono);
    }

    buildAndeanShrine(pos) {
        const shrine = new THREE.Group();
        shrine.position.copy(pos);
        const stoneMat = new THREE.MeshStandardMaterial({ color: 0x334155, roughness: 0.9 });

        const base = new THREE.Mesh(new THREE.BoxGeometry(22, 1.8, 14), stoneMat);
        base.position.y = 0.9;
        shrine.add(base);

        const walls = new THREE.Mesh(new THREE.BoxGeometry(18, 5.5, 10), stoneMat);
        walls.position.y = 4.2;
        shrine.add(walls);

        const roof = new THREE.Mesh(new THREE.ConeGeometry(16, 3.8, 4), stoneMat);
        roof.rotation.y = Math.PI / 4;
        roof.position.y = 8.2;
        shrine.add(roof);

        this.mapRoot.add(shrine);
    }

    buildBambooBridge(pos) {
        const bridge = new THREE.Group();
        bridge.position.copy(pos);

        const woodMat = new THREE.MeshStandardMaterial({ color: 0x854d0e, roughness: 0.8 });
        const deck = new THREE.Mesh(new THREE.BoxGeometry(3.2, 0.18, 18), woodMat);
        deck.position.y = 0.15;
        bridge.add(deck);

        [-1.6, 1.6].forEach(rx => {
            const rope = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 18, 8), woodMat);
            rope.rotation.x = Math.PI / 2;
            rope.position.set(rx, 1.0, 0);
            bridge.add(rope);
        });

        this.mapRoot.add(bridge);
    }

    // =========================================================================
    // OBJETOS DEL JUEGO: CAJAS '?', AIRDROPS Y CRISTALES DE BIODIVERSIDAD
    // =========================================================================

    buildCrate(pos, rewardType = 'coins') {
        const crateGroup = new THREE.Group();
        crateGroup.position.copy(pos);

        const woodMat = new THREE.MeshStandardMaterial({ color: 0xb45309, roughness: 0.75 });
        const metalTrimMat = new THREE.MeshStandardMaterial({ color: 0xfacc15, metalness: 0.7, roughness: 0.3 });

        const box = new THREE.Mesh(new THREE.BoxGeometry(0.92, 0.92, 0.92), woodMat);
        box.castShadow = true;
        crateGroup.add(box);

        const trimTop = new THREE.Mesh(new THREE.BoxGeometry(0.96, 0.08, 0.96), metalTrimMat);
        trimTop.position.y = 0.44;
        crateGroup.add(trimTop);

        const trimBottom = new THREE.Mesh(new THREE.BoxGeometry(0.96, 0.08, 0.96), metalTrimMat);
        trimBottom.position.y = -0.44;
        crateGroup.add(trimBottom);

        // Signo de interrogación '?' dorado en cada cara (textura compartida para optimizar memoria en celular)
        const tex = this.getCrateQuestionTexture();
        const qMat = new THREE.MeshBasicMaterial({ map: tex, transparent: true });

        const qFront = new THREE.Mesh(new THREE.PlaneGeometry(0.65, 0.65), qMat);
        qFront.position.set(0, 0, 0.47);
        crateGroup.add(qFront);

        const qBack = new THREE.Mesh(new THREE.PlaneGeometry(0.65, 0.65), qMat);
        qBack.rotation.y = Math.PI;
        qBack.position.set(0, 0, -0.47);
        crateGroup.add(qBack);

        this.mapRoot.add(crateGroup);

        this.crates.push({
            group: crateGroup,
            mesh: crateGroup,
            position: pos.clone(),
            rewardType: rewardType,
            intact: true,
            isBroken: false
        });
    }

    buildAirdrop(pos) {
        const dropGroup = new THREE.Group();
        dropGroup.position.copy(pos);

        const crateMat = new THREE.MeshStandardMaterial({ color: 0x0284c7, metalness: 0.5, roughness: 0.4 });
        const canopyMat = new THREE.MeshStandardMaterial({ color: 0xfacc15, roughness: 0.4 });
        const beaconMat = new THREE.MeshBasicMaterial({ color: 0xef4444 });

        const crate = new THREE.Mesh(new THREE.BoxGeometry(1.3, 1.1, 1.3), crateMat);
        crate.position.y = 0.55;
        dropGroup.add(crate);

        const beacon = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.12, 0.22, 12), beaconMat);
        beacon.position.y = 1.15;
        dropGroup.add(beacon);

        const parachute = new THREE.Mesh(
            new THREE.SphereGeometry(2.4, 16, 12, 0, Math.PI * 2, 0, Math.PI * 0.5),
            canopyMat
        );
        parachute.position.y = 4.2;
        parachute.rotation.x = Math.PI;
        dropGroup.add(parachute);

        this.mapRoot.add(dropGroup);
        this.airdrops.push({ group: dropGroup, beacon: beacon });
    }

    buildBiodiversityCrystal(pos, gemId) {
        const gemGroup = new THREE.Group();
        gemGroup.position.copy(pos);

        // Cristal poliédrico brillante (Esmeralda / Amatista colombiana)
        const crystalMat = new THREE.MeshStandardMaterial({
            color: 0xa855f7,
            emissive: 0x9333ea,
            emissiveIntensity: 0.85,
            roughness: 0.1,
            metalness: 0.9
        });
        const crystal = new THREE.Mesh(new THREE.OctahedronGeometry(0.72, 0), crystalMat);
        crystal.position.y = 0.5;
        gemGroup.add(crystal);

        // Anillos giroscópicos exteriores dorados
        const goldRingMat = new THREE.MeshStandardMaterial({
            color: 0xfacc15,
            metalness: 0.9,
            roughness: 0.2,
            emissive: 0xd97706,
            emissiveIntensity: 0.4
        });
        const ring1 = new THREE.Mesh(new THREE.TorusGeometry(0.95, 0.05, 8, 24), goldRingMat);
        ring1.position.y = 0.5;
        gemGroup.add(ring1);

        const ring2 = new THREE.Mesh(new THREE.TorusGeometry(1.15, 0.04, 8, 24), goldRingMat);
        ring2.position.y = 0.5;
        ring2.rotation.x = Math.PI / 3;
        gemGroup.add(ring2);

        // Rotación mística continua
        this.animatedUpdaters.push((delta, time) => {
            crystal.rotation.y += delta * 1.8;
            crystal.rotation.x = Math.sin(time * 2.0) * 0.2;
            ring1.rotation.y += delta * 2.5;
            ring1.rotation.x += delta * 1.5;
            ring2.rotation.z += delta * 1.8;
            gemGroup.position.y = pos.y + Math.sin(time * 2.5) * 0.18;
        });

        this.mapRoot.add(gemGroup);

        this.missionGems.push({
            group: gemGroup,
            mesh: crystal,
            aura: ring1,
            position: pos.clone(),
            baseY: pos.y,
            gemId: gemId,
            collected: false
        });
    }

    buildMysticPortal(pos, rotY, themeColor) {
        const portalGroup = new THREE.Group();
        portalGroup.position.copy(pos);
        portalGroup.rotation.y = 0; // Mirando de frente a la cámara 2.5D

        const goldStoneMat = new THREE.MeshStandardMaterial({
            color: 0xd97706,
            metalness: 0.75,
            roughness: 0.25,
            emissive: 0x92400e,
            emissiveIntensity: 0.2
        });

        // Columnas monolíticas de piedra con inscripciones
        const colGeom = new THREE.BoxGeometry(1.1, 8.2, 1.4);
        const colLeft = new THREE.Mesh(colGeom, goldStoneMat);
        colLeft.position.set(-3.2, 4.1, 0);
        portalGroup.add(colLeft);

        const colRight = new THREE.Mesh(colGeom, goldStoneMat);
        colRight.position.set(3.2, 4.1, 0);
        portalGroup.add(colRight);

        // Dintel superior ceremonial con mascarón solar precolombino
        const lintel = new THREE.Mesh(new THREE.BoxGeometry(8.2, 1.3, 1.6), goldStoneMat);
        lintel.position.set(0, 8.2, 0);
        portalGroup.add(lintel);

        const sunEmblem = new THREE.Mesh(new THREE.OctahedronGeometry(0.85, 0), goldStoneMat);
        sunEmblem.position.set(0, 8.2, 0.9);
        portalGroup.add(sunEmblem);

        // Vórtice dimensional activo
        const vortexColor = themeColor || 0x10b981;
        const vortexMat = new THREE.MeshBasicMaterial({
            color: vortexColor,
            transparent: true,
            opacity: 0.65,
            side: THREE.DoubleSide
        });
        const vortex = new THREE.Mesh(new THREE.CircleGeometry(2.7, 32), vortexMat);
        vortex.position.set(0, 4.1, 0);
        portalGroup.add(vortex);

        // Anillo de energía giratorio
        const ringMat = new THREE.MeshStandardMaterial({
            color: 0xfbbf24,
            emissive: 0xf59e0b,
            emissiveIntensity: 0.8,
            roughness: 0.2
        });
        const energyRing = new THREE.Mesh(new THREE.TorusGeometry(2.85, 0.14, 12, 32), ringMat);
        energyRing.position.set(0, 4.1, 0);
        portalGroup.add(energyRing);

        // Haz celestial hacia el cielo
        const beamMat = new THREE.MeshBasicMaterial({
            color: vortexColor,
            transparent: true,
            opacity: 0.35,
            side: THREE.DoubleSide
        });
        const beam = new THREE.Mesh(new THREE.CylinderGeometry(2.2, 2.2, 45, 18, 1, true), beamMat);
        beam.position.set(0, 22.5, 0);
        portalGroup.add(beam);

        // Animación continua del vórtice
        this.animatedUpdaters.push((delta, time) => {
            vortex.rotation.z += delta * 1.8;
            energyRing.rotation.z -= delta * 2.2;
            vortexMat.opacity = 0.55 + Math.sin(time * 3.0) * 0.2;
            beamMat.opacity = 0.25 + Math.cos(time * 2.5) * 0.15;
        });

        this.mapRoot.add(portalGroup);

        this.portal = {
            group: portalGroup,
            position: pos.clone(),
            ring: energyRing,
            vortex: vortex,
            vortexMat: vortexMat,
            beam: beam,
            beamMat: beamMat,
            isActive: true,
            themeColor: vortexColor
        };
    }

    activatePortal() {
        if (!this.portal || this.portal.isActive) return;
        this.portal.isActive = true;
        this.portal.vortexMat.opacity = 0.85;
        this.portal.beamMat.opacity = 0.55;
    }

    checkPortalEntry(playerPos) {
        if (!this.portal) return false;
        const dx = Math.abs(playerPos.x - this.portal.position.x);
        const dy = Math.abs(playerPos.y - this.portal.position.y);
        const dz = Math.abs(playerPos.z - this.portal.position.z);
        return (dx < 3.2 && dy < 3.8 && dz < 4.5);
    }

    buildTrampoline(pos) {
        const mushroom = new THREE.Group();
        mushroom.position.copy(pos);

        // Tallo robusto de hongo
        const stemMat = new THREE.MeshStandardMaterial({ color: 0xfef08a, roughness: 0.6 });
        const stem = new THREE.Mesh(new THREE.CylinderGeometry(0.65, 0.95, 0.65, 12), stemMat);
        stem.position.y = 0.32;
        mushroom.add(stem);

        // Sombrero saltarín de hongo bioluminiscente con motas brillantes
        const capMat = new THREE.MeshStandardMaterial({
            color: 0xec4899,
            emissive: 0xdb2777,
            emissiveIntensity: 0.65,
            roughness: 0.25
        });
        const cap = new THREE.Mesh(new THREE.SphereGeometry(1.35, 16, 12, 0, Math.PI * 2, 0, Math.PI * 0.5), capMat);
        cap.position.y = 0.58;
        cap.scale.set(1.2, 0.6, 1.2);
        mushroom.add(cap);

        // Anillo de esporas luminosas
        const ringMat = new THREE.MeshBasicMaterial({
            color: 0xf472b6,
            transparent: true,
            opacity: 0.7,
            side: THREE.DoubleSide
        });
        const ring = new THREE.Mesh(new THREE.TorusGeometry(1.5, 0.06, 8, 24), ringMat);
        ring.rotation.x = Math.PI / 2;
        ring.position.y = 0.45;
        mushroom.add(ring);

        // Pulsación suave del hongo
        this.animatedUpdaters.push((delta, time) => {
            const pulse = 1.0 + Math.sin(time * 3.5) * 0.08;
            cap.scale.set(1.2 * pulse, 0.6 / pulse, 1.2 * pulse);
        });

        this.mapRoot.add(mushroom);
        this.trampolines.push({ position: pos, radius: 1.6, boostForce: 21.0 });
    }

    buildThermalSpring(pos) {
        const spring = new THREE.Group();
        spring.position.copy(pos);

        const pool = new THREE.Mesh(
            new THREE.CylinderGeometry(1.8, 2.0, 0.3, 16),
            new THREE.MeshStandardMaterial({ color: 0x475569, roughness: 0.9 })
        );
        pool.position.y = 0.15;
        spring.add(pool);

        const water = new THREE.Mesh(
            new THREE.CylinderGeometry(1.5, 1.5, 0.32, 16),
            new THREE.MeshStandardMaterial({
                color: 0x38bdf8,
                emissive: 0x0284c7,
                emissiveIntensity: 0.6
            })
        );
        water.position.y = 0.18;
        spring.add(water);

        this.mapRoot.add(spring);
        this.trampolines.push({ position: pos, radius: 1.5, boostForce: 22.0 });
    }

    spawnFloatingParkourCoins(spots) {
        const coinGeom = new THREE.CylinderGeometry(0.35, 0.35, 0.08, 14);
        const coinMat = new THREE.MeshStandardMaterial({
            color: 0xffd700,
            metalness: 0.9,
            roughness: 0.2,
            emissive: 0xd97706,
            emissiveIntensity: 0.5
        });

        spots.forEach(pos => {
            const mesh = new THREE.Mesh(coinGeom, coinMat);
            mesh.position.copy(pos);
            mesh.rotation.x = Math.PI / 2;
            this.mapRoot.add(mesh);

            this.floatingCoins.push({
                mesh: mesh,
                baseY: pos.y,
                value: 20,
                collected: false
            });
        });
    }

    checkCrateHits(hitPos, hitRadius, onBreak) {
        for (let i = this.crates.length - 1; i >= 0; i--) {
            const crate = this.crates[i];
            if (!crate.intact) continue;

            const dist = Math.hypot(hitPos.x - crate.position.x, hitPos.z - crate.position.z);
            const distY = Math.abs(hitPos.y - crate.position.y);

            if (dist < hitRadius && distY < 1.8) {
                crate.intact = false;
                this.mapRoot.remove(crate.group);
                this.disposeObject(crate.group);
                this.crates.splice(i, 1);

                this.spawnWoodSplinters(crate.position);

                if (onBreak) {
                    onBreak(crate);
                }
            }
        }
    }

    checkTotemHits(hitPos, hitRadius, onBreak) {
        return false;
    }

    checkMissionGems(playerPos, onCollect) {
        for (let i = this.missionGems.length - 1; i >= 0; i--) {
            const g = this.missionGems[i];
            if (g.collected) continue;

            const dist = g.group.position.distanceTo(playerPos);
            if (dist < 1.8) {
                g.collected = true;
                this.mapRoot.remove(g.group);
                this.disposeObject(g.group);
                this.missionGems.splice(i, 1);

                if (onCollect) {
                    onCollect(g.gemId, g.position);
                }
            }
        }
    }

    spawnWoodSplinters(pos) {
        const splinterGroup = new THREE.Group();
        splinterGroup.position.copy(pos);

        const mat = new THREE.MeshStandardMaterial({ color: 0xb45309 });
        for (let i = 0; i < 8; i++) {
            const sp = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.35, 0.08), mat);
            sp.position.set((Math.random() - 0.5) * 0.6, (Math.random() - 0.5) * 0.6, (Math.random() - 0.5) * 0.6);
            splinterGroup.add(sp);
        }

        this.mapRoot.add(splinterGroup);
        setTimeout(() => {
            this.mapRoot.remove(splinterGroup);
            this.disposeObject(splinterGroup);
        }, 800);
    }

    // =========================================================================
    // BUCLE DE ACTUALIZACIÓN
    // =========================================================================
    update(delta) {
        const time = performance.now() * 0.003;

        for (let i = 0; i < this.animatedUpdaters.length; i++) {
            this.animatedUpdaters[i](delta, time);
        }

        // Cristales de biodiversidad
        for (let i = 0; i < this.missionGems.length; i++) {
            const g = this.missionGems[i];
            if (g.collected) continue;
            g.mesh.rotation.y += 0.035;
            g.aura.rotation.z += 0.02;
            g.group.position.y = g.baseY + Math.sin(time * 2.5 + i) * 0.25;
        }

        // Portal dimensional
        if (this.portal) {
            this.portal.ring.rotation.z += (this.portal.isActive ? 0.05 : 0.015);
            this.portal.vortex.rotation.z -= (this.portal.isActive ? 0.04 : 0.01);
            if (this.portal.isActive) {
                this.portal.beamMat.opacity = 0.45 + Math.sin(time * 4) * 0.15;
            }
        }

        // Monedas
        for (let i = 0; i < this.floatingCoins.length; i++) {
            const c = this.floatingCoins[i];
            if (c.collected) continue;
            c.mesh.rotation.z += 0.04;
            c.mesh.position.y = c.baseY + Math.sin(time + i) * 0.3;
        }
    }

    checkTrampolines(player) {
        for (const t of this.trampolines) {
            const dist = Math.hypot(player.mesh.position.x - t.position.x, player.mesh.position.z - t.position.z);
            const dy = Math.abs(player.mesh.position.y - t.position.y);
            if (dist < t.radius && dy < 1.1 && player.velocity.y <= 0) {
                player.bounceTrampoline(t.boostForce);
                break;
            }
        }
    }

    checkTrampolinesForEnemies(enemies) {
        for (const t of this.trampolines) {
            for (const enemy of enemies) {
                if (enemy.type === 'dummy') continue;
                const dist = Math.hypot(enemy.mesh.position.x - t.position.x, enemy.mesh.position.z - t.position.z);
                const dy = Math.abs(enemy.mesh.position.y - t.position.y);
                if (dist < t.radius && dy < 1.1 && enemy.velocity.y <= 0) {
                    enemy.velocity.y = t.boostForce;
                    enemy.isGrounded = false;
                }
            }
        }
    }

    checkFloatingCoins(playerPos, onCollect) {
        for (let i = this.floatingCoins.length - 1; i >= 0; i--) {
            const c = this.floatingCoins[i];
            if (c.collected) continue;

            const dist = c.mesh.position.distanceTo(playerPos);
            if (dist < 1.6) {
                c.collected = true;
                this.mapRoot.remove(c.mesh);
                if (onCollect) onCollect(c.value, c.mesh.position);
                this.floatingCoins.splice(i, 1);
            }
        }
    }

    // =========================================================================
    // MÓDULO DE CAMPAÑA INDIVIDUAL "AVENTURA NINJA": PLATAFORMAS 3D & 10 BIOMAS
    // =========================================================================

    getGroundHeightAt(x, y, z) {
        if (!this.isCampaignMode) {
            return 0; // En arena regular, suelo en Y = 0
        }

        let bestY = -999;
        for (let i = 0; i < this.platforms.length; i++) {
            const p = this.platforms[i];
            if (x >= p.minX && x <= p.maxX && z >= p.minZ && z <= p.maxZ) {
                if (y >= p.y - 0.45) {
                    if (p.y > bestY) bestY = p.y;
                }
            }
        }
        return bestY;
    }

    addPlatformMesh(x, y, z, width, length, material, isMoving = false) {
        const group = new THREE.Group();
        group.position.set(x, y, z);

        const thickness = 1.6;
        // 1. Bloque base de roca / mampostería
        const geom = new THREE.BoxGeometry(width, thickness, length);
        const mesh = new THREE.Mesh(geom, material);
        mesh.position.y = -thickness / 2;
        mesh.receiveShadow = true;
        mesh.castShadow = true;
        group.add(mesh);

        // 2. Capa superior de hierba / musgo / baldosas vivas con ligero bisel
        const grassMat = new THREE.MeshStandardMaterial({
            color: 0x22c55e,
            roughness: 0.75,
            metalness: 0.1
        });
        const topGrass = new THREE.Mesh(new THREE.BoxGeometry(width + 0.35, 0.24, length + 0.35), grassMat);
        topGrass.position.y = 0.08;
        topGrass.receiveShadow = true;
        group.add(topGrass);

        // 3. Cenefa dorada / precolombina frontal (Visible directamente hacia la cámara 2.5D)
        const goldAccentMat = new THREE.MeshStandardMaterial({
            color: 0xf59e0b,
            metalness: 0.85,
            roughness: 0.25,
            emissive: 0xb45309,
            emissiveIntensity: 0.3
        });
        const frontTrim = new THREE.Mesh(new THREE.BoxGeometry(width + 0.2, 0.26, 0.25), goldAccentMat);
        frontTrim.position.set(0, -0.05, length / 2 + 0.1);
        group.add(frontTrim);

        // 4. Relieve decorativo en la cara frontal (rombo sagrado precolombino)
        if (width >= 6.0) {
            const diamondGeom = new THREE.OctahedronGeometry(0.38, 0);
            diamondGeom.scale(1.2, 1.2, 0.2);
            const diamondMesh = new THREE.Mesh(diamondGeom, goldAccentMat);
            diamondMesh.position.set(0, -thickness / 2, length / 2 + 0.15);
            group.add(diamondMesh);
        }

        // 5. Raíces colgantes / lianas bajo la plataforma
        const vineMat = new THREE.MeshStandardMaterial({ color: 0x14532d, roughness: 0.9 });
        const numRoots = Math.min(5, Math.floor(width / 2.2));
        for (let i = 0; i < numRoots; i++) {
            const rootX = -width / 2 + 0.8 + (i / Math.max(1, numRoots - 1)) * (width - 1.6);
            const rootHeight = 0.85 + (i % 3) * 0.45;
            const root = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.02, rootHeight, 6), vineMat);
            root.position.set(rootX, -thickness - rootHeight / 2, length / 2 - 0.2);
            root.rotation.z = (i % 2 === 0 ? 0.12 : -0.12);
            group.add(root);
        }

        // 6. Pilares de soporte de madera / piedra si la plataforma está cerca del suelo o en zonas bajas
        if (y <= 1.0) {
            const pillarMat = new THREE.MeshStandardMaterial({ color: 0x3f3f46, roughness: 0.85 });
            [-width / 2 + 1.2, width / 2 - 1.2].forEach(px => {
                const pillar = new THREE.Mesh(new THREE.CylinderGeometry(0.32, 0.45, 12.0, 8), pillarMat);
                pillar.position.set(px, -thickness - 6.0, 0);
                group.add(pillar);
            });
        }

        this.mapRoot.add(group);

        const halfW = width / 2;
        const halfL = length / 2;
        this.platforms.push({
            group: group,
            minX: x - halfW,
            maxX: x + halfW,
            minZ: z - halfL,
            maxZ: z + halfL,
            y: y,
            width: width,
            length: length,
            isMoving: isMoving
        });

        return group;
    }

    updatePlatformHitbox(group, x, y, z, width, length) {
        for (let i = 0; i < this.platforms.length; i++) {
            const p = this.platforms[i];
            if (p.group === group) {
                const halfW = width / 2;
                const halfL = length / 2;
                p.minX = x - halfW;
                p.maxX = x + halfW;
                p.minZ = z - halfL;
                p.maxZ = z + halfL;
                p.y = y;
                break;
            }
        }
    }

    buildStartGate(pos) {
        const gate = new THREE.Group();
        gate.position.copy(pos);

        const poleMat = new THREE.MeshStandardMaterial({ color: 0x854d0e, roughness: 0.7 });
        const goldMat = new THREE.MeshStandardMaterial({ color: 0xf59e0b, metalness: 0.8, roughness: 0.2 });
        const bannerMat = new THREE.MeshStandardMaterial({ color: 0xef4444, roughness: 0.5 });

        // Postes de bambú/madera a los lados de la plataforma en Z
        [-2.8, 2.8].forEach(pz => {
            const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.28, 5.2, 12), poleMat);
            pole.position.set(0, 2.6, pz);
            pole.castShadow = true;
            gate.add(pole);

            // Remates dorados en la punta
            const finial = new THREE.Mesh(new THREE.ConeGeometry(0.35, 0.6, 8), goldMat);
            finial.position.set(0, 5.5, pz);
            gate.add(finial);
        });

        // Travesaño superior
        const crossbar = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.18, 6.2, 12), poleMat);
        crossbar.rotation.x = Math.PI / 2;
        crossbar.position.y = 4.8;
        gate.add(crossbar);

        // Estandarte ceremonial de bienvenida con flecos
        const banner = new THREE.Mesh(new THREE.PlaneGeometry(3.6, 1.2), bannerMat);
        banner.position.set(0.1, 4.0, 0);
        banner.rotation.y = Math.PI / 2;
        gate.add(banner);

        this.mapRoot.add(gate);
    }

    buildFloatingCoinsArc(startX, startY, startZ, count = 3) {
        const spots = [];
        for (let i = 0; i < count; i++) {
            const coinZ = startZ - i * 1.6;
            const coinY = startY + Math.sin((i / (count - 1)) * Math.PI) * 1.5 + 0.8;
            spots.push(new THREE.Vector3(startX, coinY, coinZ));
        }
        this.spawnFloatingParkourCoins(spots);
    }

    buildFloatingCoins(spots) {
        this.spawnFloatingParkourCoins(spots);
    }

    // Props decorativos para los 10 biomas
    buildCactus(pos) {
        const c = new THREE.Group();
        c.position.copy(pos);
        const mat = new THREE.MeshStandardMaterial({ color: 0x15803d, roughness: 0.7 });
        const stem = new THREE.Mesh(new THREE.CylinderGeometry(0.35, 0.38, 4.2, 12), mat);
        stem.position.y = 2.1;
        c.add(stem);

        const armL = new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.22, 1.8, 10), mat);
        armL.position.set(-0.8, 2.4, 0);
        c.add(armL);

        const armR = new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.22, 1.8, 10), mat);
        armR.position.set(0.8, 2.9, 0);
        c.add(armR);

        this.mapRoot.add(c);
    }

    buildMangrove(pos) {
        const m = new THREE.Group();
        m.position.copy(pos);
        const rootMat = new THREE.MeshStandardMaterial({ color: 0x3f3f46, roughness: 0.9 });
        const leafMat = new THREE.MeshStandardMaterial({ color: 0x065f46, roughness: 0.6 });

        for (let i = 0; i < 4; i++) {
            const angle = (i / 4) * Math.PI * 2;
            const root = new THREE.Mesh(new THREE.TorusGeometry(1.4, 0.25, 8, 16, Math.PI), rootMat);
            root.position.set(Math.cos(angle) * 1.1, 0.4, Math.sin(angle) * 1.1);
            root.rotation.y = angle;
            m.add(root);
        }

        const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.5, 0.7, 3.8, 12), rootMat);
        trunk.position.y = 2.2;
        m.add(trunk);

        const foliage = new THREE.Mesh(new THREE.SphereGeometry(3.2, 14, 12), leafMat);
        foliage.scale.set(1.4, 0.7, 1.4);
        foliage.position.y = 4.4;
        m.add(foliage);

        this.mapRoot.add(m);
    }

    buildMorichePalm(pos) {
        const p = new THREE.Group();
        p.position.copy(pos);
        const trunkMat = new THREE.MeshStandardMaterial({ color: 0x78716c, roughness: 0.8 });
        const frondMat = new THREE.MeshStandardMaterial({ color: 0x65a30d, roughness: 0.6 });

        const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.28, 0.45, 7.5, 12), trunkMat);
        trunk.position.y = 3.75;
        p.add(trunk);

        for (let i = 0; i < 8; i++) {
            const angle = (i / 8) * Math.PI * 2;
            const frond = new THREE.Mesh(new THREE.ConeGeometry(0.65, 2.6, 6), frondMat);
            frond.position.set(Math.cos(angle) * 1.2, 7.5, Math.sin(angle) * 1.2);
            frond.rotation.x = Math.PI / 3;
            frond.rotation.y = angle;
            p.add(frond);
        }
        this.mapRoot.add(p);
    }

    buildRainbowAlgae(pos, colorHex = 0xec4899) {
        const a = new THREE.Group();
        a.position.copy(pos);
        const mat = new THREE.MeshStandardMaterial({ color: colorHex, roughness: 0.4, emissive: colorHex, emissiveIntensity: 0.2 });
        for (let i = 0; i < 6; i++) {
            const angle = (i / 6) * Math.PI * 2;
            const petal = new THREE.Mesh(new THREE.SphereGeometry(0.6, 10, 8), mat);
            petal.scale.set(1.5, 0.25, 0.8);
            petal.position.set(Math.cos(angle) * 0.9, 0.1, Math.sin(angle) * 0.9);
            petal.rotation.y = angle;
            a.add(petal);
        }
        this.mapRoot.add(a);
    }

    buildTayronaMonolith(pos) {
        const m = new THREE.Group();
        m.position.copy(pos);
        const stoneMat = new THREE.MeshStandardMaterial({ color: 0x57534e, roughness: 0.85 });
        const goldMat = new THREE.MeshStandardMaterial({ color: 0xf59e0b, metalness: 0.8, roughness: 0.2 });

        const base = new THREE.Mesh(new THREE.CylinderGeometry(1.6, 1.8, 1.2, 16), stoneMat);
        base.position.y = 0.6;
        m.add(base);

        const pillar = new THREE.Mesh(new THREE.BoxGeometry(1.4, 4.8, 1.4), stoneMat);
        pillar.position.y = 3.2;
        m.add(pillar);

        const mask = new THREE.Mesh(new THREE.BoxGeometry(1.5, 1.5, 0.3), goldMat);
        mask.position.set(0, 4.2, 0.75);
        m.add(mask);

        this.mapRoot.add(m);
    }

    buildCrystalTower(pos) {
        const c = new THREE.Group();
        c.position.copy(pos);
        const crystalMat = new THREE.MeshStandardMaterial({
            color: 0xc084fc,
            emissive: 0x9333ea,
            emissiveIntensity: 0.6,
            roughness: 0.2,
            metalness: 0.7,
            transparent: true,
            opacity: 0.88
        });

        const spire = new THREE.Mesh(new THREE.ConeGeometry(0.9, 5.5, 6), crystalMat);
        spire.position.y = 2.75;
        c.add(spire);

        this.mapRoot.add(c);
    }

    // =========================================================================
    // ELEMENTOS COLOMBIANOS DE FONDO PARALLAX CINEMÁTICO 2.5D
    // =========================================================================
    buildWaxPalm(pos, parent) {
        const palm = new THREE.Group();
        palm.position.copy(pos);

        const trunkMat = new THREE.MeshStandardMaterial({ color: 0xd4d4d8, roughness: 0.5 });
        const leafMat = new THREE.MeshStandardMaterial({ color: 0x15803d, roughness: 0.6 });

        const trunkHeight = 18.0;
        const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.35, 0.65, trunkHeight, 10), trunkMat);
        trunk.position.y = trunkHeight / 2;
        palm.add(trunk);

        // Corona estrellada en la cima (Palma de cera del Quindío)
        const crown = new THREE.Group();
        crown.position.y = trunkHeight;
        for (let i = 0; i < 9; i++) {
            const angle = (i / 9) * Math.PI * 2;
            const frond = new THREE.Mesh(new THREE.BoxGeometry(0.22, 0.08, 3.8), leafMat);
            frond.position.set(Math.cos(angle) * 1.8, -0.4, Math.sin(angle) * 1.8);
            frond.rotation.y = angle;
            frond.rotation.x = 0.35;
            crown.add(frond);
        }
        palm.add(crown);

        (parent || this.mapRoot).add(palm);
    }

    buildGiantCeiba(pos, parent) {
        const tree = new THREE.Group();
        tree.position.copy(pos);

        const trunkMat = new THREE.MeshStandardMaterial({ color: 0x52525b, roughness: 0.85 });
        const leafMat = new THREE.MeshStandardMaterial({ color: 0x166534, roughness: 0.7 });

        const trunkHeight = 14.0;
        const trunk = new THREE.Mesh(new THREE.CylinderGeometry(1.2, 2.4, trunkHeight, 12), trunkMat);
        trunk.position.y = trunkHeight / 2;
        tree.add(trunk);

        // Raíces tablares gigantes
        for (let r = 0; r < 4; r++) {
            const angle = (r / 4) * Math.PI * 2;
            const root = new THREE.Mesh(new THREE.BoxGeometry(0.4, 4.0, 2.5), trunkMat);
            root.position.set(Math.cos(angle) * 1.8, 2.0, Math.sin(angle) * 1.8);
            root.rotation.y = angle;
            tree.add(root);
        }

        // Copa de nube tropical ancha
        const foliage = new THREE.Mesh(new THREE.SphereGeometry(7.5, 16, 12), leafMat);
        foliage.scale.set(1.6, 0.6, 1.6);
        foliage.position.y = trunkHeight + 2.0;
        tree.add(foliage);

        (parent || this.mapRoot).add(tree);
    }

    buildGiantFrailejon(pos, parent) {
        const f = new THREE.Group();
        f.position.copy(pos);
        f.scale.set(3.5, 3.5, 3.5);

        const stemMat = new THREE.MeshStandardMaterial({ color: 0x78716c, roughness: 0.95 });
        const leafMat = new THREE.MeshStandardMaterial({ color: 0xd97706, roughness: 0.9 });
        const flowerMat = new THREE.MeshStandardMaterial({ color: 0xfacc15, roughness: 0.3, emissive: 0xb45309, emissiveIntensity: 0.3 });

        const stem = new THREE.Mesh(new THREE.CylinderGeometry(0.35, 0.45, 2.5, 12), stemMat);
        stem.position.y = 1.25;
        f.add(stem);

        for (let l = 0; l < 10; l++) {
            const angle = (l / 10) * Math.PI * 2;
            const leaf = new THREE.Mesh(new THREE.ConeGeometry(0.24, 1.3, 8), leafMat);
            leaf.position.set(Math.cos(angle) * 0.5, 2.5, Math.sin(angle) * 0.5);
            leaf.rotation.x = Math.PI / 3.2;
            leaf.rotation.y = angle;
            f.add(leaf);
        }

        const flower = new THREE.Mesh(new THREE.SphereGeometry(0.32, 10, 10), flowerMat);
        flower.position.y = 2.8;
        f.add(flower);

        (parent || this.mapRoot).add(f);
    }

    buildParallaxBackdrop(worldNum = 1, totalLength = 110) {
        const worldMeta = CAMPAIGN_WORLDS[worldNum] || CAMPAIGN_WORLDS[1];
        const backdropGroup = new THREE.Group();
        backdropGroup.name = 'parallaxBackdrop';

        // 1. SOL / LUNA CELESTIAL MAJESTUOSO (Z = -55)
        const sunRadius = 9.0;
        const sunGeom = new THREE.CircleGeometry(sunRadius, 32);
        const sunColor = (worldNum === 4 || worldNum === 8) ? 0x93c5fd : 0xfef08a;
        const sunMat = new THREE.MeshBasicMaterial({
            color: sunColor,
            transparent: true,
            opacity: 0.95
        });
        const sunMesh = new THREE.Mesh(sunGeom, sunMat);
        sunMesh.position.set(totalLength * 0.45, 22.0, -55.0);
        backdropGroup.add(sunMesh);

        // Corona / Halo luminoso del sol
        const haloGeom = new THREE.RingGeometry(sunRadius * 0.95, sunRadius * 2.2, 32);
        const haloMat = new THREE.MeshBasicMaterial({
            color: sunColor,
            transparent: true,
            opacity: 0.35,
            side: THREE.DoubleSide
        });
        const haloMesh = new THREE.Mesh(haloGeom, haloMat);
        haloMesh.position.copy(sunMesh.position);
        backdropGroup.add(haloMesh);

        // 2. CAPA 1: GRAN CORDILLERA / MONTAÑAS ANDINAS (Z = -44)
        const mountainDarkColor = new THREE.Color(worldMeta.groundColor).multiplyScalar(0.4).getHex();
        const mountainMat = new THREE.MeshStandardMaterial({
            color: mountainDarkColor,
            roughness: 0.95,
            metalness: 0.1
        });

        const startX = -35;
        const endX = totalLength + 45;
        const stepX = 14.0;
        for (let mx = startX; mx <= endX; mx += stepX) {
            const peakHeight = 16.0 + Math.sin(mx * 0.15) * 7.0 + (mx % 3) * 4.0;
            const mountainGeom = new THREE.ConeGeometry(13.0, peakHeight, 4);
            const mMesh = new THREE.Mesh(mountainGeom, mountainMat);
            mMesh.position.set(mx, peakHeight / 2 - 4.0, -44.0);
            mMesh.rotation.y = (mx * 0.7);
            backdropGroup.add(mMesh);
        }

        // 3. CAPA 2: BANCO DE NUBES Y NIEBLA FLOTANTE (Z = -32)
        const cloudMat = new THREE.MeshBasicMaterial({
            color: worldMeta.fogColor,
            transparent: true,
            opacity: 0.42
        });
        const cloudGeom = new THREE.SphereGeometry(6.5, 12, 10);
        cloudGeom.scale(1.8, 0.5, 0.7);

        for (let cx = startX; cx <= endX; cx += 22.0) {
            const cloud = new THREE.Mesh(cloudGeom, cloudMat);
            const cloudBaseY = 12.0 + Math.sin(cx * 0.2) * 4.0;
            cloud.position.set(cx, cloudBaseY, -32.0);
            backdropGroup.add(cloud);

            const driftSpeed = 0.4 + (cx % 5) * 0.08;
            this.animatedUpdaters.push((delta, time) => {
                cloud.position.x = cx + Math.sin(time * driftSpeed) * 3.5;
            });
        }

        // 4. CAPA 3: BOSQUE ANCESTRAL Y MONOLITOS (Z = -18 a -26)
        for (let fx = startX; fx <= endX; fx += 9.5) {
            const propZ = -18.0 - (Math.abs(fx) % 4) * 2.5;
            const propY = Math.sin(fx * 0.1) * 2.0;

            if (worldNum === 2) {
                this.buildWaxPalm(new THREE.Vector3(fx, propY, propZ), backdropGroup);
            } else if (worldNum === 4) {
                this.buildGiantFrailejon(new THREE.Vector3(fx, propY, propZ), backdropGroup);
            } else {
                this.buildGiantCeiba(new THREE.Vector3(fx, propY, propZ), backdropGroup);
            }
        }

        // 5. CAPA 4: CAÑÓN PROFUNDO Y RÍO SAGRADO (Y = -14.5, Z = -6.0)
        const riverLength = endX - startX + 30;
        const riverGeom = new THREE.PlaneGeometry(riverLength, 24);
        const riverMat = new THREE.MeshStandardMaterial({
            color: (worldNum === 4 ? 0x67e8f9 : (worldNum === 5 ? 0x9a3412 : 0x06b6d4)),
            roughness: 0.1,
            metalness: 0.8,
            emissive: (worldNum === 4 ? 0x0284c7 : (worldNum === 5 ? 0x7c2d12 : 0x0891b2)),
            emissiveIntensity: 0.55
        });
        const riverMesh = new THREE.Mesh(riverGeom, riverMat);
        riverMesh.rotation.x = -Math.PI / 2;
        riverMesh.position.set(startX + riverLength / 2, -14.5, -6.0);
        backdropGroup.add(riverMesh);

        const riverMistMat = new THREE.MeshBasicMaterial({
            color: worldMeta.fogColor,
            transparent: true,
            opacity: 0.35,
            side: THREE.DoubleSide
        });
        const riverMist = new THREE.Mesh(new THREE.PlaneGeometry(riverLength, 8), riverMistMat);
        riverMist.rotation.x = -Math.PI / 2;
        riverMist.position.set(startX + riverLength / 2, -13.2, -6.0);
        backdropGroup.add(riverMist);

        this.animatedUpdaters.push((delta, time) => {
            riverMesh.position.y = -14.5 + Math.sin(time * 1.5) * 0.25;
            riverMist.position.y = -13.2 + Math.cos(time * 1.2) * 0.3;
        });

        // 6. CAPA 5: ENCUADRE DE PRIMER PLANO (Z = +3.8 a +4.5)
        const vineMat = new THREE.MeshStandardMaterial({
            color: 0x064e3b,
            roughness: 0.8
        });
        for (let vx = startX; vx <= endX; vx += 15.0) {
            const vineGroup = new THREE.Group();
            vineGroup.position.set(vx + (vx % 3) * 1.5, 7.5, 3.8);

            const vineStem = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.05, 5.5, 8), vineMat);
            vineStem.position.y = -2.75;
            vineStem.rotation.z = Math.sin(vx) * 0.15;
            vineGroup.add(vineStem);

            for (let l = 0; l < 4; l++) {
                const leaf = new THREE.Mesh(new THREE.SphereGeometry(0.45, 8, 8), vineMat);
                leaf.scale.set(1.5, 0.4, 0.8);
                leaf.position.set((l % 2 === 0 ? 0.2 : -0.2), -1.2 - l * 1.0, 0);
                leaf.rotation.z = (l % 2 === 0 ? 0.4 : -0.4);
                vineGroup.add(leaf);
            }

            backdropGroup.add(vineGroup);
        }

        this.mapRoot.add(backdropGroup);
    }

    spawnBiomeProps(worldNum, platX, platY, platZ) {
        const side = (Math.random() < 0.5 ? -1 : 1);
        const propPos = new THREE.Vector3(platX + side * (6.5 + Math.random() * 3.0), platY, platZ);

        if (worldNum === 1) {
            this.buildCeibaTree(propPos);
        } else if (worldNum === 2) {
            this.buildCoffeeBush(propPos);
        } else if (worldNum === 3) {
            this.buildCoconutPalm(propPos);
        } else if (worldNum === 4) {
            this.buildFrailejon(propPos);
        } else if (worldNum === 5) {
            this.buildCactus(propPos);
        } else if (worldNum === 6) {
            this.buildMangrove(propPos);
        } else if (worldNum === 7) {
            this.buildMorichePalm(propPos);
        } else if (worldNum === 8) {
            const colors = [0xec4899, 0xfacc15, 0x10b981, 0x0284c7, 0x8b5cf6];
            this.buildRainbowAlgae(propPos, colors[Math.floor(Math.random() * colors.length)]);
        } else if (worldNum === 9) {
            this.buildTayronaMonolith(propPos);
        } else if (worldNum === 10) {
            this.buildCrystalTower(propPos);
        }
    }

    // =========================================================================
    // GENERADOR DE NIVELES 2.5D PROCEDURAL DE CAMPAÑA CINEMÁTICA
    // =========================================================================
    buildCampaignLevel(worldNum = 1, levelNum = 1) {
        this.isCampaignMode = true;
        this.campaignEnemySpawns = [];
        this.currentCampaignWorldNum = worldNum;
        this.currentCampaignLevelNum = levelNum;

        const worldMeta = CAMPAIGN_WORLDS[worldNum] || CAMPAIGN_WORLDS[1];
        const lvlMeta = (worldMeta.levels && worldMeta.levels[levelNum - 1]) ? worldMeta.levels[levelNum - 1] : { length: 110, targetTime: 70 };

        while (this.mapRoot.children.length > 0) {
            const child = this.mapRoot.children[0];
            this.mapRoot.remove(child);
            this.disposeObject(child);
        }

        this.trampolines = [];
        this.floatingCoins = [];
        this.crates = [];
        this.missionGems = [];
        this.airdrops = [];
        this.totems = [];
        this.portal = null;
        this.platforms = [];
        this.animatedUpdaters = [];

        // Atmósfera visual según el mundo de Colombia
        if (this.scene.background && this.scene.background.setHex) {
            this.scene.background.setHex(worldMeta.skyColor);
        } else {
            this.scene.background = new THREE.Color(worldMeta.skyColor);
        }

        if (this.scene.fog) {
            this.scene.fog.color.setHex(worldMeta.fogColor);
            this.scene.fog.density = 0.012;
        }

        const themeMat = new THREE.MeshStandardMaterial({
            color: worldMeta.groundColor,
            roughness: 0.8
        });
        const goldAccentMat = new THREE.MeshStandardMaterial({ color: 0xf59e0b, metalness: 0.8, roughness: 0.2 });

        const totalLength = lvlMeta.length || 110;
        this.campaignTotalLength = totalLength;

        // 1. Gran Fondo Parallax Cinemático Multicapa
        this.buildParallaxBackdrop(worldNum, totalLength);

        // 2. Partículas ambientales de esporas y luciérnagas de la biodiversidad
        const fireflyGroup = new THREE.Group();
        const fireflyMat = new THREE.MeshBasicMaterial({
            color: (worldNum === 4 ? 0x67e8f9 : (worldNum === 2 ? 0xfef08a : 0x4ade80)),
            transparent: true,
            opacity: 0.85
        });
        const fireflyGeom = new THREE.SphereGeometry(0.14, 6, 6);
        const fireflies = [];
        for (let f = 0; f < 35; f++) {
            const ff = new THREE.Mesh(fireflyGeom, fireflyMat);
            const fx = Math.random() * totalLength;
            const fy = 1.0 + Math.random() * 5.5;
            const fz = (Math.random() - 0.5) * 6.0;
            ff.position.set(fx, fy, fz);
            fireflyGroup.add(ff);
            fireflies.push({ mesh: ff, baseY: fy, speed: 1.5 + Math.random() * 2.0, phase: Math.random() * Math.PI * 2 });
        }
        this.mapRoot.add(fireflyGroup);
        this.animatedUpdaters.push((delta, time) => {
            for (let f = 0; f < fireflies.length; f++) {
                const fly = fireflies[f];
                fly.mesh.position.y = fly.baseY + Math.sin(time * fly.speed + fly.phase) * 0.7;
                fly.mesh.position.x += Math.cos(time * 0.8 + fly.phase) * delta * 0.4;
            }
        });

        // 3. Plataforma de Inicio 2.5D
        this.addPlatformMesh(0, 0, 0, 16, 10, themeMat);
        this.buildStartGate(new THREE.Vector3(-4, 0, 0));

        // 4. Circuito de Plataformas a lo largo del eje X (Side-scroller)
        let currentX = 8.0;
        let currentY = 0;
        let sectionIndex = 0;

        const gemPlacements = [Math.floor(totalLength * 0.28), Math.floor(totalLength * 0.58), Math.floor(totalLength * 0.84)];
        let gemsPlaced = 0;

        while (currentX < totalLength) {
            sectionIndex++;
            const platWidth = 7.5 + (sectionIndex % 3) * 2.5;
            const platDepth = 10.0;
            const gap = 3.2 + (worldNum > 4 ? 0.6 : 0) + (worldNum > 7 ? 0.6 : 0);
            const platX = currentX + gap + platWidth / 2;

            const heightVariation = Math.sin(sectionIndex * 0.85) * 1.8;
            currentY = Math.max(0, heightVariation);

            const isMoving = (worldNum >= 4 && sectionIndex % 3 === 0);
            const platGroup = this.addPlatformMesh(platX, currentY, 0, platWidth, platDepth, themeMat, isMoving);

            if (isMoving) {
                const startY = currentY;
                const moveDist = 2.2;
                const speed = 1.3 + worldNum * 0.09;
                this.animatedUpdaters.push((delta, time) => {
                    const offset = Math.sin(time * speed) * moveDist;
                    platGroup.position.y = startY + offset;
                    this.updatePlatformHitbox(platGroup, platX, startY + offset, 0, platWidth, platDepth);
                });
            }

            // Trampolín de hongo saltarín en saltos con abismos
            if (gap > 3.4 && sectionIndex % 2 === 1) {
                this.buildTrampoline(new THREE.Vector3(platX - platWidth / 2 + 1.2, currentY, 0));
            }

            // Cajas Sorpresa con '?'
            if (sectionIndex % 2 === 0) {
                this.buildCrate(new THREE.Vector3(platX, currentY + 0.46, 0), (sectionIndex % 4 === 0) ? 'fruit' : 'coins');
            }

            // Cristales de Energía de la Biodiversidad (3 por nivel)
            if (gemsPlaced < 3 && platX >= gemPlacements[gemsPlaced]) {
                gemsPlaced++;
                this.buildBiodiversityCrystal(new THREE.Vector3(platX, currentY + 1.4, 0), `gem_w${worldNum}_l${levelNum}_${gemsPlaced}`);
            }

            // Monedas flotantes en arco
            this.buildFloatingCoinsArc(platX - 1.5, currentY, 0, 3);

            // Spawns de enemigos de nivel (alineados en el plano 2.5D)
            if (sectionIndex > 1 && sectionIndex % 2 === 0) {
                this.campaignEnemySpawns.push(new THREE.Vector3(platX, currentY, 0));
            }

            // Props biológicos de media distancia
            this.spawnBiomeProps(worldNum, platX, currentY, -14);
            this.spawnBiomeProps(worldNum, platX + 3.5, currentY, -24);

            currentX = platX + platWidth / 2;
        }

        // 5. Plataforma Final de Meta con el Portal Dimensional
        const endX = currentX + 8;
        const endY = currentY;
        this.addPlatformMesh(endX, endY, 0, 16, 12, goldAccentMat);

        // Portal Místico de Victoria (Perpendicular al camino lateral)
        this.buildMysticPortal(new THREE.Vector3(endX, endY, 0), 0, worldMeta.groundColor);
        if (this.portal) {
            this.portal.isActive = true;
        }
    }

    // =========================================================================
    // ARENA 2.5D CINEMÁTICA PARA ENFRENTAMIENTO CONTRA JEFE DE MUNDO
    // =========================================================================
    buildCampaignBossArena(worldNum = 1) {
        this.isCampaignMode = true;
        this.campaignEnemySpawns = [];
        this.currentCampaignWorldNum = worldNum;
        const worldMeta = CAMPAIGN_WORLDS[worldNum] || CAMPAIGN_WORLDS[1];

        while (this.mapRoot.children.length > 0) {
            const child = this.mapRoot.children[0];
            this.mapRoot.remove(child);
            this.disposeObject(child);
        }

        this.trampolines = [];
        this.floatingCoins = [];
        this.crates = [];
        this.missionGems = [];
        this.airdrops = [];
        this.totems = [];
        this.portal = null;
        this.platforms = [];
        this.animatedUpdaters = [];

        if (this.scene.background && this.scene.background.setHex) {
            this.scene.background.setHex(worldMeta.skyColor);
        }
        if (this.scene.fog) {
            this.scene.fog.color.setHex(worldMeta.fogColor);
            this.scene.fog.density = 0.015;
        }

        // 1. Fondo Parallax de la Arena de Jefe
        this.buildParallaxBackdrop(worldNum, 40);

        // 2. Suelo principal de combate 2.5D (de X = -24 a +24, profundidad Z = 12m)
        const arenaMat = new THREE.MeshStandardMaterial({ color: worldMeta.groundColor, roughness: 0.85 });
        this.addPlatformMesh(0, 0, 0, 48, 12, arenaMat);

        // 3. Plataformas tácticas elevadas para maniobras aéreas ninja (Estilo Super Smash Bros / Dead Cells)
        const platElevMat = new THREE.MeshStandardMaterial({ color: 0xf59e0b, metalness: 0.7, roughness: 0.3 });
        this.addPlatformMesh(-9.0, 3.8, 0, 7.5, 8, platElevMat);
        this.addPlatformMesh(9.0, 3.8, 0, 7.5, 8, platElevMat);

        // 4. Cajas de fruta curativa en los extremos de la arena
        this.buildCrate(new THREE.Vector3(-18, 0.45, 0), 'fruit');
        this.buildCrate(new THREE.Vector3(18, 0.45, 0), 'fruit');

        // 5. Cristal de Biodiversidad como recompensa central
        this.buildBiodiversityCrystal(new THREE.Vector3(0, 2.0, 0), `boss_reward_w${worldNum}`);
    }

}
