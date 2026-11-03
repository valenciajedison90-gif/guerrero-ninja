// js/world.js - Escenarios Orgánicos Multi-Mapa con Misiones estilo Crash Bandicoot
// Incluye: Cajas de madera destructibles, Gemas Sagradas, Tótems de fuego y Portal Dimensional Místico
import * as THREE from 'three';

export const MAPS_CONFIG = {
    forest: {
        id: 'forest',
        name: 'Santuario del Bosque Sagrado',
        badge: '🌸 MUNDO 1',
        desc: 'Colinas zen, bambú, cerezos sakura, pagoda dojo y estanque koi cristalino.',
        missionTitle: 'Misión del Bosque Sagrado',
        missionDesc: 'Derrota a 5 ninjas, recoge 3 gemas sagradas y rompe 6 cajas para activar el portal.',
        bgColor: 0x7dd3fc,
        fogColor: 0x7dd3fc,
        fogDensity: 0.014,
        sunColor: 0xfffbeb,
        gemColor: 0x10b981 // Esmeralda
    },
    volcano: {
        id: 'volcano',
        name: 'Templo del Volcán Carmesí',
        badge: '🔥 MUNDO 2',
        desc: 'Islas de basalto volcánico, ríos de lava ardiente animados, columnas de obsidiana y géiseres térmicos.',
        missionTitle: 'Misión del Volcán Carmesí',
        missionDesc: 'Derrota a 6 ninjas, recoge 3 reliquias de magma y destruye 4 tótems de fuego.',
        bgColor: 0x220c0c,
        fogColor: 0x2e1111,
        fogDensity: 0.016,
        sunColor: 0xff7733,
        gemColor: 0xef4444 // Rubí
    },
    snow: {
        id: 'snow',
        name: 'Cumbres Heladas del Dragón',
        badge: '❄️ MUNDO 3',
        desc: 'Montañas nevadas, agujas de hielo cristalino, pinos con escarcha, pabellón helado y ventisca.',
        missionTitle: 'Misión Final del Dragón',
        missionDesc: 'Recoge 4 zafiros glaciales, vence a 8 ninjas y derrota al Gran Jefe Samurái.',
        bgColor: 0xcfe8f9,
        fogColor: 0xcfe8f9,
        fogDensity: 0.015,
        sunColor: 0xf1f5f9,
        gemColor: 0x38bdf8 // Zafiro
    }
};

export class World {
    constructor(scene) {
        this.scene = scene;
        this.currentMapId = 'forest';
        this.trampolines = [];
        this.floatingCoins = [];
        this.crates = [];
        this.missionGems = [];
        this.totems = [];
        this.portal = null;
        this.animatedUpdaters = [];

        // Contenedor dinámico del mapa activo
        this.mapRoot = new THREE.Group();
        this.mapRoot.name = 'mapRoot';
        this.scene.add(this.mapRoot);

        // Construir el mapa inicial
        this.loadMap('forest');
    }

    setMap(mapId) {
        if (!MAPS_CONFIG[mapId]) return;
        this.currentMapId = mapId;
        this.loadMap(mapId);
    }

    loadMap(mapId) {
        while (this.mapRoot.children.length > 0) {
            const child = this.mapRoot.children[0];
            this.mapRoot.remove(child);
            this.disposeObject(child);
        }

        this.trampolines = [];
        this.floatingCoins = [];
        this.crates = [];
        this.missionGems = [];
        this.totems = [];
        this.portal = null;
        this.animatedUpdaters = [];

        // Ajustar cielo y niebla
        const cfg = MAPS_CONFIG[mapId];
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

        // Generar bioma correspondiente
        if (mapId === 'volcano') {
            this.buildVolcanoMap();
        } else if (mapId === 'snow') {
            this.buildSnowMap();
        } else {
            this.buildForestMap();
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
    // MAPA 1: SANTUARIO DEL BOSQUE SAGRADO (MUNDO 1)
    // =========================================================================
    buildForestMap() {
        const islandGeom = new THREE.CylinderGeometry(58, 62, 2.5, 48);
        const islandMat = new THREE.MeshStandardMaterial({ color: 0x4ade80, roughness: 0.85 });
        const island = new THREE.Mesh(islandGeom, islandMat);
        island.position.y = -1.25;
        island.receiveShadow = true;
        this.mapRoot.add(island);

        // Colinas orgánicas
        const hillPositions = [
            [-22, -18, 14, 1.8],
            [25, -16, 12, 1.6],
            [-28, 15, 10, 1.4],
            [26, 20, 13, 1.5]
        ];
        hillPositions.forEach(([hx, hz, rad, height]) => {
            const hill = new THREE.Mesh(
                new THREE.SphereGeometry(rad, 16, 12, 0, Math.PI * 2, 0, Math.PI * 0.4),
                new THREE.MeshStandardMaterial({ color: 0x22c55e, roughness: 0.9 })
            );
            hill.position.set(hx, -height * 0.3, hz);
            hill.scale.set(1.2, height / rad, 1.2);
            hill.receiveShadow = true;
            this.mapRoot.add(hill);
        });

        // Tatami central
        const arenaGeom = new THREE.CylinderGeometry(18, 18, 0.06, 36);
        const arenaMat = new THREE.MeshStandardMaterial({ color: 0xfef08a, roughness: 0.9 });
        const arenaMesh = new THREE.Mesh(arenaGeom, arenaMat);
        arenaMesh.position.y = 0.03;
        arenaMesh.receiveShadow = true;
        this.mapRoot.add(arenaMesh);

        const ringGeom = new THREE.TorusGeometry(18, 0.28, 8, 36);
        const ringMat = new THREE.MeshStandardMaterial({ color: 0x854d0e, roughness: 0.7 });
        const ringMesh = new THREE.Mesh(ringGeom, ringMat);
        ringMesh.rotation.x = Math.PI / 2;
        ringMesh.position.y = 0.04;
        this.mapRoot.add(ringMesh);

        // Estanque Koi animado
        const pondGroup = new THREE.Group();
        pondGroup.position.set(-18, 0, 16);
        const pondBed = new THREE.Mesh(
            new THREE.CylinderGeometry(7.5, 6.5, 0.4, 24),
            new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.9 })
        );
        pondBed.position.y = -0.15;
        pondGroup.add(pondBed);

        const waterMat = new THREE.MeshStandardMaterial({
            color: 0x38bdf8,
            roughness: 0.1,
            metalness: 0.3,
            transparent: true,
            opacity: 0.82
        });
        const waterMesh = new THREE.Mesh(new THREE.CylinderGeometry(7.2, 7.2, 0.08, 24), waterMat);
        waterMesh.position.y = 0.01;
        pondGroup.add(waterMesh);

        // Rocas de borde
        for (let i = 0; i < 12; i++) {
            const angle = (i / 12) * Math.PI * 2;
            const rx = Math.cos(angle) * (7.2 + Math.sin(i * 3) * 0.4);
            const rz = Math.sin(angle) * (7.2 + Math.cos(i * 2) * 0.4);
            const rock = new THREE.Mesh(
                new THREE.DodecahedronGeometry(0.5 + (i % 3) * 0.2, 1),
                new THREE.MeshStandardMaterial({ color: 0x71717a, roughness: 0.8 })
            );
            rock.position.set(rx, 0.15, rz);
            rock.scale.set(1.2, 0.7, 1.0);
            pondGroup.add(rock);
        }
        this.mapRoot.add(pondGroup);

        this.animatedUpdaters.push((delta, time) => {
            waterMesh.position.y = 0.01 + Math.sin(time * 2.0) * 0.02;
        });

        // Dojo Pagoda
        this.buildDojo(new THREE.Vector3(0, 0, -32));

        // Arcos laterales
        this.buildToriiGate(new THREE.Vector3(-28, 0, 0), Math.PI / 2);
        this.buildToriiGate(new THREE.Vector3(28, 0, 0), -Math.PI / 2);

        // Portal Místico Dimensional en la entrada principal
        this.buildMysticPortal(new THREE.Vector3(0, 0, 26), 0, 0x10b981);

        // Cerezos
        const treeSpots = [
            [-16, -14], [16, -14], [-26, 6], [24, 8],
            [-10, 26], [14, 26], [-35, -18], [35, -18]
        ];
        treeSpots.forEach(([tx, tz]) => {
            this.buildCherryTree(new THREE.Vector3(tx, 0, tz));
        });

        // Bambú
        this.buildBambooGrove(new THREE.Vector3(24, 0, -18));
        this.buildBambooGrove(new THREE.Vector3(-26, 0, -8));

        // Farolillos
        const lanternSpots = [
            [-8, -8], [8, -8], [-8, 8], [8, 8],
            [-20, 0], [20, 0], [0, -22]
        ];
        lanternSpots.forEach(([lx, lz]) => {
            this.buildLantern(new THREE.Vector3(lx, 0, lz));
        });

        // Trampolines
        this.buildTrampoline(new THREE.Vector3(-12, 0, 0));
        this.buildTrampoline(new THREE.Vector3(12, 0, 0));
        this.buildTrampoline(new THREE.Vector3(0, 0, 14));

        // CAJAS DE MADERA DESTRUCTIBLES ESTILO CRASH BANDICOOT (6 Cajas en Mundo 1)
        const crateSpots = [
            new THREE.Vector3(-6, 0.45, -6),
            new THREE.Vector3(6, 0.45, -6),
            new THREE.Vector3(-6, 0.45, 6),
            new THREE.Vector3(6, 0.45, 6),
            new THREE.Vector3(-14, 0.45, 8),
            new THREE.Vector3(14, 0.45, -8)
        ];
        crateSpots.forEach((pos, idx) => {
            this.buildCrate(pos, idx % 2 === 0 ? 'fruit' : 'coins');
        });

        // GEMAS SAGRADAS DE MISIÓN (3 Gemas Esmeralda en Mundo 1)
        this.buildMissionGem(new THREE.Vector3(-18, 1.8, 16), 0x10b981, 1); // Junto al estanque
        this.buildMissionGem(new THREE.Vector3(24, 2.2, -18), 0x10b981, 2); // En el bambú
        this.buildMissionGem(new THREE.Vector3(0, 7.5, 14), 0x10b981, 3);   // Sobre el trampolín central

        // Monedas parkour
        this.spawnFloatingParkourCoins([
            new THREE.Vector3(-12, 7.5, 0),
            new THREE.Vector3(-12, 10.5, 0),
            new THREE.Vector3(12, 7.5, 0),
            new THREE.Vector3(12, 10.5, 0),
            new THREE.Vector3(0, 10.8, 14),
            new THREE.Vector3(-28, 7.4, 0),
            new THREE.Vector3(28, 7.4, 0),
            new THREE.Vector3(0, 5.8, -15),
            new THREE.Vector3(0, 10.2, -24)
        ]);
    }

    // =========================================================================
    // MAPA 2: TEMPLO DEL VOLCÁN CARMESÍ (MUNDO 2)
    // =========================================================================
    buildVolcanoMap() {
        const islandGeom = new THREE.CylinderGeometry(58, 62, 3.0, 48);
        const basaltMat = new THREE.MeshStandardMaterial({ color: 0x1c1917, roughness: 0.95 });
        const island = new THREE.Mesh(islandGeom, basaltMat);
        island.position.y = -1.5;
        island.receiveShadow = true;
        this.mapRoot.add(island);

        // Arena central
        const arenaGeom = new THREE.CylinderGeometry(18, 18, 0.08, 36);
        const arenaMat = new THREE.MeshStandardMaterial({ color: 0x292524, roughness: 0.9 });
        const arenaMesh = new THREE.Mesh(arenaGeom, arenaMat);
        arenaMesh.position.y = 0.04;
        arenaMesh.receiveShadow = true;
        this.mapRoot.add(arenaMesh);

        const ringGeom = new THREE.TorusGeometry(18, 0.35, 8, 36);
        const ringMat = new THREE.MeshStandardMaterial({
            color: 0x7f1d1d,
            roughness: 0.6,
            emissive: 0x991b1b,
            emissiveIntensity: 0.3
        });
        const ringMesh = new THREE.Mesh(ringGeom, ringMat);
        ringMesh.rotation.x = Math.PI / 2;
        ringMesh.position.y = 0.05;
        this.mapRoot.add(ringMesh);

        // Río de lava ardiente animada
        const lavaGeom = new THREE.RingGeometry(24, 33, 48, 1, -Math.PI * 0.65, Math.PI * 1.3);
        const lavaMat = new THREE.MeshStandardMaterial({
            color: 0xff4500,
            emissive: 0xff2200,
            emissiveIntensity: 0.85,
            roughness: 0.3
        });
        const lavaRiver = new THREE.Mesh(lavaGeom, lavaMat);
        lavaRiver.rotation.x = -Math.PI / 2;
        lavaRiver.position.y = 0.02;
        this.mapRoot.add(lavaRiver);

        // Estanque de magma
        const lavaPool = new THREE.Mesh(new THREE.CylinderGeometry(8.5, 8.5, 0.1, 24), lavaMat);
        lavaPool.position.set(-18, 0.02, 16);
        this.mapRoot.add(lavaPool);

        // Burbujas animadas
        const bubbles = [];
        for (let i = 0; i < 8; i++) {
            const b = new THREE.Mesh(
                new THREE.SphereGeometry(0.35 + Math.random() * 0.3, 10, 10),
                new THREE.MeshBasicMaterial({ color: 0xffea00 })
            );
            const bAngle = Math.random() * Math.PI * 2;
            const bDist = Math.random() * 6.5;
            b.position.set(-18 + Math.cos(bAngle) * bDist, 0.05, 16 + Math.sin(bAngle) * bDist);
            b.userData = { speed: 1.5 + Math.random() * 2.0, phase: Math.random() * Math.PI * 2 };
            this.mapRoot.add(b);
            bubbles.push(b);
        }

        this.animatedUpdaters.push((delta, time) => {
            lavaMat.emissiveIntensity = 0.75 + Math.sin(time * 3.2) * 0.25;
            bubbles.forEach(b => {
                const wave = Math.sin(time * b.userData.speed + b.userData.phase);
                b.scale.setScalar(Math.max(0.2, (wave + 1) * 0.6));
                b.position.y = 0.05 + Math.max(0, wave * 0.4);
            });
        });

        // Columnas de basalto
        const columnSpots = [
            [-30, -10, 8], [-34, -4, 11], [-28, 4, 7],
            [32, -8, 9], [35, 2, 12], [28, 10, 7],
            [-14, 28, 6], [16, 28, 8], [0, 34, 10]
        ];
        columnSpots.forEach(([cx, cz, ch]) => {
            this.buildBasaltColumn(new THREE.Vector3(cx, ch / 2, cz), ch);
        });

        // Gran Santuario del Volcán
        this.buildVolcanoShrine(new THREE.Vector3(0, 0, -32));

        // Portal Místico del Fuego
        this.buildMysticPortal(new THREE.Vector3(0, 0, 26), 0, 0xef4444);

        // Géiseres de vapor
        this.buildThermalGeyser(new THREE.Vector3(-12, 0, 0));
        this.buildThermalGeyser(new THREE.Vector3(12, 0, 0));
        this.buildThermalGeyser(new THREE.Vector3(0, 0, 14));

        // TÓTEMS DE FUEGO DESTRUCTIBLES (4 Tótems en Mundo 2)
        this.buildFireTotem(new THREE.Vector3(-18, 0, -14));
        this.buildFireTotem(new THREE.Vector3(18, 0, -14));
        this.buildFireTotem(new THREE.Vector3(-15, 0, 20));
        this.buildFireTotem(new THREE.Vector3(15, 0, 20));

        // CAJAS DESTRUCTIBLES EN VOLCÁN
        [
            new THREE.Vector3(-8, 0.45, -5),
            new THREE.Vector3(8, 0.45, -5),
            new THREE.Vector3(-22, 0.45, 0),
            new THREE.Vector3(22, 0.45, 0)
        ].forEach(pos => this.buildCrate(pos, 'coins'));

        // GEMAS DE MISIÓN: RELIQUIAS DE MAGMA (3 Reliquias en Mundo 2)
        this.buildMissionGem(new THREE.Vector3(-12, 8.5, 0), 0xef4444, 1);
        this.buildMissionGem(new THREE.Vector3(12, 8.5, 0), 0xef4444, 2);
        this.buildMissionGem(new THREE.Vector3(0, 8.5, 14), 0xef4444, 3);

        this.spawnFloatingParkourCoins([
            new THREE.Vector3(-12, 11.5, 0),
            new THREE.Vector3(12, 11.5, 0),
            new THREE.Vector3(0, 11.5, 14),
            new THREE.Vector3(-30, 9.0, -10),
            new THREE.Vector3(32, 10.0, -8),
            new THREE.Vector3(0, 6.5, -15),
            new THREE.Vector3(0, 11.0, -24)
        ]);
    }

    // =========================================================================
    // MAPA 3: CUMBRES HELADAS DEL DRAGÓN (MUNDO 3)
    // =========================================================================
    buildSnowMap() {
        const islandGeom = new THREE.CylinderGeometry(58, 62, 2.5, 48);
        const snowMat = new THREE.MeshStandardMaterial({ color: 0xf8fafc, roughness: 0.85 });
        const island = new THREE.Mesh(islandGeom, snowMat);
        island.position.y = -1.25;
        island.receiveShadow = true;
        this.mapRoot.add(island);

        // Ventisqueros de nieve
        const driftSpots = [
            [-20, -16, 13, 2.0],
            [22, -18, 14, 2.2],
            [-26, 14, 11, 1.8],
            [24, 18, 12, 1.9]
        ];
        driftSpots.forEach(([dx, dz, rad, h]) => {
            const drift = new THREE.Mesh(
                new THREE.SphereGeometry(rad, 16, 12, 0, Math.PI * 2, 0, Math.PI * 0.4),
                new THREE.MeshStandardMaterial({ color: 0xe2e8f0, roughness: 0.9 })
            );
            drift.position.set(dx, -h * 0.3, dz);
            drift.scale.set(1.25, h / rad, 1.25);
            this.mapRoot.add(drift);
        });

        // Tatami de hielo
        const arenaGeom = new THREE.CylinderGeometry(18, 18, 0.06, 36);
        const iceMat = new THREE.MeshStandardMaterial({
            color: 0xbae6fd,
            roughness: 0.15,
            metalness: 0.4,
            transparent: true,
            opacity: 0.92
        });
        const arenaMesh = new THREE.Mesh(arenaGeom, iceMat);
        arenaMesh.position.y = 0.03;
        arenaMesh.receiveShadow = true;
        this.mapRoot.add(arenaMesh);

        const ringGeom = new THREE.TorusGeometry(18, 0.3, 8, 36);
        const ringMat = new THREE.MeshStandardMaterial({
            color: 0x0284c7,
            roughness: 0.4,
            emissive: 0x38bdf8,
            emissiveIntensity: 0.25
        });
        const ringMesh = new THREE.Mesh(ringGeom, ringMat);
        ringMesh.rotation.x = Math.PI / 2;
        ringMesh.position.y = 0.04;
        this.mapRoot.add(ringMesh);

        // Templo del Dragón de Hielo
        this.buildIceTemple(new THREE.Vector3(0, 0, -32));

        // Portal Místico Glacial
        this.buildMysticPortal(new THREE.Vector3(0, 0, 26), 0, 0x38bdf8);

        // Pinos nevados
        const pineSpots = [
            [-16, -14], [16, -14], [-24, 10], [24, 10],
            [-12, 26], [12, 26], [-34, -18], [34, -18],
            [-32, 2], [32, 2]
        ];
        pineSpots.forEach(([px, pz]) => {
            this.buildSnowPine(new THREE.Vector3(px, 0, pz));
        });

        // Agujas de hielo cristalino
        const crystalSpots = [
            [-22, 0, -6], [22, 0, -6],
            [-18, 0, 18], [18, 0, 18]
        ];
        crystalSpots.forEach(([cx, cz, cy]) => {
            this.buildIceSpire(new THREE.Vector3(cx, 0, cy || cz));
        });

        // Trampolines de hielo
        this.buildIceTrampoline(new THREE.Vector3(-12, 0, 0));
        this.buildIceTrampoline(new THREE.Vector3(12, 0, 0));
        this.buildIceTrampoline(new THREE.Vector3(0, 0, 14));

        // CAJAS DESTRUCTIBLES EN NIEVE
        [
            new THREE.Vector3(-7, 0.45, -7),
            new THREE.Vector3(7, 0.45, -7),
            new THREE.Vector3(-7, 0.45, 7),
            new THREE.Vector3(7, 0.45, 7)
        ].forEach(pos => this.buildCrate(pos, 'fruit'));

        // GEMAS DE MISIÓN: ZAFIROS GLACIALES (4 Zafiros en Mundo 3)
        this.buildMissionGem(new THREE.Vector3(-22, 6.5, -6), 0x38bdf8, 1);
        this.buildMissionGem(new THREE.Vector3(22, 6.5, -6), 0x38bdf8, 2);
        this.buildMissionGem(new THREE.Vector3(0, 8.2, 14), 0x38bdf8, 3);
        this.buildMissionGem(new THREE.Vector3(0, 8.5, -24), 0x38bdf8, 4);

        // Ventisca animada continua (copos de nieve 60 FPS)
        const snowFlakes = [];
        const flakeGeom = new THREE.SphereGeometry(0.12, 6, 6);
        const flakeMat = new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.85 });

        for (let i = 0; i < 50; i++) {
            const flake = new THREE.Mesh(flakeGeom, flakeMat);
            flake.position.set(
                (Math.random() - 0.5) * 80,
                Math.random() * 25,
                (Math.random() - 0.5) * 80
            );
            flake.userData = {
                fallSpeed: 2.2 + Math.random() * 2.0,
                driftSpeed: 1.0 + Math.random() * 1.2,
                driftPhase: Math.random() * Math.PI * 2
            };
            this.mapRoot.add(flake);
            snowFlakes.push(flake);
        }

        this.animatedUpdaters.push((delta, time) => {
            snowFlakes.forEach(f => {
                f.position.y -= f.userData.fallSpeed * delta;
                f.position.x += Math.sin(time * f.userData.driftSpeed + f.userData.driftPhase) * delta * 1.5;
                if (f.position.y < 0.2) {
                    f.position.y = 22 + Math.random() * 3;
                    f.position.x = (Math.random() - 0.5) * 80;
                    f.position.z = (Math.random() - 0.5) * 80;
                }
            });
        });

        this.spawnFloatingParkourCoins([
            new THREE.Vector3(-12, 7.5, 0),
            new THREE.Vector3(-12, 10.5, 0),
            new THREE.Vector3(12, 7.5, 0),
            new THREE.Vector3(12, 10.5, 0),
            new THREE.Vector3(0, 10.5, 14),
            new THREE.Vector3(0, 6.0, -15),
            new THREE.Vector3(0, 10.5, -24)
        ]);
    }

    // =========================================================================
    // CAJAS DE MADERA DESTRUCTIBLES ESTILO CRASH BANDICOOT
    // =========================================================================
    buildCrate(pos, rewardType = 'coins') {
        const crateGroup = new THREE.Group();
        crateGroup.position.copy(pos);

        const woodMat = new THREE.MeshStandardMaterial({
            color: 0xb45309,
            roughness: 0.8
        });
        const trimMat = new THREE.MeshStandardMaterial({
            color: 0x78350f,
            roughness: 0.6
        });
        const sealMat = new THREE.MeshBasicMaterial({
            color: rewardType === 'fruit' ? 0xef4444 : 0xfacc15
        });

        // Cuerpo cúbico de madera
        const box = new THREE.Mesh(new THREE.BoxGeometry(0.9, 0.9, 0.9), woodMat);
        box.castShadow = true;
        box.receiveShadow = true;
        crateGroup.add(box);

        // Marcos de refuerzo
        const trimTop = new THREE.Mesh(new THREE.BoxGeometry(0.94, 0.08, 0.94), trimMat);
        trimTop.position.y = 0.42;
        crateGroup.add(trimTop);

        const trimBottom = new THREE.Mesh(new THREE.BoxGeometry(0.94, 0.08, 0.94), trimMat);
        trimBottom.position.y = -0.42;
        crateGroup.add(trimBottom);

        // Sello frontal (manzana/fruto o moneda)
        const seal = new THREE.Mesh(new THREE.CircleGeometry(0.22, 8), sealMat);
        seal.position.set(0, 0, 0.46);
        crateGroup.add(seal);

        this.mapRoot.add(crateGroup);

        this.crates.push({
            group: crateGroup,
            position: pos.clone(),
            rewardType: rewardType,
            intact: true
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

                // Fragmentos de madera volando
                this.spawnWoodSplinters(crate.position);

                if (onBreak) {
                    onBreak(crate);
                }
            }
        }
    }

    spawnWoodSplinters(pos) {
        const splinterMat = new THREE.MeshStandardMaterial({ color: 0x92400e, roughness: 0.7 });
        for (let j = 0; j < 7; j++) {
            const shard = new THREE.Mesh(
                new THREE.BoxGeometry(0.18, 0.08, 0.25),
                splinterMat
            );
            shard.position.copy(pos).add(new THREE.Vector3(
                (Math.random() - 0.5) * 0.5,
                Math.random() * 0.5,
                (Math.random() - 0.5) * 0.5
            ));
            shard.rotation.set(Math.random() * 3, Math.random() * 3, Math.random() * 3);
            this.mapRoot.add(shard);

            const shardVel = new THREE.Vector3(
                (Math.random() - 0.5) * 6,
                4 + Math.random() * 4,
                (Math.random() - 0.5) * 6
            );

            const updater = (delta) => {
                shardVel.y -= 25.0 * delta;
                shard.position.addScaledVector(shardVel, delta);
                shard.rotation.x += 4 * delta;
                if (shard.position.y < 0) {
                    this.mapRoot.remove(shard);
                    this.disposeObject(shard);
                    const idx = this.animatedUpdaters.indexOf(updater);
                    if (idx !== -1) this.animatedUpdaters.splice(idx, 1);
                }
            };
            this.animatedUpdaters.push(updater);
        }
    }

    // =========================================================================
    // GEMAS SAGRADAS DE MISIÓN
    // =========================================================================
    buildMissionGem(pos, colorHex, gemId) {
        const gemGroup = new THREE.Group();
        gemGroup.position.copy(pos);

        const gemGeom = new THREE.OctahedronGeometry(0.55, 0);
        gemGeom.scale(1.0, 1.4, 1.0);

        const gemMat = new THREE.MeshStandardMaterial({
            color: colorHex,
            emissive: colorHex,
            emissiveIntensity: 0.6,
            metalness: 0.3,
            roughness: 0.15,
            transparent: true,
            opacity: 0.9
        });
        const gemMesh = new THREE.Mesh(gemGeom, gemMat);
        gemMesh.castShadow = true;
        gemGroup.add(gemMesh);

        // Anillo de brillo etéreo
        const aura = new THREE.Mesh(
            new THREE.TorusGeometry(0.7, 0.04, 8, 24),
            new THREE.MeshBasicMaterial({ color: colorHex, transparent: true, opacity: 0.6 })
        );
        aura.rotation.x = Math.PI / 2;
        gemGroup.add(aura);

        this.mapRoot.add(gemGroup);

        this.missionGems.push({
            group: gemGroup,
            mesh: gemMesh,
            aura: aura,
            position: pos.clone(),
            baseY: pos.y,
            gemId: gemId,
            collected: false
        });
    }

    checkMissionGems(playerPos, onCollect) {
        for (let i = this.missionGems.length - 1; i >= 0; i--) {
            const g = this.missionGems[i];
            if (g.collected) continue;

            const dist = g.group.position.distanceTo(playerPos);
            if (dist < 1.7) {
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

    // =========================================================================
    // TÓTEMS DE FUEGO DESTRUCTIBLES (MUNDO 2)
    // =========================================================================
    buildFireTotem(pos) {
        const totemGroup = new THREE.Group();
        totemGroup.position.copy(pos);

        const stoneMat = new THREE.MeshStandardMaterial({ color: 0x27272a, roughness: 0.9 });
        const fireMat = new THREE.MeshStandardMaterial({
            color: 0xff3b00,
            emissive: 0xff5500,
            emissiveIntensity: 0.9
        });

        // Pilar del tótem
        const pillar = new THREE.Mesh(new THREE.CylinderGeometry(0.45, 0.55, 2.4, 8), stoneMat);
        pillar.position.y = 1.2;
        pillar.castShadow = true;
        totemGroup.add(pillar);

        // Cabeza con orbe de fuego
        const head = new THREE.Mesh(new THREE.DodecahedronGeometry(0.5, 0), stoneMat);
        head.position.y = 2.6;
        totemGroup.add(head);

        const flame = new THREE.Mesh(new THREE.OctahedronGeometry(0.35, 0), fireMat);
        flame.position.y = 3.2;
        totemGroup.add(flame);

        this.mapRoot.add(totemGroup);

        this.totems.push({
            group: totemGroup,
            position: pos.clone(),
            flame: flame,
            intact: true
        });
    }

    checkTotemHits(hitPos, hitRadius, onBreak) {
        for (let i = this.totems.length - 1; i >= 0; i--) {
            const totem = this.totems[i];
            if (!totem.intact) continue;

            const dist = Math.hypot(hitPos.x - totem.position.x, hitPos.z - totem.position.z);
            if (dist < hitRadius) {
                totem.intact = false;
                this.mapRoot.remove(totem.group);
                this.disposeObject(totem.group);
                this.totems.splice(i, 1);

                this.spawnWoodSplinters(totem.position);

                if (onBreak) {
                    onBreak(totem);
                }
            }
        }
    }

    // =========================================================================
    // PORTAL MÍSTICO DIMENSIONAL 3D
    // =========================================================================
    buildMysticPortal(pos, rotY, themeColor) {
        const portalGroup = new THREE.Group();
        portalGroup.position.copy(pos);
        portalGroup.rotation.y = rotY;

        const stoneMat = new THREE.MeshStandardMaterial({ color: 0x18181b, roughness: 0.8 });
        const goldMat = new THREE.MeshStandardMaterial({ color: 0xf59e0b, metalness: 0.8, roughness: 0.2 });

        // Columnas del portal
        const p1 = new THREE.Mesh(new THREE.CylinderGeometry(0.45, 0.55, 7.5, 16), stoneMat);
        p1.position.set(-3.2, 3.75, 0);
        portalGroup.add(p1);

        const p2 = new THREE.Mesh(new THREE.CylinderGeometry(0.45, 0.55, 7.5, 16), stoneMat);
        p2.position.set(3.2, 3.75, 0);
        portalGroup.add(p2);

        // Viga superior arqueada
        const arch = new THREE.Mesh(new THREE.BoxGeometry(8.4, 0.7, 0.8), goldMat);
        arch.position.y = 7.6;
        portalGroup.add(arch);

        // Anillo rúnico giratorio central
        const ringGeom = new THREE.TorusGeometry(2.8, 0.16, 12, 32);
        const ringMat = new THREE.MeshStandardMaterial({
            color: themeColor,
            emissive: themeColor,
            emissiveIntensity: 0.3,
            roughness: 0.3
        });
        const ring = new THREE.Mesh(ringGeom, ringMat);
        ring.position.y = 3.6;
        portalGroup.add(ring);

        // Vórtice dimensional interior
        const vortexGeom = new THREE.CircleGeometry(2.6, 24);
        const vortexMat = new THREE.MeshBasicMaterial({
            color: themeColor,
            side: THREE.DoubleSide,
            transparent: true,
            opacity: 0.25
        });
        const vortex = new THREE.Mesh(vortexGeom, vortexMat);
        vortex.position.y = 3.6;
        portalGroup.add(vortex);

        // Haz de luz vertical celestial (se enciende cuando la misión está completa)
        const beamGeom = new THREE.CylinderGeometry(2.2, 2.2, 45, 20, 1, true);
        const beamMat = new THREE.MeshBasicMaterial({
            color: themeColor,
            transparent: true,
            opacity: 0.0,
            side: THREE.DoubleSide
        });
        const beam = new THREE.Mesh(beamGeom, beamMat);
        beam.position.y = 22.5;
        portalGroup.add(beam);

        this.mapRoot.add(portalGroup);

        this.portal = {
            group: portalGroup,
            ring: ring,
            vortex: vortex,
            beam: beam,
            beamMat: beamMat,
            ringMat: ringMat,
            vortexMat: vortexMat,
            position: pos.clone(),
            isActive: false,
            themeColor: themeColor
        };
    }

    activatePortal() {
        if (!this.portal || this.portal.isActive) return;
        this.portal.isActive = true;

        // Iluminación intensa del portal
        this.portal.beamMat.opacity = 0.55;
        this.portal.vortexMat.opacity = 0.75;
        this.portal.ringMat.emissiveIntensity = 1.2;
    }

    checkPortalEntry(playerPos) {
        if (!this.portal || !this.portal.isActive) return false;
        const dist = Math.hypot(playerPos.x - this.portal.position.x, playerPos.z - this.portal.position.z);
        return dist < 2.5 && playerPos.y < 3.0;
    }

    // =========================================================================
    // ARQUITECTURA Y ELEMENTOS TRADICIONALES
    // =========================================================================
    buildDojo(pos) {
        const dojoGroup = new THREE.Group();
        dojoGroup.position.copy(pos);

        const woodMat = new THREE.MeshStandardMaterial({ color: 0x78350f, roughness: 0.7 });
        const wallMat = new THREE.MeshStandardMaterial({ color: 0xfef3c7, roughness: 0.9 });
        const roofMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.5 });
        const redTrimMat = new THREE.MeshStandardMaterial({ color: 0xd92323, roughness: 0.6 });

        const base = new THREE.Mesh(new THREE.BoxGeometry(22, 1.2, 14), woodMat);
        base.position.y = 0.6;
        base.castShadow = true;
        base.receiveShadow = true;
        dojoGroup.add(base);

        const walls = new THREE.Mesh(new THREE.BoxGeometry(20, 5, 12), wallMat);
        walls.position.y = 3.6;
        walls.castShadow = true;
        dojoGroup.add(walls);

        const colGeom = new THREE.CylinderGeometry(0.35, 0.4, 5, 12);
        const colOffsets = [
            [-9.5, -5.5], [9.5, -5.5], [-9.5, 5.5], [9.5, 5.5],
            [0, -5.5], [-4.8, -5.5], [4.8, -5.5]
        ];
        colOffsets.forEach(([cx, cz]) => {
            const col = new THREE.Mesh(colGeom, redTrimMat);
            col.position.set(cx, 3.6, cz);
            col.castShadow = true;
            dojoGroup.add(col);
        });

        const roof1 = new THREE.Mesh(new THREE.ConeGeometry(17, 3.2, 4), roofMat);
        roof1.rotation.y = Math.PI / 4;
        roof1.position.y = 7.2;
        roof1.scale.set(1.1, 1, 0.85);
        roof1.castShadow = true;
        dojoGroup.add(roof1);

        const upperWall = new THREE.Mesh(new THREE.BoxGeometry(10, 2.5, 7), wallMat);
        upperWall.position.y = 8.5;
        dojoGroup.add(upperWall);

        const roof2 = new THREE.Mesh(new THREE.ConeGeometry(9.5, 2.5, 4), roofMat);
        roof2.rotation.y = Math.PI / 4;
        roof2.position.y = 10.5;
        roof2.scale.set(1.1, 1, 0.85);
        roof2.castShadow = true;
        dojoGroup.add(roof2);

        this.mapRoot.add(dojoGroup);
    }

    buildVolcanoShrine(pos) {
        const shrine = new THREE.Group();
        shrine.position.copy(pos);

        const darkStoneMat = new THREE.MeshStandardMaterial({ color: 0x18181b, roughness: 0.9 });
        const rubyMat = new THREE.MeshStandardMaterial({
            color: 0x991b1b,
            emissive: 0xef4444,
            emissiveIntensity: 0.5,
            roughness: 0.3
        });
        const ironRoofMat = new THREE.MeshStandardMaterial({ color: 0x27272a, roughness: 0.4, metalness: 0.7 });

        const base = new THREE.Mesh(new THREE.BoxGeometry(22, 1.8, 14), darkStoneMat);
        base.position.y = 0.9;
        shrine.add(base);

        const walls = new THREE.Mesh(new THREE.BoxGeometry(19, 5.5, 11), darkStoneMat);
        walls.position.y = 4.2;
        shrine.add(walls);

        [-9, -4.5, 0, 4.5, 9].forEach(cx => {
            const col = new THREE.Mesh(new THREE.CylinderGeometry(0.4, 0.45, 5.5, 10), ironRoofMat);
            col.position.set(cx, 4.2, -5.2);
            shrine.add(col);
        });

        const roof = new THREE.Mesh(new THREE.ConeGeometry(17, 3.8, 4), ironRoofMat);
        roof.rotation.y = Math.PI / 4;
        roof.position.y = 8.2;
        roof.scale.set(1.1, 1, 0.85);
        shrine.add(roof);

        const ruby = new THREE.Mesh(new THREE.OctahedronGeometry(1.2, 0), rubyMat);
        ruby.position.y = 11.2;
        shrine.add(ruby);

        this.mapRoot.add(shrine);
    }

    buildIceTemple(pos) {
        const temple = new THREE.Group();
        temple.position.copy(pos);

        const snowBlockMat = new THREE.MeshStandardMaterial({ color: 0xf1f5f9, roughness: 0.8 });
        const iceTileMat = new THREE.MeshStandardMaterial({
            color: 0x38bdf8,
            roughness: 0.2,
            metalness: 0.4,
            transparent: true,
            opacity: 0.9
        });
        const frostTrimMat = new THREE.MeshStandardMaterial({ color: 0x0284c7, roughness: 0.5 });

        const base = new THREE.Mesh(new THREE.BoxGeometry(22, 1.4, 14), snowBlockMat);
        base.position.y = 0.7;
        temple.add(base);

        const walls = new THREE.Mesh(new THREE.BoxGeometry(19, 5.2, 11), snowBlockMat);
        walls.position.y = 4.0;
        temple.add(walls);

        [-9, -4.5, 0, 4.5, 9].forEach(cx => {
            const col = new THREE.Mesh(new THREE.CylinderGeometry(0.38, 0.42, 5.2, 12), frostTrimMat);
            col.position.set(cx, 4.0, -5.2);
            temple.add(col);
        });

        const roof = new THREE.Mesh(new THREE.ConeGeometry(17, 3.4, 4), iceTileMat);
        roof.rotation.y = Math.PI / 4;
        roof.position.y = 7.6;
        roof.scale.set(1.1, 1, 0.85);
        temple.add(roof);

        const snowCap = new THREE.Mesh(new THREE.ConeGeometry(16.2, 1.2, 4), snowBlockMat);
        snowCap.rotation.y = Math.PI / 4;
        snowCap.position.y = 8.6;
        temple.add(snowCap);

        this.mapRoot.add(temple);
    }

    buildToriiGate(pos, rotY) {
        const torii = new THREE.Group();
        torii.position.copy(pos);
        torii.rotation.y = rotY;

        const redMat = new THREE.MeshStandardMaterial({ color: 0xd92323, roughness: 0.5 });
        const blackMat = new THREE.MeshStandardMaterial({ color: 0x18181b, roughness: 0.6 });

        const p1 = new THREE.Mesh(new THREE.CylinderGeometry(0.35, 0.45, 6.5, 12), redMat);
        p1.position.set(-2.8, 3.25, 0);
        p1.castShadow = true;
        torii.add(p1);

        const p2 = new THREE.Mesh(new THREE.CylinderGeometry(0.35, 0.45, 6.5, 12), redMat);
        p2.position.set(2.8, 3.25, 0);
        p2.castShadow = true;
        torii.add(p2);

        const topBeam = new THREE.Mesh(new THREE.BoxGeometry(7.8, 0.55, 0.65), redMat);
        topBeam.position.y = 6.4;
        topBeam.castShadow = true;
        torii.add(topBeam);

        const roofCap = new THREE.Mesh(new THREE.BoxGeometry(8.2, 0.25, 0.8), blackMat);
        roofCap.position.y = 6.7;
        roofCap.castShadow = true;
        torii.add(roofCap);

        const subBeam = new THREE.Mesh(new THREE.BoxGeometry(6.6, 0.35, 0.45), redMat);
        subBeam.position.y = 5.3;
        torii.add(subBeam);

        this.mapRoot.add(torii);
    }

    buildCherryTree(pos) {
        const tree = new THREE.Group();
        tree.position.copy(pos);

        const trunkMat = new THREE.MeshStandardMaterial({ color: 0x451a03, roughness: 0.9 });
        const blossomMat = new THREE.MeshStandardMaterial({ color: 0xf472b6, roughness: 0.8 });

        const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.35, 0.6, 4.0, 8), trunkMat);
        trunk.position.y = 2.0;
        trunk.rotation.z = (Math.random() - 0.5) * 0.15;
        trunk.castShadow = true;
        tree.add(trunk);

        const foliageOffsets = [
            [0, 4.2, 0, 2.2],
            [-1.1, 3.8, 0.8, 1.6],
            [1.2, 4.0, -0.6, 1.7],
            [0.5, 5.0, 0.3, 1.5],
            [-0.7, 4.6, -0.8, 1.4]
        ];
        foliageOffsets.forEach(([fx, fy, fz, size]) => {
            const foliage = new THREE.Mesh(new THREE.DodecahedronGeometry(size, 1), blossomMat);
            foliage.position.set(fx, fy, fz);
            foliage.castShadow = true;
            tree.add(foliage);
        });

        this.mapRoot.add(tree);
    }

    buildBambooGrove(pos) {
        const grove = new THREE.Group();
        grove.position.copy(pos);

        const bambooMat = new THREE.MeshStandardMaterial({ color: 0x65a30d, roughness: 0.6 });
        const ringMat = new THREE.MeshStandardMaterial({ color: 0x4d7c0f, roughness: 0.8 });

        for (let i = 0; i < 9; i++) {
            const bx = (Math.random() - 0.5) * 4.5;
            const bz = (Math.random() - 0.5) * 4.5;
            const stalkH = 5.5 + Math.random() * 3.5;

            const stalk = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.14, stalkH, 8), bambooMat);
            stalk.position.set(bx, stalkH / 2, bz);
            stalk.rotation.z = (Math.random() - 0.5) * 0.08;
            grove.add(stalk);

            for (let y = 1.2; y < stalkH; y += 1.4) {
                const joint = new THREE.Mesh(new THREE.TorusGeometry(0.14, 0.03, 6, 8), ringMat);
                joint.rotation.x = Math.PI / 2;
                joint.position.set(bx, y, bz);
                grove.add(joint);
            }
        }
        this.mapRoot.add(grove);
    }

    buildBasaltColumn(pos, height) {
        const col = new THREE.Mesh(
            new THREE.CylinderGeometry(1.4, 1.5, height, 6),
            new THREE.MeshStandardMaterial({ color: 0x1c1917, roughness: 0.9 })
        );
        col.position.copy(pos);
        col.rotation.y = (pos.x * 0.3);
        this.mapRoot.add(col);
    }

    buildSnowPine(pos) {
        const pine = new THREE.Group();
        pine.position.copy(pos);

        const trunkMat = new THREE.MeshStandardMaterial({ color: 0x3e2723, roughness: 0.9 });
        const foliageMat = new THREE.MeshStandardMaterial({ color: 0x1e3a2e, roughness: 0.8 });
        const snowMat = new THREE.MeshStandardMaterial({ color: 0xf1f5f9, roughness: 0.85 });

        const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.3, 0.5, 3.5, 8), trunkMat);
        trunk.position.y = 1.75;
        pine.add(trunk);

        const tiers = [
            { y: 3.2, r: 2.4, h: 2.2 },
            { y: 4.6, r: 1.8, h: 1.9 },
            { y: 5.8, r: 1.2, h: 1.6 }
        ];

        tiers.forEach(t => {
            const foliage = new THREE.Mesh(new THREE.ConeGeometry(t.r, t.h, 8), foliageMat);
            foliage.position.y = t.y;
            pine.add(foliage);

            const snow = new THREE.Mesh(new THREE.ConeGeometry(t.r * 1.02, t.h * 0.45, 8), snowMat);
            snow.position.y = t.y + t.h * 0.28;
            pine.add(snow);
        });

        this.mapRoot.add(pine);
    }

    buildIceSpire(pos) {
        const spire = new THREE.Mesh(
            new THREE.ConeGeometry(1.2, 6.5, 6),
            new THREE.MeshStandardMaterial({
                color: 0x38bdf8,
                emissive: 0x0284c7,
                emissiveIntensity: 0.35,
                roughness: 0.1,
                metalness: 0.3,
                transparent: true,
                opacity: 0.85
            })
        );
        spire.position.set(pos.x, 3.25, pos.z);
        this.mapRoot.add(spire);
    }

    buildLantern(pos) {
        const lantern = new THREE.Group();
        lantern.position.copy(pos);

        const stoneMat = new THREE.MeshStandardMaterial({ color: 0x71717a, roughness: 0.9 });
        const glowMat = new THREE.MeshBasicMaterial({ color: 0xfef08a });

        const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.25, 2.2, 6), stoneMat);
        pole.position.y = 1.1;
        lantern.add(pole);

        const lightBox = new THREE.Mesh(new THREE.BoxGeometry(0.55, 0.55, 0.55), glowMat);
        lightBox.position.y = 2.4;
        lantern.add(lightBox);

        const cap = new THREE.Mesh(new THREE.ConeGeometry(0.65, 0.35, 4), stoneMat);
        cap.position.y = 2.85;
        cap.rotation.y = Math.PI / 4;
        lantern.add(cap);

        this.mapRoot.add(lantern);
    }

    buildTrampoline(pos) {
        const pad = new THREE.Group();
        pad.position.copy(pos);

        const frame = new THREE.Mesh(
            new THREE.CylinderGeometry(1.6, 1.8, 0.3, 16),
            new THREE.MeshStandardMaterial({ color: 0xb45309, roughness: 0.7 })
        );
        frame.position.y = 0.15;
        pad.add(frame);

        const canvas = new THREE.Mesh(
            new THREE.CylinderGeometry(1.35, 1.35, 0.32, 16),
            new THREE.MeshStandardMaterial({
                color: 0xef4444,
                roughness: 0.3,
                emissive: 0xb91c1c,
                emissiveIntensity: 0.4
            })
        );
        canvas.position.y = 0.18;
        pad.add(canvas);

        const emblem = new THREE.Mesh(
            new THREE.RingGeometry(0.2, 0.6, 4),
            new THREE.MeshBasicMaterial({ color: 0xfacc15, side: THREE.DoubleSide })
        );
        emblem.rotation.x = -Math.PI / 2;
        emblem.position.y = 0.35;
        pad.add(emblem);

        this.mapRoot.add(pad);
        this.trampolines.push({ position: pos, radius: 1.5, boostForce: 21.0 });
    }

    buildThermalGeyser(pos) {
        const geyser = new THREE.Group();
        geyser.position.copy(pos);

        const vent = new THREE.Mesh(
            new THREE.CylinderGeometry(1.5, 1.9, 0.4, 16),
            new THREE.MeshStandardMaterial({ color: 0x1c1917, roughness: 0.9 })
        );
        vent.position.y = 0.2;
        geyser.add(vent);

        const magmaVent = new THREE.Mesh(
            new THREE.CylinderGeometry(1.2, 1.2, 0.42, 16),
            new THREE.MeshStandardMaterial({
                color: 0xff3b00,
                emissive: 0xff4500,
                emissiveIntensity: 0.9
            })
        );
        magmaVent.position.y = 0.22;
        geyser.add(magmaVent);

        this.mapRoot.add(geyser);
        this.trampolines.push({ position: pos, radius: 1.5, boostForce: 22.0 });
    }

    buildIceTrampoline(pos) {
        const icePad = new THREE.Group();
        icePad.position.copy(pos);

        const frame = new THREE.Mesh(
            new THREE.CylinderGeometry(1.6, 1.8, 0.3, 16),
            new THREE.MeshStandardMaterial({ color: 0x0284c7, roughness: 0.4 })
        );
        frame.position.y = 0.15;
        icePad.add(frame);

        const canvas = new THREE.Mesh(
            new THREE.CylinderGeometry(1.35, 1.35, 0.32, 16),
            new THREE.MeshStandardMaterial({
                color: 0x38bdf8,
                emissive: 0x0284c7,
                emissiveIntensity: 0.6,
                roughness: 0.2
            })
        );
        canvas.position.y = 0.18;
        icePad.add(canvas);

        this.mapRoot.add(icePad);
        this.trampolines.push({ position: pos, radius: 1.5, boostForce: 21.5 });
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
                value: 15,
                collected: false
            });
        });
    }

    // =========================================================================
    // BUCLE DE ACTUALIZACIÓN
    // =========================================================================
    update(delta) {
        const time = performance.now() * 0.003;

        // 1. Animaciones de bioma
        for (let i = 0; i < this.animatedUpdaters.length; i++) {
            this.animatedUpdaters[i](delta, time);
        }

        // 2. Animar gemas sagradas de misión (rotación y flotación)
        for (let i = 0; i < this.missionGems.length; i++) {
            const g = this.missionGems[i];
            if (g.collected) continue;
            g.mesh.rotation.y += 0.035;
            g.aura.rotation.z += 0.02;
            g.group.position.y = g.baseY + Math.sin(time * 2.5 + i) * 0.3;
        }

        // 3. Animar portal dimensional
        if (this.portal) {
            this.portal.ring.rotation.z += (this.portal.isActive ? 0.05 : 0.015);
            this.portal.vortex.rotation.z -= (this.portal.isActive ? 0.04 : 0.01);
            if (this.portal.isActive) {
                this.portal.beamMat.opacity = 0.45 + Math.sin(time * 4) * 0.15;
            }
        }

        // 4. Animar tótems de fuego
        for (let i = 0; i < this.totems.length; i++) {
            const t = this.totems[i];
            if (!t.intact) continue;
            t.flame.rotation.y += 0.04;
            t.flame.scale.setScalar(0.9 + Math.sin(time * 5 + i) * 0.15);
        }

        // 5. Animar monedas flotantes
        for (let i = 0; i < this.floatingCoins.length; i++) {
            const c = this.floatingCoins[i];
            if (c.collected) continue;
            c.mesh.rotation.z += 0.04;
            c.mesh.position.y = c.baseY + Math.sin(time + i) * 0.35;
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
}
