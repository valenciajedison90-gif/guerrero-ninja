// js/world.js - Escenarios y Territorios de Colombia: NINJA COLOMBIA ARENA
// 4 Biomas Auténticos: Selva Amazónica, Eje Cafetero, Páramo Andino y Caribe Colombiano
// Incluye: Cajas Sorpresa con '?', Airdrops con Paracaídas, Cristales de Biodiversidad y Portales Precolombinos

import * as THREE from 'three';
import { CAMPAIGN_WORLDS } from './campaign.js?v=9.0';

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

    disposeObject(obj) {
        if (obj.geometry) obj.geometry.dispose();
        if (obj.material) {
            if (Array.isArray(obj.material)) {
                obj.material.forEach(m => m.dispose());
            } else {
                obj.material.dispose();
            }
        }
        if (obj.children) {
            obj.children.forEach(c => this.disposeObject(c));
        }
    }

    // =========================================================================
    // 1. BIOMA: SELVA AMAZÓNICA
    // =========================================================================
    buildSelvaAmazonica() {
        const groundMat = new THREE.MeshStandardMaterial({ color: 0x15803d, roughness: 0.85 });
        const groundGeom = new THREE.CylinderGeometry(56, 58, 2.2, 36);
        const ground = new THREE.Mesh(groundGeom, groundMat);
        ground.position.y = -1.1;
        ground.receiveShadow = true;
        this.mapRoot.add(ground);

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

        // Portal Místico de la Selva
        this.buildMysticPortal(new THREE.Vector3(0, 0, 26), 0, 0x10b981);

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
        const grassMat = new THREE.MeshStandardMaterial({ color: 0x16a34a, roughness: 0.8 });
        const ground = new THREE.Mesh(new THREE.CylinderGeometry(56, 58, 2.2, 36), grassMat);
        ground.position.y = -1.1;
        ground.receiveShadow = true;
        this.mapRoot.add(ground);

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

        // Portal Místico Cafetero
        this.buildMysticPortal(new THREE.Vector3(0, 0, 26), 0, 0xf59e0b);

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
        const paramoMat = new THREE.MeshStandardMaterial({ color: 0x475569, roughness: 0.9 });
        const ground = new THREE.Mesh(new THREE.CylinderGeometry(56, 58, 2.2, 36), paramoMat);
        ground.position.y = -1.1;
        ground.receiveShadow = true;
        this.mapRoot.add(ground);

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

        // Portal Místico Andino
        this.buildMysticPortal(new THREE.Vector3(0, 0, 26), 0, 0x06b6d4);

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
        const sandMat = new THREE.MeshStandardMaterial({ color: 0xfef08a, roughness: 0.9 });
        const ground = new THREE.Mesh(new THREE.CylinderGeometry(56, 58, 2.2, 36), sandMat);
        ground.position.y = -1.1;
        ground.receiveShadow = true;
        this.mapRoot.add(ground);

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

        // Portal Místico Caribeño
        this.buildMysticPortal(new THREE.Vector3(0, 0, 26), 0, 0x0284c7);

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

        // Signo de interrogación '?' dorado en cada cara
        const canvas = document.createElement('canvas');
        canvas.width = 128;
        canvas.height = 128;
        const ctx = canvas.getContext('2d');
        ctx.fillStyle = '#fef08a';
        ctx.font = 'bold 96px sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('?', 64, 64);

        const tex = new THREE.CanvasTexture(canvas);
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
            position: pos.clone(),
            rewardType: rewardType,
            intact: true
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

        const crystalMat = new THREE.MeshStandardMaterial({
            color: 0xc084fc,
            emissive: 0x9333ea,
            emissiveIntensity: 0.7,
            roughness: 0.15,
            metalness: 0.8
        });

        const crystal = new THREE.Mesh(new THREE.OctahedronGeometry(0.65, 0), crystalMat);
        crystal.position.y = 0.5;
        gemGroup.add(crystal);

        const aura = new THREE.Mesh(
            new THREE.TorusGeometry(0.85, 0.05, 8, 20),
            new THREE.MeshBasicMaterial({ color: 0xd8b4fe, transparent: true, opacity: 0.75 })
        );
        aura.rotation.x = Math.PI / 2;
        aura.position.y = 0.5;
        gemGroup.add(aura);

        this.mapRoot.add(gemGroup);

        this.missionGems.push({
            group: gemGroup,
            mesh: crystal,
            aura: aura,
            position: pos.clone(),
            baseY: pos.y,
            gemId: gemId,
            collected: false
        });
    }

    buildMysticPortal(pos, rotY, themeColor) {
        const portalGroup = new THREE.Group();
        portalGroup.position.copy(pos);
        portalGroup.rotation.y = rotY;

        const goldStoneMat = new THREE.MeshStandardMaterial({ color: 0xca8a04, metalness: 0.7, roughness: 0.3 });

        const p1 = new THREE.Mesh(new THREE.CylinderGeometry(0.48, 0.58, 7.5, 16), goldStoneMat);
        p1.position.set(-3.2, 3.75, 0);
        portalGroup.add(p1);

        const p2 = new THREE.Mesh(new THREE.CylinderGeometry(0.48, 0.58, 7.5, 16), goldStoneMat);
        p2.position.set(3.2, 3.75, 0);
        portalGroup.add(p2);

        const lintel = new THREE.Mesh(new THREE.BoxGeometry(8.5, 0.8, 0.9), goldStoneMat);
        lintel.position.set(0, 7.6, 0);
        portalGroup.add(lintel);

        const ring = new THREE.Mesh(
            new THREE.TorusGeometry(2.4, 0.16, 16, 32),
            new THREE.MeshStandardMaterial({ color: themeColor, emissive: themeColor, emissiveIntensity: 0.6 })
        );
        ring.position.set(0, 3.8, 0);
        portalGroup.add(ring);

        const vortexMat = new THREE.MeshBasicMaterial({
            color: themeColor,
            transparent: true,
            opacity: 0.45,
            side: THREE.DoubleSide
        });
        const vortex = new THREE.Mesh(new THREE.CircleGeometry(2.35, 32), vortexMat);
        vortex.position.set(0, 3.8, 0);
        portalGroup.add(vortex);

        const beamMat = new THREE.MeshBasicMaterial({
            color: themeColor,
            transparent: true,
            opacity: 0.0,
            side: THREE.DoubleSide
        });
        const beam = new THREE.Mesh(new THREE.CylinderGeometry(2.0, 2.0, 35, 18, 1, true), beamMat);
        beam.position.set(0, 18, 0);
        portalGroup.add(beam);

        this.mapRoot.add(portalGroup);

        this.portal = {
            group: portalGroup,
            position: pos.clone(),
            ring: ring,
            vortex: vortex,
            vortexMat: vortexMat,
            beam: beam,
            beamMat: beamMat,
            isActive: false,
            themeColor: themeColor
        };
    }

    activatePortal() {
        if (!this.portal || this.portal.isActive) return;
        this.portal.isActive = true;
        this.portal.vortexMat.opacity = 0.85;
        this.portal.beamMat.opacity = 0.55;
    }

    checkPortalEntry(playerPos) {
        if (!this.portal || !this.portal.isActive) return false;
        const dist = Math.hypot(playerPos.x - this.portal.position.x, playerPos.z - this.portal.position.z);
        return dist < 2.8;
    }

    buildTrampoline(pos) {
        const pad = new THREE.Group();
        pad.position.copy(pos);

        const frame = new THREE.Mesh(
            new THREE.CylinderGeometry(1.6, 1.8, 0.3, 16),
            new THREE.MeshStandardMaterial({ color: 0xca8a04, roughness: 0.6 })
        );
        frame.position.y = 0.15;
        pad.add(frame);

        const canvas = new THREE.Mesh(
            new THREE.CylinderGeometry(1.35, 1.35, 0.32, 16),
            new THREE.MeshStandardMaterial({
                color: 0xef4444,
                roughness: 0.3,
                emissive: 0xdc2626,
                emissiveIntensity: 0.5
            })
        );
        canvas.position.y = 0.18;
        pad.add(canvas);

        this.mapRoot.add(pad);
        this.trampolines.push({ position: pos, radius: 1.5, boostForce: 21.0 });
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
            if (dist < t.radius && player.mesh.position.y < 0.8 && player.velocity.y <= 0) {
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
                if (dist < t.radius && enemy.mesh.position.y < 0.8 && enemy.velocity.y <= 0) {
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

        const thickness = 1.4;
        const geom = new THREE.BoxGeometry(width, thickness, length);
        const mesh = new THREE.Mesh(geom, material);
        mesh.position.y = -thickness / 2;
        mesh.receiveShadow = true;
        mesh.castShadow = true;
        group.add(mesh);

        // Borde dorado superior decorativo
        const trimMat = new THREE.MeshStandardMaterial({ color: 0xf59e0b, roughness: 0.3, metalness: 0.6 });
        const trim = new THREE.Mesh(new THREE.BoxGeometry(width + 0.1, 0.08, length + 0.1), trimMat);
        trim.position.y = 0.02;
        group.add(trim);

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

        const poleMat = new THREE.MeshStandardMaterial({ color: 0x854d0e, roughness: 0.8 });
        const bannerMat = new THREE.MeshStandardMaterial({ color: 0xef4444, roughness: 0.5 });

        [-3.2, 3.2].forEach(px => {
            const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.22, 4.5, 12), poleMat);
            pole.position.set(px, 2.25, 0);
            pole.castShadow = true;
            gate.add(pole);
        });

        const crossbar = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.12, 6.8, 12), poleMat);
        crossbar.rotation.z = Math.PI / 2;
        crossbar.position.y = 4.2;
        gate.add(crossbar);

        const banner = new THREE.Mesh(new THREE.PlaneGeometry(5.2, 1.2), bannerMat);
        banner.position.y = 3.4;
        gate.add(banner);

        this.mapRoot.add(gate);
    }

    buildFloatingCoinsArc(startX, startY, startZ, count = 3) {
        for (let i = 0; i < count; i++) {
            const coinZ = startZ - i * 1.6;
            const coinY = startY + Math.sin((i / (count - 1)) * Math.PI) * 1.5 + 0.8;
            this.buildFloatingCoins([new THREE.Vector3(startX, coinY, coinZ)]);
        }
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
    // GENERADOR DE NIVELES 3D PROCEDURAL DE CAMPAÑA
    // =========================================================================
    buildCampaignLevel(worldNum = 1, levelNum = 1) {
        this.isCampaignMode = true;
        this.campaignEnemySpawns = [];
        this.currentCampaignWorldNum = worldNum;
        this.currentCampaignLevelNum = levelNum;

        const worldMeta = CAMPAIGN_WORLDS[worldNum] || CAMPAIGN_WORLDS[1];
        const lvlMeta = (worldMeta.levels && worldMeta.levels[levelNum - 1]) ? worldMeta.levels[levelNum - 1] : { length: 80, targetTime: 70 };

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

        // Atmósfera según el mundo
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

        // 1. Plataforma de Inicio
        this.addPlatformMesh(0, 0, 0, 11, 14, themeMat);
        this.buildStartGate(new THREE.Vector3(0, 0, 4));

        // 2. Circuito de Plataformas
        const totalLength = lvlMeta.length || 80;
        let currentZ = -9;
        let currentY = 0;
        let sectionIndex = 0;

        const gemPlacements = [Math.floor(totalLength * 0.25), Math.floor(totalLength * 0.55), Math.floor(totalLength * 0.82)];
        let gemsPlaced = 0;

        while (Math.abs(currentZ) < totalLength) {
            sectionIndex++;
            const heightVariation = Math.sin(sectionIndex * 0.75) * 1.6;
            currentY = Math.max(0, heightVariation);

            const platWidth = 5.5 + Math.sin(sectionIndex) * 2.0;
            const platLength = 6.0 + (sectionIndex % 3) * 2.5;
            const gap = 2.8 + (worldNum > 4 ? 0.6 : 0) + (worldNum > 7 ? 0.7 : 0);
            const platZ = currentZ - gap - platLength / 2;
            const platX = (sectionIndex % 2 === 0 ? 1 : -1) * (Math.sin(sectionIndex * 1.3) * 4.2);

            const isMoving = (worldNum >= 4 && sectionIndex % 3 === 0);
            const platGroup = this.addPlatformMesh(platX, currentY, platZ, platWidth, platLength, themeMat, isMoving);

            if (isMoving) {
                const startX = platX;
                const moveDist = 4.2;
                const speed = 1.6 + worldNum * 0.12;
                this.animatedUpdaters.push((delta, time) => {
                    const offset = Math.sin(time * speed) * moveDist;
                    platGroup.position.x = startX + offset;
                    this.updatePlatformHitbox(platGroup, startX + offset, currentY, platZ, platWidth, platLength);
                });
            }

            // Trampolín en saltos grandes
            if (gap > 3.4 && sectionIndex % 2 === 1) {
                this.buildTrampoline(new THREE.Vector3(platX, currentY, platZ + platLength / 2 - 1.2));
            }

            // Cajas Sorpresa con '?'
            if (sectionIndex % 2 === 0) {
                this.buildCrate(new THREE.Vector3(platX + 1.2, currentY + 0.46, platZ), (sectionIndex % 4 === 0) ? 'fruit' : 'coins');
            }

            // Cristales de Energía de la Biodiversidad (3 por nivel)
            if (gemsPlaced < 3 && Math.abs(currentZ) >= gemPlacements[gemsPlaced]) {
                gemsPlaced++;
                this.buildBiodiversityCrystal(new THREE.Vector3(platX, currentY + 1.4, platZ), `gem_w${worldNum}_l${levelNum}_${gemsPlaced}`);
            }

            // Monedas flotantes
            this.buildFloatingCoinsArc(platX, currentY, platZ, 3);

            // Spawns de enemigos de nivel
            if (sectionIndex > 1 && sectionIndex % 2 === 0) {
                this.campaignEnemySpawns.push(new THREE.Vector3(platX, currentY, platZ));
            }

            // Props del bioma a los lados
            this.spawnBiomeProps(worldNum, platX, currentY, platZ);

            currentZ = platZ - platLength / 2;
        }

        // 3. Plataforma Final de Meta
        const endZ = currentZ - 6;
        const endY = currentY;
        this.addPlatformMesh(0, endY, endZ, 12, 14, goldAccentMat);

        // Portal Místico de Victoria
        this.buildMysticPortal(new THREE.Vector3(0, endY, endZ), 0, worldMeta.groundColor);
        if (this.portal) {
            this.portal.isActive = true;
        }
    }

    // =========================================================================
    // ARENA CIRCULAR PARA ENFRENTAMIENTO CONTRA JEFE DE MUNDO
    // =========================================================================
    buildCampaignBossArena(worldNum = 1) {
        this.isCampaignMode = false;
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

        // Suelo de la arena (Radio 28m)
        const arenaMat = new THREE.MeshStandardMaterial({ color: worldMeta.groundColor, roughness: 0.85 });
        const arenaMesh = new THREE.Mesh(new THREE.CylinderGeometry(28, 30, 2.0, 36), arenaMat);
        arenaMesh.position.y = -1.0;
        arenaMesh.receiveShadow = true;
        this.mapRoot.add(arenaMesh);

        // Pilares periféricos
        for (let i = 0; i < 16; i++) {
            const angle = (i / 16) * Math.PI * 2;
            const px = Math.cos(angle) * 27;
            const pz = Math.sin(angle) * 27;
            this.spawnBiomeProps(worldNum, px * 0.7, 0, pz * 0.7);
        }

        // Cajas de fruta curativa en esquinas
        [
            [-14, -14], [14, -14], [-14, 14], [14, 14]
        ].forEach(([cx, cz]) => {
            this.buildCrate(new THREE.Vector3(cx, 0.45, cz), 'fruit');
        });

        // Cristal de Biodiversidad como recompensa central
        this.buildBiodiversityCrystal(new THREE.Vector3(0, 1.8, -18), `boss_reward_w${worldNum}`);
    }

}
