// verwaltet alle spieler am server (nur daten, kein socket-code)

import { DEFAULT_VEHICLE_KEY, getVehicle } from "../shared/vehicles.js";
import { getVehicleStats, PLAYER_NAME, OBSTACLES } from "../public/src/config.js";

const COLORS = [0xff0000, 0x00ff00, 0x0000ff, 0xffff00, 0xff00ff, 0x00ffff];

const players = {};

export function addPlayer(id, requestedName) {
    const n = Object.keys(players).length;   // anzahl der spieler
    const name = typeof requestedName === "string"
        ? requestedName.trim().replace(/\s+/g, " ").slice(0, PLAYER_NAME.maxLength)
        : "";
    const usedColors = new Set(Object.values(players).map((player) => player.color));
    let color = COLORS.find((candidate) => !usedColors.has(candidate));

    if (color === undefined) {
        do {
            color = Math.floor(Math.random() * 0x1000000);
        } while (usedColors.has(color));
    }

    players[id] = {
        id: id,
        name: name || `Spieler ${n + 1}`,
        x: 400 + n * 100,
        y: 300,
        angle: 0,
        vehicleKey: DEFAULT_VEHICLE_KEY,
        color: color,
        health: getVehicleStats(DEFAULT_VEHICLE_KEY).health,
        maxHealth: getVehicleStats(DEFAULT_VEHICLE_KEY).health,
        kills: 0,
        deaths: 0,
        alive: true,   // false = ausgeschieden, bis die nächste runde beginnt
    };
    return players[id];
}

// lebenspunkte abziehen.
// auf 3 kommastellen runden, sonst wird aus 5 - 0.1 - 0.1 ... z.b. 4.199999
export function damagePlayer(id, damage) {
    const player = players[id];
    if (!player) return null;

    const health = player.health - damage;
    player.health = Math.max(0, Math.round(health * 1000) / 1000);
    return player;
}

// abschuss verbuchen: der schütze bekommt einen kill, das opfer einen tod
export function recordKill(killerId, victimId) {
    const killer = players[killerId];
    const victim = players[victimId];
    if (!killer || !victim) return null;

    killer.kills += 1;
    victim.deaths += 1;
    victim.alive = false;
    return { killer, victim };
}

// zerstörtes auto neu starten: volle lebenspunkte, zufälliger startplatz aus der freien startreihe
// (dort stehen garantiert keine hindernisse, siehe OBSTACLES.spawn)
export function respawnPlayer(id, slot = Math.floor(Math.random() * OBSTACLES.spawn.count)) {
    const player = players[id];
    if (!player) return null;

    const spawn = OBSTACLES.spawn;
    player.x = spawn.x + (slot % spawn.count) * spawn.spacing;
    player.y = spawn.y;
    player.angle = 0;
    player.health = player.maxHealth;
    player.alive = true;
    return player;
}

// spieler, der mitten in einer runde dazukommt: sieht zu, bis die nächste runde beginnt
export function setSpectator(id) {
    const player = players[id];
    if (!player) return null;

    player.alive = false;
    player.health = 0;
    return player;
}

// lebenspunkte zurückgeben (höchstens bis zum maximum), gerundet wie beim schaden
export function healPlayer(id, amount) {
    const player = players[id];
    if (!player) return null;

    const health = Math.min(player.maxHealth, player.health + amount);
    player.health = Math.round(health * 1000) / 1000;
    return player;
}

export function getPlayer(id) {
    return players[id];
}

export function setPlayerVehicle(id, vehicleKey) {
    const player = players[id];
    if (!player) return null;

    player.vehicleKey = getVehicle(vehicleKey).key;

    // maximale lebenspunkte des fahrzeugs, der anteil an lebenspunkten bleibt gleich
    const maxHealth = getVehicleStats(player.vehicleKey).health;
    player.health = Math.round(player.health / player.maxHealth * maxHealth * 1000) / 1000;
    player.maxHealth = maxHealth;
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
