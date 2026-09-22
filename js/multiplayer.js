// js/multiplayer.js - Gestor de Salas y Sincronización 3D en Tiempo Real (WebSockets)
import * as THREE from 'three';
import { createWeaponMesh, WEAPONS } from './weapons.js';
import { sounds } from './sound.js';

/**
 * Representación en 3D de otro ninja conectado en la sala
 */
export class RemoteNinjaPlayer {
    constructor(scene, data) {
        this.scene = scene;
        this.id = data.id;
        this.name = data.name || 'Ninja';
        this.color = data.color || 0xd92323;
        this.currentWeaponId = data.weapon || 'bokken';

        this.targetPosition = new THREE.Vector3(data.x || 0, data.y || 0, data.z || 0);
        this.targetRotation = data.rot || 0;
        this.animState = 'idle';
        this.isAttacking = false;
        this.attackTimer = 0;
        this.attackCombo = 0;

        this.mesh = new THREE.Group();
        this.mesh.name = `remote_player_${this.id}`;
        this.mesh.position.copy(this.targetPosition);

        this.buildRobloxModel();
        this.buildNameTag();
        this.equipWeapon(this.currentWeaponId);

        this.scene.add(this.mesh);
    }

    buildRobloxModel() {
        this.suitMat = new THREE.MeshStandardMaterial({
            color: this.color,
            roughness: 0.6
        });
        const redClothMat = new THREE.MeshStandardMaterial({ color: 0xd92323, roughness: 0.5 });
        const skinMat = new THREE.MeshStandardMaterial({ color: 0xf6d8ae, roughness: 0.4 });
        const metalMat = new THREE.MeshStandardMaterial({ color: 0xd4d4d8, metalness: 0.8 });
        const eyeMat = new THREE.MeshBasicMaterial({ color: 0x0f172a });

        // Torso
        const torsoGeom = new THREE.BoxGeometry(0.85, 1.1, 0.45);
        this.torso = new THREE.Mesh(torsoGeom, this.suitMat);
        this.torso.position.y = 1.35;
        this.torso.castShadow = true;
        this.mesh.add(this.torso);

        // Cinturón ninja
        const belt = new THREE.Mesh(new THREE.BoxGeometry(0.88, 0.2, 0.48), redClothMat);
        belt.position.y = -0.35;
        this.torso.add(belt);

        // Cabeza
        this.head = new THREE.Mesh(new THREE.BoxGeometry(0.65, 0.65, 0.65), skinMat);
        this.head.position.y = 0.9;
        this.head.castShadow = true;
        this.torso.add(this.head);

        // Máscara ninja
        const mask = new THREE.Mesh(new THREE.BoxGeometry(0.66, 0.32, 0.66), this.suitMat);
        mask.position.y = -0.15;
        this.head.add(mask);

        // Ojos
        const eyeL = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.1, 0.02), eyeMat);
        eyeL.position.set(-0.16, 0.1, 0.33);
        const eyeR = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.1, 0.02), eyeMat);
        eyeR.position.set(0.16, 0.1, 0.33);
        this.head.add(eyeL);
        this.head.add(eyeR);

        // Bandana en la frente
        const headband = new THREE.Mesh(new THREE.BoxGeometry(0.67, 0.16, 0.67), redClothMat);
        headband.position.y = 0.22;
        this.head.add(headband);

        // Placa
        const plate = new THREE.Mesh(new THREE.BoxGeometry(0.24, 0.1, 0.02), metalMat);
        plate.position.set(0, 0.22, 0.34);
        this.head.add(plate);

        // Cintas de bandana traseras
        this.bandanaTail = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.5, 0.03), redClothMat);
        this.bandanaTail.position.set(0, 0.08, -0.36);
        this.bandanaTail.rotation.x = 0.35;
        this.head.add(this.bandanaTail);

        // Brazo Izquierdo
        this.leftArmPivot = new THREE.Group();
        this.leftArmPivot.position.set(-0.62, 0.45, 0);
        this.torso.add(this.leftArmPivot);
        this.leftArm = new THREE.Mesh(new THREE.BoxGeometry(0.38, 1.0, 0.38), this.suitMat);
        this.leftArm.position.y = -0.45;
        this.leftArmPivot.add(this.leftArm);

        // Brazo Derecho (con arma)
        this.rightArmPivot = new THREE.Group();
        this.rightArmPivot.position.set(0.62, 0.45, 0);
        this.torso.add(this.rightArmPivot);
        this.rightArm = new THREE.Mesh(new THREE.BoxGeometry(0.38, 1.0, 0.38), this.suitMat);
        this.rightArm.position.y = -0.45;
        this.rightArmPivot.add(this.rightArm);

        this.weaponHolder = new THREE.Group();
        this.weaponHolder.position.set(0, -0.45, 0.18);
        this.weaponHolder.rotation.x = Math.PI / 2;
        this.rightArm.add(this.weaponHolder);

        // Piernas
        const legGeom = new THREE.BoxGeometry(0.4, 0.9, 0.4);
        this.leftLegPivot = new THREE.Group();
        this.leftLegPivot.position.set(-0.23, -0.55, 0);
        this.torso.add(this.leftLegPivot);
        this.leftLeg = new THREE.Mesh(legGeom, this.suitMat);
        this.leftLeg.position.y = -0.4;
        this.leftLegPivot.add(this.leftLeg);

        this.rightLegPivot = new THREE.Group();
        this.rightLegPivot.position.set(0.23, -0.55, 0);
        this.torso.add(this.rightLegPivot);
        this.rightLeg = new THREE.Mesh(legGeom, this.suitMat);
        this.rightLeg.position.y = -0.4;
        this.rightLegPivot.add(this.rightLeg);
    }

    buildNameTag() {
        const canvas = document.createElement('canvas');
        canvas.width = 256;
        canvas.height = 72;
        const ctx = canvas.getContext('2d');

        // Fondo redondeado oscuro
        ctx.fillStyle = 'rgba(15, 23, 42, 0.85)';
        ctx.beginPath();
        ctx.roundRect(10, 10, 236, 52, 16);
        ctx.fill();

        // Borde dorado
        ctx.strokeStyle = '#f59e0b';
        ctx.lineWidth = 4;
        ctx.stroke();

        // Texto con el nombre del ninja
        ctx.font = 'bold 26px sans-serif';
        ctx.fillStyle = '#ffffff';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(`🥷 ${this.name}`, 128, 36);

        const texture = new THREE.CanvasTexture(canvas);
        const spriteMat = new THREE.SpriteMaterial({ map: texture, transparent: true });
        this.nameSprite = new THREE.Sprite(spriteMat);
        this.nameSprite.scale.set(2.4, 0.68, 1);
        this.nameSprite.position.y = 2.65;
        this.mesh.add(this.nameSprite);
    }

    equipWeapon(weaponId) {
        if (!weaponId) return;
        this.currentWeaponId = weaponId;

        while (this.weaponHolder.children.length > 0) {
            this.weaponHolder.remove(this.weaponHolder.children[0]);
        }

        const mesh = createWeaponMesh(weaponId);
        this.weaponHolder.add(mesh);
    }

    triggerAttack(weaponId, combo, particles) {
        this.isAttacking = true;
        this.attackTimer = 0;
        this.attackCombo = combo || 0;

        if (weaponId !== this.currentWeaponId) {
            this.equipWeapon(weaponId);
        }

        const weaponData = WEAPONS[weaponId] || WEAPONS.bokken;
        sounds.playSlash(weaponData.element);

        if (particles) {
            const forward = new THREE.Vector3(
                Math.sin(this.mesh.rotation.y),
                0,
                Math.cos(this.mesh.rotation.y)
            ).normalize();

            if (weaponData.type === 'ranged') {
                const spawnPos = this.mesh.position.clone().add(new THREE.Vector3(0, 1.3, 0)).addScaledVector(forward, 0.8);
                particles.spawnShurikenProjectile(spawnPos, forward, weaponData.damage, weaponData.element);
            } else {
                const slashPos = this.mesh.position.clone().add(new THREE.Vector3(0, 1.2, 0)).addScaledVector(forward, 1.2);
                particles.createSlashEffect(slashPos, forward, weaponData.element);
            }
        }
    }

    update(delta) {
        // Interpolación suave hacia la posición y rotación objetivo (lerp)
        this.mesh.position.lerp(this.targetPosition, 0.22);

        let diff = this.targetRotation - this.mesh.rotation.y;
        while (diff < -Math.PI) diff += Math.PI * 2;
        while (diff > Math.PI) diff -= Math.PI * 2;
        this.mesh.rotation.y += diff * 0.22;

        const time = performance.now() * 0.009;

        // Animación de ataque
        if (this.isAttacking) {
            this.attackTimer += delta * 8;
            if (this.attackTimer > Math.PI) {
                this.isAttacking = false;
                this.attackTimer = 0;
            }

            if (this.attackCombo === 1) {
                this.rightArmPivot.rotation.x = Math.PI / 2 + Math.sin(this.attackTimer) * 0.6;
                this.rightArmPivot.rotation.y = -Math.PI / 3 + Math.sin(this.attackTimer) * 1.8;
            } else if (this.attackCombo === 2) {
                this.rightArmPivot.rotation.x = Math.PI - Math.sin(this.attackTimer) * 2.2;
                this.rightArmPivot.rotation.y = 0;
            } else {
                this.rightArmPivot.rotation.x = Math.PI / 2;
                this.mesh.rotation.y += delta * 20;
            }
        } else {
            if (this.animState === 'run') {
                const swing = Math.sin(time) * 0.75;
                this.leftLegPivot.rotation.x = swing;
                this.rightLegPivot.rotation.x = -swing;
                this.leftArmPivot.rotation.x = -swing * 0.7;
                this.rightArmPivot.rotation.x = swing * 0.7;
            } else if (this.animState === 'jump') {
                this.rightArmPivot.rotation.x = -Math.PI * 0.8;
                this.leftArmPivot.rotation.x = -Math.PI * 0.8;
            } else {
                this.leftLegPivot.rotation.set(0, 0, 0);
                this.rightLegPivot.rotation.set(0, 0, 0);
                this.leftArmPivot.rotation.set(0, 0, -0.1);
                this.rightArmPivot.rotation.set(0, 0, 0.1);
            }
        }
    }

    destroy() {
        this.scene.remove(this.mesh);
    }
}

/**
 * Cliente de Red Multijugador con WebSockets
 */
export class MultiplayerManager {
    constructor(scene, particles) {
        this.scene = scene;
        this.particles = particles;
        this.socket = null;
        this.isConnected = false;
        this.inRoom = false;
        this.roomCode = null;
        this.playerId = null;
        this.playerName = 'Ninja';
        this.playerColor = 0x1e293b;
        this.remotePlayers = new Map();

        // Control de envío de paquetes
        this.lastSendTime = 0;
        this.sendInterval = 0.05; // 20 actualizaciones por segundo

        // Callbacks de UI
        this.onRoomCreated = null;
        this.onRoomJoined = null;
        this.onPlayerJoined = null;
        this.onPlayerLeft = null;
        this.onError = null;
    }

        this.usePeerJS = (window.location.protocol === 'https:' || window.location.hostname.includes('github.io'));
        this.peer = null;
        this.peerConnections = []; // Si es anfitrión, guarda las conexiones de los demás
        this.hostConn = null; // Si es cliente, guarda la conexión hacia el anfitrión
    }

    connect() {
        if (this.usePeerJS) return;
        if (this.socket && (this.socket.readyState === WebSocket.OPEN || this.socket.readyState === WebSocket.CONNECTING)) {
            return;
        }

        const host = window.location.hostname || 'localhost';
        const wsUrl = `ws://${host}:8001`;

        try {
            this.socket = new WebSocket(wsUrl);

            this.socket.onopen = () => {
                this.isConnected = true;
                console.log('Conectado al servidor multijugador WebSocket');
            };

            this.socket.onmessage = (event) => {
                this.handleServerMessage(event.data);
            };

            this.socket.onclose = () => {
                this.isConnected = false;
                this.inRoom = false;
            };

            this.socket.onerror = () => {
                // Si falla el WebSocket en local, activar automáticamente PeerJS P2P
                console.log('WebSocket no disponible, activando modo WebRTC P2P');
                this.usePeerJS = true;
            };
        } catch (e) {
            this.usePeerJS = true;
        }
    }

    createRoom(playerName, playerColor) {
        this.playerName = playerName;
        this.playerColor = playerColor;
        this.playerId = Math.random().toString(36).substring(2, 9);

        // Modo WebRTC PeerJS (GitHub Pages / HTTPS o fallback)
        if (this.usePeerJS && window.Peer) {
            const prefixes = ['NINJA', 'DOJO', 'KATAN', 'SHURK', 'DRAGN', 'SAMUR'];
            const prefix = prefixes[Math.floor(Math.random() * prefixes.length)];
            const code = `${prefix}${Math.floor(Math.random() * 90 + 10)}`;
            this.roomCode = code;

            const peerId = `guerrero-ninja-${code.toLowerCase()}`;
            try {
                this.peer = new window.Peer(peerId);

                this.peer.on('open', () => {
                    this.inRoom = true;
                    this.isHost = true;
                    if (this.onRoomCreated) {
                        this.onRoomCreated(code, [{
                            id: this.playerId,
                            name: playerName,
                            color: playerColor,
                            isHost: true
                        }]);
                    }
                });

                this.peer.on('connection', (conn) => {
                    this.peerConnections.push(conn);

                    conn.on('data', (raw) => {
                        const data = typeof raw === 'string' ? JSON.parse(raw) : raw;
                        if (data.type === 'join_room') {
                            conn.remotePlayerId = data.playerId;
                            // Enviar lista de jugadores al nuevo
                            conn.send({
                                type: 'room_joined',
                                roomCode: code,
                                playerId: data.playerId,
                                players: [{ id: this.playerId, name: this.playerName, color: this.playerColor, isHost: true }]
                            });
                            // Notificar al anfitrión
                            this.handleServerMessage(JSON.stringify({
                                type: 'player_joined',
                                player: { id: data.playerId, name: data.name, color: data.color }
                            }));
                        } else {
                            // Reenviar a los demás jugadores y procesar localmente
                            this.peerConnections.forEach(c => {
                                if (c !== conn && c.open) c.send(data);
                            });
                            this.handleServerMessage(JSON.stringify(data));
                        }
                    });

                    conn.on('close', () => {
                        if (conn.remotePlayerId) {
                            this.handleServerMessage(JSON.stringify({
                                type: 'player_left',
                                id: conn.remotePlayerId,
                                name: 'Ninja'
                            }));
                        }
                    });
                });

                this.peer.on('error', (err) => {
                    console.warn('Error en PeerJS:', err);
                    if (this.onError) this.onError('El código ya está en uso o hubo un problema de conexión.');
                });
            } catch (err) {
                console.warn('Fallo al inicializar Peer:', err);
            }
            return;
        }

        // Modo WebSocket estándar (Servidor local)
        this.connect();
        const sendCreate = () => {
            this.socket.send(jsonEncode({
                type: 'create_room',
                name: playerName,
                color: playerColor
            }));
        };

        if (this.socket && this.socket.readyState === WebSocket.OPEN) {
            sendCreate();
        } else if (this.socket) {
            this.socket.addEventListener('open', sendCreate, { once: true });
        }
    }

    joinRoom(roomCode, playerName, playerColor) {
        this.playerName = playerName;
        this.playerColor = playerColor;
        this.playerId = Math.random().toString(36).substring(2, 9);
        const cleanCode = (roomCode || '').trim().toUpperCase();

        // Modo WebRTC PeerJS (GitHub Pages)
        if (this.usePeerJS && window.Peer) {
            try {
                this.peer = new window.Peer();
                const hostPeerId = `guerrero-ninja-${cleanCode.toLowerCase()}`;

                this.peer.on('open', () => {
                    this.hostConn = this.peer.connect(hostPeerId);

                    this.hostConn.on('open', () => {
                        this.inRoom = true;
                        this.roomCode = cleanCode;
                        this.hostConn.send({
                            type: 'join_room',
                            playerId: this.playerId,
                            roomCode: cleanCode,
                            name: playerName,
                            color: playerColor
                        });
                    });

                    this.hostConn.on('data', (raw) => {
                        const data = typeof raw === 'string' ? JSON.parse(raw) : raw;
                        this.handleServerMessage(JSON.stringify(data));
                    });

                    this.hostConn.on('error', () => {
                        if (this.onError) this.onError(`No se pudo conectar a la sala '${cleanCode}'. Revisa el código.`);
                    });
                });

                this.peer.on('error', () => {
                    if (this.onError) this.onError(`No se encontró la sala '${cleanCode}'.`);
                });
            } catch (e) {
                if (this.onError) this.onError('Error al unirse a la sala P2P.');
            }
            return;
        }

        // Modo WebSocket estándar
        this.connect();
        const sendJoin = () => {
            this.socket.send(jsonEncode({
                type: 'join_room',
                roomCode: cleanCode,
                name: playerName,
                color: playerColor
            }));
        };

        if (this.socket && this.socket.readyState === WebSocket.OPEN) {
            sendJoin();
        } else if (this.socket) {
            this.socket.addEventListener('open', sendJoin, { once: true });
        }
    }

    handleServerMessage(raw) {
        try {
            const data = JSON.parse(raw);
            const type = data.type;

            if (type === 'room_created') {
                this.inRoom = true;
                this.roomCode = data.roomCode;
                this.playerId = data.playerId;
                if (this.onRoomCreated) this.onRoomCreated(data.roomCode, data.players);
            } else if (type === 'room_joined') {
                this.inRoom = true;
                this.roomCode = data.roomCode;
                this.playerId = data.playerId;

                // Crear los jugadores remotos que ya estaban en la sala
                data.players.forEach(p => {
                    if (p.id !== this.playerId) {
                        this.addRemotePlayer(p);
                    }
                });

                if (this.onRoomJoined) this.onRoomJoined(data.roomCode, data.players);
            } else if (type === 'player_joined') {
                if (data.player.id !== this.playerId) {
                    this.addRemotePlayer(data.player);
                    sounds.playPoof();
                    if (this.onPlayerJoined) this.onPlayerJoined(data.player);
                }
            } else if (type === 'player_update') {
                const rp = this.remotePlayers.get(data.id);
                if (rp) {
                    rp.targetPosition.set(data.x, data.y, data.z);
                    rp.targetRotation = data.rot;
                    rp.animState = data.anim;
                    if (data.weapon && data.weapon !== rp.currentWeaponId) {
                        rp.equipWeapon(data.weapon);
                    }
                }
            } else if (type === 'player_attack') {
                const rp = this.remotePlayers.get(data.id);
                if (rp) {
                    rp.triggerAttack(data.weaponId, data.combo, this.particles);
                }
            } else if (type === 'player_left') {
                const rp = this.remotePlayers.get(data.id);
                if (rp) {
                    // Humo de despedida ninja
                    this.particles.createSmokePoof(rp.mesh.position, 1.2);
                    rp.destroy();
                    this.remotePlayers.delete(data.id);
                    if (this.onPlayerLeft) this.onPlayerLeft(data.id, data.name);
                }
            } else if (type === 'error') {
                if (this.onError) this.onError(data.message);
            }
        } catch (e) {
            console.error('Error procesando mensaje de red:', e);
        }
    }

    addRemotePlayer(data) {
        if (!this.remotePlayers.has(data.id)) {
            const rp = new RemoteNinjaPlayer(this.scene, data);
            this.remotePlayers.set(data.id, rp);
            this.particles.createSmokePoof(rp.mesh.position, 1.2);
        }
    }

    sendLocalUpdate(playerState) {
        if (!this.inRoom) return;

        const now = performance.now() * 0.001;
        if (now - this.lastSendTime < this.sendInterval) return;
        this.lastSendTime = now;

        const payload = {
            type: 'player_update',
            id: this.playerId,
            ...playerState
        };

        if (this.usePeerJS) {
            if (this.isHost) {
                this.peerConnections.forEach(c => { if (c.open) c.send(payload); });
            } else if (this.hostConn && this.hostConn.open) {
                this.hostConn.send(payload);
            }
        } else if (this.socket && this.socket.readyState === WebSocket.OPEN) {
            this.socket.send(jsonEncode(payload));
        }
    }

    sendAttack(weaponId, combo, forward) {
        if (!this.inRoom) return;

        const payload = {
            type: 'player_attack',
            id: this.playerId,
            weaponId: weaponId,
            combo: combo,
            forward: [forward.x, forward.y, forward.z]
        };

        if (this.usePeerJS) {
            if (this.isHost) {
                this.peerConnections.forEach(c => { if (c.open) c.send(payload); });
            } else if (this.hostConn && this.hostConn.open) {
                this.hostConn.send(payload);
            }
        } else if (this.socket && this.socket.readyState === WebSocket.OPEN) {
            this.socket.send(jsonEncode(payload));
        }
    }

    update(delta) {
        this.remotePlayers.forEach(rp => rp.update(delta));
    }
}

function jsonEncode(obj) {
    return JSON.stringify(obj);
}
