// js/world.js - Escenario Zen Ninja en 3D: Dojo, Cerezos, Arcos Torii y Trampolines
import * as THREE from 'three';

export class World {
    constructor(scene) {
        this.scene = scene;
        this.trampolines = [];
        this.floatingCoins = [];
        this.colliders = [];

        this.buildEnvironment();
    }

    buildEnvironment() {
        // 1. Suelo del jardín zen
        const groundGeom = new THREE.CylinderGeometry(56, 56, 1.2, 48);
        const groundMat = new THREE.MeshStandardMaterial({
            color: 0x4ade80, // Verde pasto brillante y amigable
            roughness: 0.85
        });
        const ground = new THREE.Mesh(groundGeom, groundMat);
        ground.position.y = -0.6;
        ground.receiveShadow = true;
        this.scene.add(ground);

        // Círculo central de tatami/arena de entrenamiento
        const arenaGeom = new THREE.CylinderGeometry(18, 18, 0.05, 32);
        const arenaMat = new THREE.MeshStandardMaterial({
            color: 0xfef08a, // Arena suave / tatami claro
            roughness: 0.9
        });
        const arenaMesh = new THREE.Mesh(arenaGeom, arenaMat);
        arenaMesh.position.y = 0.02;
        arenaMesh.receiveShadow = true;
        this.scene.add(arenaMesh);

        // Borde decorativo de madera alrededor de la arena
        const ringGeom = new THREE.TorusGeometry(18, 0.25, 8, 36);
        const ringMat = new THREE.MeshStandardMaterial({ color: 0x854d0e, roughness: 0.7 });
        const ringMesh = new THREE.Mesh(ringGeom, ringMat);
        ringMesh.rotation.x = Math.PI / 2;
        ringMesh.position.y = 0.03;
        this.scene.add(ringMesh);

        // 2. Templo Dojo Japonés de fondo
        this.buildDojo(new THREE.Vector3(0, 0, -32));

        // 3. Arcos Torii rojos en las entradas
        this.buildToriiGate(new THREE.Vector3(0, 0, 24), 0);
        this.buildToriiGate(new THREE.Vector3(-28, 0, 0), Math.PI / 2);
        this.buildToriiGate(new THREE.Vector3(28, 0, 0), -Math.PI / 2);

        // 4. Árboles de Flor de Cerezo (Sakura)
        const treePositions = [
            [-16, -14], [16, -14], [-24, 12], [24, 12],
            [-12, 26], [12, 26], [-34, -20], [34, -20],
            [-36, 4], [36, 4]
        ];
        treePositions.forEach(([x, z]) => {
            this.buildCherryTree(new THREE.Vector3(x, 0, z));
        });

        // 5. Farolillos japoneses iluminados
        const lanternPositions = [
            [-8, -8], [8, -8], [-8, 8], [8, 8],
            [-20, 0], [20, 0], [0, -22]
        ];
        lanternPositions.forEach(([x, z]) => {
            this.buildLantern(new THREE.Vector3(x, 0, z));
        });

        // 6. Trampolines Ninja de salto alto
        this.buildTrampoline(new THREE.Vector3(-12, 0, 0));
        this.buildTrampoline(new THREE.Vector3(12, 0, 0));
        this.buildTrampoline(new THREE.Vector3(0, 0, 14));

        // 7. Monedas flotantes coleccionables en el aire para parkour
        this.spawnFloatingParkourCoins();
    }

    buildDojo(pos) {
        const dojoGroup = new THREE.Group();
        dojoGroup.position.copy(pos);

        const woodMat = new THREE.MeshStandardMaterial({ color: 0x78350f, roughness: 0.7 });
        const wallMat = new THREE.MeshStandardMaterial({ color: 0xfef3c7, roughness: 0.9 });
        const roofMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.5 }); // Tejas oscuras
        const redTrimMat = new THREE.MeshStandardMaterial({ color: 0xd92323, roughness: 0.6 });

        // Base del dojo
        const base = new THREE.Mesh(new THREE.BoxGeometry(22, 1.2, 14), woodMat);
        base.position.y = 0.6;
        base.castShadow = true;
        base.receiveShadow = true;
        dojoGroup.add(base);

        // Muros
        const walls = new THREE.Mesh(new THREE.BoxGeometry(20, 5, 12), wallMat);
        walls.position.y = 3.6;
        walls.castShadow = true;
        dojoGroup.add(walls);

        // Columnas rojas
        const colGeom = new THREE.BoxGeometry(0.7, 5, 0.7);
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

        // Techo de pagoda estilizado (nivel 1)
        const roof1 = new THREE.Mesh(new THREE.ConeGeometry(17, 3.2, 4), roofMat);
        roof1.rotation.y = Math.PI / 4;
        roof1.position.y = 7.2;
        roof1.scale.set(1.1, 1, 0.85);
        roof1.castShadow = true;
        dojoGroup.add(roof1);

        // Techo superior (nivel 2)
        const upperWall = new THREE.Mesh(new THREE.BoxGeometry(10, 2.5, 7), wallMat);
        upperWall.position.y = 8.5;
        dojoGroup.add(upperWall);

        const roof2 = new THREE.Mesh(new THREE.ConeGeometry(9.5, 2.5, 4), roofMat);
        roof2.rotation.y = Math.PI / 4;
        roof2.position.y = 10.5;
        roof2.scale.set(1.1, 1, 0.85);
        roof2.castShadow = true;
        dojoGroup.add(roof2);

        this.scene.add(dojoGroup);
    }

    buildToriiGate(pos, rotY) {
        const torii = new THREE.Group();
        torii.position.copy(pos);
        torii.rotation.y = rotY;

        const redMat = new THREE.MeshStandardMaterial({ color: 0xd92323, roughness: 0.5 });
        const blackMat = new THREE.MeshStandardMaterial({ color: 0x18181b, roughness: 0.6 });

        // Columnas principales
        const p1 = new THREE.Mesh(new THREE.CylinderGeometry(0.35, 0.45, 6.5, 12), redMat);
        p1.position.set(-2.8, 3.25, 0);
        p1.castShadow = true;
        torii.add(p1);

        const p2 = new THREE.Mesh(new THREE.CylinderGeometry(0.35, 0.45, 6.5, 12), redMat);
        p2.position.set(2.8, 3.25, 0);
        p2.castShadow = true;
        torii.add(p2);

        // Viga superior curva
        const topBeam = new THREE.Mesh(new THREE.BoxGeometry(7.8, 0.55, 0.65), redMat);
        topBeam.position.y = 6.4;
        topBeam.castShadow = true;
        torii.add(topBeam);

        const roofCap = new THREE.Mesh(new THREE.BoxGeometry(8.2, 0.25, 0.8), blackMat);
        roofCap.position.y = 6.7;
        roofCap.castShadow = true;
        torii.add(roofCap);

        // Viga secundaria
        const subBeam = new THREE.Mesh(new THREE.BoxGeometry(6.6, 0.35, 0.45), redMat);
        subBeam.position.y = 5.3;
        torii.add(subBeam);

        this.scene.add(torii);
    }

    buildCherryTree(pos) {
        const tree = new THREE.Group();
        tree.position.copy(pos);

        const trunkMat = new THREE.MeshStandardMaterial({ color: 0x451a03, roughness: 0.9 });
        const blossomMat = new THREE.MeshStandardMaterial({
            color: 0xf472b6, // Rosa cerezo
            roughness: 0.8
        });

        // Tronco con ligera curvatura estilizada
        const trunkGeom = new THREE.CylinderGeometry(0.35, 0.6, 4.0, 8);
        const trunk = new THREE.Mesh(trunkGeom, trunkMat);
        trunk.position.y = 2.0;
        trunk.rotation.z = (Math.random() - 0.5) * 0.15;
        trunk.castShadow = true;
        tree.add(trunk);

        // Follaje esponjoso de nubes rosadas (bloques redondeados)
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

        this.scene.add(tree);
    }

    buildLantern(pos) {
        const lantern = new THREE.Group();
        lantern.position.copy(pos);

        const stoneMat = new THREE.MeshStandardMaterial({ color: 0x71717a, roughness: 0.9 });
        const glowMat = new THREE.MeshBasicMaterial({ color: 0xfef08a });

        // Poste de piedra
        const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.25, 2.2, 6), stoneMat);
        pole.position.y = 1.1;
        lantern.add(pole);

        // Caja luminosa (brilla sin calcular luces dinámicas costosas)
        const lightBox = new THREE.Mesh(new THREE.BoxGeometry(0.55, 0.55, 0.55), glowMat);
        lightBox.position.y = 2.4;
        lantern.add(lightBox);

        // Tejado del farolillo
        const cap = new THREE.Mesh(new THREE.ConeGeometry(0.65, 0.35, 4), stoneMat);
        cap.position.y = 2.85;
        cap.rotation.y = Math.PI / 4;
        lantern.add(cap);

        this.scene.add(lantern);
    }

    buildTrampoline(pos) {
        const pad = new THREE.Group();
        pad.position.copy(pos);

        const frameMat = new THREE.MeshStandardMaterial({ color: 0xb45309, roughness: 0.7 });
        const springMat = new THREE.MeshStandardMaterial({
            color: 0xef4444, // Rojo llamativo
            roughness: 0.3,
            emissive: 0xb91c1c,
            emissiveIntensity: 0.4
        });

        // Marco circular
        const frame = new THREE.Mesh(new THREE.CylinderGeometry(1.6, 1.8, 0.3, 16), frameMat);
        frame.position.y = 0.15;
        frame.castShadow = true;
        pad.add(frame);

        // Lona de salto
        const canvas = new THREE.Mesh(new THREE.CylinderGeometry(1.35, 1.35, 0.32, 16), springMat);
        canvas.position.y = 0.18;
        pad.add(canvas);

        // Símbolo ninja en el centro del trampolín
        const emblem = new THREE.Mesh(new THREE.RingGeometry(0.2, 0.6, 4), new THREE.MeshBasicMaterial({ color: 0xfacc15, side: THREE.DoubleSide }));
        emblem.rotation.x = -Math.PI / 2;
        emblem.position.y = 0.35;
        pad.add(emblem);

        this.scene.add(pad);
        this.trampolines.push({
            position: pos,
            radius: 1.5,
            boostForce: 21.0
        });
    }

    spawnFloatingParkourCoins() {
        const coinGeom = new THREE.CylinderGeometry(0.35, 0.35, 0.08, 14);
        const coinMat = new THREE.MeshStandardMaterial({
            color: 0xffd700,
            metalness: 0.9,
            roughness: 0.2,
            emissive: 0xd97706,
            emissiveIntensity: 0.5
        });

        // Posiciones aéreas tentadoras sobre trampolines y arcos
        const airborneSpots = [
            new THREE.Vector3(-12, 7.5, 0),
            new THREE.Vector3(-12, 10.0, 0),
            new THREE.Vector3(12, 7.5, 0),
            new THREE.Vector3(12, 10.0, 0),
            new THREE.Vector3(0, 7.5, 14),
            new THREE.Vector3(0, 10.5, 14),
            new THREE.Vector3(0, 7.2, 24), // Sobre el arco Torii
            new THREE.Vector3(-28, 7.2, 0),
            new THREE.Vector3(28, 7.2, 0),
            new THREE.Vector3(0, 5.5, -15),
            new THREE.Vector3(0, 9.5, -24)
        ];

        airborneSpots.forEach(pos => {
            const mesh = new THREE.Mesh(coinGeom, coinMat);
            mesh.position.copy(pos);
            mesh.rotation.x = Math.PI / 2;
            this.scene.add(mesh);

            this.floatingCoins.push({
                mesh: mesh,
                baseY: pos.y,
                value: 15,
                collected: false
            });
        });
    }

    checkTrampolines(player) {
        for (const t of this.trampolines) {
            const dist = Math.hypot(player.mesh.position.x - t.position.x, player.mesh.position.z - t.position.z);
            if (dist < t.radius && player.mesh.position.y < 0.6 && player.velocity.y <= 0) {
                player.bounceTrampoline(t.boostForce);
                break;
            }
        }
    }

    checkFloatingCoins(playerPos, onCollect) {
        const time = performance.now() * 0.003;
        for (let i = this.floatingCoins.length - 1; i >= 0; i--) {
            const c = this.floatingCoins[i];
            if (c.collected) continue;

            c.mesh.rotation.z += 0.04;
            c.mesh.position.y = c.baseY + Math.sin(time + i) * 0.35;

            const dist = c.mesh.position.distanceTo(playerPos);
            if (dist < 1.6) {
                c.collected = true;
                this.scene.remove(c.mesh);
                if (onCollect) onCollect(c.value, c.mesh.position);
                this.floatingCoins.splice(i, 1);
            }
        }
    }
}
