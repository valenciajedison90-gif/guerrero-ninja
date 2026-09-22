# server.py - Servidor HTTP y WebSocket de Salas Multijugador para Guerrero Ninja 3D
import http.server
import socketserver
import webbrowser
import os
import sys
import socket
import threading
import asyncio
import json
import random
import string
import uuid

# Asegurar salida utf-8 en consola Windows
if hasattr(sys.stdout, 'reconfigure'):
    try:
        sys.stdout.reconfigure(encoding='utf-8')
    except Exception:
        pass

import websockets

HTTP_PORT = 8000
WS_PORT = 8001
DIRECTORY = os.path.dirname(os.path.abspath(__file__))

# Diccionario de salas en memoria:
# rooms[room_code] = {
#     "created_at": float,
#     "host_id": str,
#     "players": { player_id: { "ws": WebSocket, "name": str, "color": str/int, ... } }
# }
rooms = {}

# Mapeo de conexión a (room_code, player_id)
connections = {}

def get_local_ip():
    """Detecta la IP local de la computadora en la red Wi-Fi/LAN"""
    try:
        s = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
        s.connect(("8.8.8.8", 80))
        ip = s.getsockname()[0]
        s.close()
        return ip
    except Exception:
        return "127.0.0.1"

def generate_room_code():
    """Genera un código de sala divertido, legible y corto (ej. NINJA7, DOJO4, KATAN9)"""
    prefixes = ["NINJA", "DOJO", "KATAN", "SHURK", "DRAGN", "SAMUR", "SOMBR", "TIGRE"]
    prefix = random.choice(prefixes)
    num = random.randint(1, 99)
    code = f"{prefix}{num}"
    while code in rooms:
        code = f"{random.choice(prefixes)}{random.randint(1, 99)}"
    return code

async def broadcast_to_room(room_code, message_dict, exclude_player_id=None):
    """Envía un mensaje JSON a todos los jugadores de una sala"""
    room = rooms.get(room_code)
    if not room:
        return

    msg_str = json.dumps(message_dict)
    dead_players = []

    for pid, pdata in room["players"].items():
        if exclude_player_id and pid == exclude_player_id:
            continue
        try:
            await pdata["ws"].send(msg_str)
        except Exception:
            dead_players.append(pid)

    for pid in dead_players:
        if pid in room["players"]:
            del room["players"][pid]

async def ws_handler(websocket):
    player_id = str(uuid.uuid4())[:8]
    current_room = None

    try:
        async for raw_message in websocket:
            try:
                data = json.loads(raw_message)
            except Exception:
                continue

            msg_type = data.get("type")

            # 1. CREAR SALA
            if msg_type == "create_room":
                room_code = generate_room_code()
                player_name = (data.get("name") or "Ninja").strip()[:16]
                player_color = data.get("color") or 0x1e293b

                rooms[room_code] = {
                    "host_id": player_id,
                    "players": {
                        player_id: {
                            "id": player_id,
                            "ws": websocket,
                            "name": player_name,
                            "color": player_color,
                            "x": 0, "y": 0, "z": 0,
                            "rot": 0,
                            "anim": "idle",
                            "weapon": "bokken",
                            "health": 100,
                            "maxHealth": 100
                        }
                    }
                }
                current_room = room_code
                connections[websocket] = (room_code, player_id)

                await websocket.send(json.dumps({
                    "type": "room_created",
                    "roomCode": room_code,
                    "playerId": player_id,
                    "players": [{
                        "id": player_id,
                        "name": player_name,
                        "color": player_color,
                        "isHost": True
                    }]
                }))
                print(f"  [SALA] Creada sala {room_code} por {player_name} ({player_id})")

            # 2. UNIRSE A SALA
            elif msg_type == "join_room":
                requested_code = str(data.get("roomCode") or "").strip().upper()
                player_name = (data.get("name") or "Ninja").strip()[:16]
                player_color = data.get("color") or 0xd92323

                if requested_code not in rooms:
                    await websocket.send(json.dumps({
                        "type": "error",
                        "message": f"La sala '{requested_code}' no existe. Verifica el código e inténtalo de nuevo."
                    }))
                    continue

                room = rooms[requested_code]
                if len(room["players"]) >= 12:
                    await websocket.send(json.dumps({
                        "type": "error",
                        "message": "La sala está llena (máximo 12 ninjas)."
                    }))
                    continue

                # Registrar jugador en la sala
                new_player = {
                    "id": player_id,
                    "ws": websocket,
                    "name": player_name,
                    "color": player_color,
                    "x": 0, "y": 0, "z": 0,
                    "rot": 0,
                    "anim": "idle",
                    "weapon": "bokken",
                    "health": 100,
                    "maxHealth": 100
                }
                room["players"][player_id] = new_player
                current_room = requested_code
                connections[websocket] = (requested_code, player_id)

                # Notificar al nuevo jugador los integrantes actuales
                player_list = []
                for pid, p in room["players"].items():
                    player_list.append({
                        "id": pid,
                        "name": p["name"],
                        "color": p["color"],
                        "x": p["x"],
                        "y": p["y"],
                        "z": p["z"],
                        "rot": p["rot"],
                        "weapon": p["weapon"],
                        "isHost": (pid == room["host_id"])
                    })

                await websocket.send(json.dumps({
                    "type": "room_joined",
                    "roomCode": requested_code,
                    "playerId": player_id,
                    "players": player_list
                }))

                # Notificar a los demás integrantes de la llegada del nuevo ninja
                await broadcast_to_room(requested_code, {
                    "type": "player_joined",
                    "player": {
                        "id": player_id,
                        "name": player_name,
                        "color": player_color,
                        "x": 0, "y": 0, "z": 0,
                        "rot": 0,
                        "weapon": "bokken"
                    }
                }, exclude_player_id=player_id)

                print(f"  [SALA] {player_name} se unió a la sala {requested_code}")

            # 3. ACTUALIZACIÓN DE ESTADO DEL JUGADOR (Posición, rotación, animación, arma)
            elif msg_type == "player_update" and current_room:
                room = rooms.get(current_room)
                if room and player_id in room["players"]:
                    p = room["players"][player_id]
                    p["x"] = data.get("x", p["x"])
                    p["y"] = data.get("y", p["y"])
                    p["z"] = data.get("z", p["z"])
                    p["rot"] = data.get("rot", p["rot"])
                    p["anim"] = data.get("anim", p["anim"])
                    p["weapon"] = data.get("weapon", p["weapon"])

                    # Reenviar a los demás jugadores
                    await broadcast_to_room(current_room, {
                        "type": "player_update",
                        "id": player_id,
                        "x": p["x"],
                        "y": p["y"],
                        "z": p["z"],
                        "rot": p["rot"],
                        "anim": p["anim"],
                        "weapon": p["weapon"]
                    }, exclude_player_id=player_id)

            # 4. EVENTO DE ATAQUE (Para ver los tajos y shurikens de los amigos)
            elif msg_type == "player_attack" and current_room:
                await broadcast_to_room(current_room, {
                    "type": "player_attack",
                    "id": player_id,
                    "weaponId": data.get("weaponId", "bokken"),
                    "combo": data.get("combo", 0),
                    "pos": data.get("pos"),
                    "forward": data.get("forward")
                }, exclude_player_id=player_id)

            # 5. SINCRONIZACIÓN DE DAÑO A ENEMIGOS (Combate Cooperativo)
            elif msg_type == "sync_enemy_damage" and current_room:
                await broadcast_to_room(current_room, {
                    "type": "sync_enemy_damage",
                    "enemyId": data.get("enemyId"),
                    "damage": data.get("damage"),
                    "isCrit": data.get("isCrit", False),
                    "attackerId": player_id
                }, exclude_player_id=player_id)

            # 6. MENSAJES RÁPIDOS EMOJI / CHAT NINJA
            elif msg_type == "quick_chat" and current_room:
                text = (data.get("text") or "")[:32]
                await broadcast_to_room(current_room, {
                    "type": "quick_chat",
                    "id": player_id,
                    "text": text
                })

    except Exception:
        pass
    finally:
        # Desconexión limpia
        if websocket in connections:
            room_code, pid = connections[websocket]
            del connections[websocket]

            if room_code in rooms:
                room = rooms[room_code]
                player_name = room["players"].get(pid, {}).get("name", "Ninja")
                if pid in room["players"]:
                    del room["players"][pid]

                print(f"  [SALA] {player_name} salió de la sala {room_code}")

                # Avisar a los restantes
                await broadcast_to_room(room_code, {
                    "type": "player_left",
                    "id": pid,
                    "name": player_name
                })

                # Si no queda nadie, cerrar la sala
                if not room["players"]:
                    del rooms[room_code]
                    print(f"  [SALA] Sala {room_code} cerrada por inactividad.")

class CustomHTTPHandler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=DIRECTORY, **kwargs)

    def end_headers(self):
        # Desactivar caché para desarrollo fluido
        self.send_header('Cache-Control', 'no-store, no-cache, must-revalidate')
        super().end_headers()

    def log_message(self, format, *args):
        # Silenciar logs HTTP rutinarios para mantener limpia la consola
        pass

def run_http_server():
    server_address = ('', HTTP_PORT)
    try:
        httpd = socketserver.TCPServer(server_address, CustomHTTPHandler)
        httpd.serve_forever()
    except Exception as e:
        print(f"  [AVISO HTTP] {e}")

async def run_ws_server():
    async with websockets.serve(ws_handler, '0.0.0.0', WS_PORT):
        await asyncio.Future() # Mantener corriendo indefinidamente

def main():
    local_ip = get_local_ip()

    # 1. Iniciar servidor HTTP en hilo secundario
    http_thread = threading.Thread(target=run_http_server, daemon=True)
    http_thread.start()

    url_local = f"http://localhost:{HTTP_PORT}/index.html"
    url_network = f"http://{local_ip}:{HTTP_PORT}/index.html"

    print("=" * 65)
    print("  🥷 ¡GUERRERO NINJA 3D - SERVIDOR MULTIJUGADOR ONLINE! 🥷")
    print("=" * 65)
    print(f"  🎮 Tu juego en esta PC:       {url_local}")
    print(f"  🌐 Para jugar con amigos en:")
    print(f"     la misma red Wi-Fi:       {url_network}")
    print("=" * 65)
    print("  ✨ ¡Crea tu sala, comparte el código y jueguen juntos!")
    print("  ❌ Para detener el servidor, cierra esta ventana.")
    print("=" * 65)

    # Abrir navegador automáticamente para el anfitrión
    webbrowser.open(url_local)

    # 2. Iniciar servidor WebSocket en bucle asyncio principal
    try:
        asyncio.run(run_ws_server())
    except KeyboardInterrupt:
        print("\n  Servidor detenido.")

if __name__ == "__main__":
    main()
