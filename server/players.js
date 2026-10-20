// verwaltet alle spieler am server (nur daten, kein socket-code)

import { DEFAULT_VEHICLE_KEY, getVehicle } from "../shared/vehicles.js";

const COLORS = [0xff0000, 0x00ff00, 0x0000ff, 0xffff00, 0xff00ff, 0x00ffff];

const players = {};

export function addPlayer(id) {
    const n = Object.keys(players).length;   // anzahl der spieler

    players[id] = {
        id: id,
        x: 400 + n * 100,
        y: 300,
        angle: 0,
        color: COLORS[n % COLORS.length],
        vehicleKey: DEFAULT_VEHICLE_KEY,
    };
    return players[id];
}

export function getPlayer(id) {
    return players[id];
}

export function setPlayerVehicle(id, vehicleKey) {
    const player = players[id];
    if (!player) return null;

    player.vehicleKey = getVehicle(vehicleKey).key;
    return player;
}

export function getAllPlayers() {
    return players;
}

export function updatePlayer(id, data) {
    const player = players[id];
    if (!player) return null;

    player.x = data.x;
    player.y = data.y;
    player.angle = data.angle;
    return player;
}

export function removePlayer(id) {
    delete players[id];
}
