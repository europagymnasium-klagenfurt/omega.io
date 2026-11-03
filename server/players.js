// verwaltet alle spieler am server (nur daten, kein socket-code)

import { DEFAULT_VEHICLE_KEY, getVehicle } from "../shared/vehicles.js";
import { HEALTH_BAR, ARMOR } from "../public/src/config.js";

const COLORS = [0xff0000, 0x00ff00, 0x0000ff, 0xffff00, 0xff00ff, 0x00ffff];

const players = {};

export function addPlayer(id) {
    const n = Object.keys(players).length;   // anzahl der spieler
    const usedColors = new Set(Object.values(players).map((player) => player.color));
    let color = COLORS.find((candidate) => !usedColors.has(candidate));

    if (color === undefined) {
        do {
            color = Math.floor(Math.random() * 0x1000000);
        } while (usedColors.has(color));
    }

    players[id] = {
        id: id,
        x: 400 + n * 100,
        y: 300,
        angle: 0,
        vehicleKey: DEFAULT_VEHICLE_KEY,
        color: color,
        health: HEALTH_BAR.points,
        armor: ARMOR.default,
    };
    return players[id];
}

// lebenspunkte abziehen, die panzerung verringert den schaden (damage / armor).
// auf 3 kommastellen runden, sonst wird aus 5 - 0.1 - 0.1 ... z.b. 4.199999
export function damagePlayer(id, damage) {
    const player = players[id];
    if (!player) return null;

    const health = player.health - damage / player.armor;
    player.health = Math.max(0, Math.round(health * 1000) / 1000);
    return player;
}

export function getPlayer(id) {
    return players[id];
}

export function setPlayerVehicle(id, vehicleKey) {
    const player = players[id];
    if (!player) return null;

    player.vehicleKey = getVehicle(vehicleKey).key;
    player.armor = ARMOR[player.vehicleKey] ?? ARMOR.default;
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
