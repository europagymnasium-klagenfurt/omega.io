// alle socket.io events am server

import { EVENTS } from "../shared/events.js";
import { addPlayer, getAllPlayers, getPlayer, setPlayerVehicle, updatePlayer, removePlayer, damagePlayer, damagePlayerFlat, recordKill, respawnPlayer } from "./players.js";
import { SPEED_BOOST, MACHINE_GUN, ROCKET, RESPAWN } from "../public/src/config.js";

let boostPickupClaimed = false;
let boostRespawnTimer = null;
// ein eintrag pro ROCKET.pickupPositions: ob es grade eingesammelt ist und der respawn-timer dafür
const rocketPickups = ROCKET.pickupPositions.map(() => ({ claimed: false, timer: null }));
const respawnTimers = {};   // spieler-id -> timer bis zum neustart nach dem tod

// schaden wurde bereits abgezogen: lebenspunkte verteilen, bei "tot" den kill verbuchen und später respawnen.
// von HIT (maschinengewehr) und ROCKET_HIT gemeinsam genutzt, damit die logik nicht doppelt existiert.
function handleDamageResult(io, shooterId, target) {
    io.emit(EVENTS.HEALTH_CHANGED, { id: target.id, health: target.health });
    if (target.health > 0) return;

    const { killer, victim } = recordKill(shooterId, target.id);
    io.emit(EVENTS.PLAYER_KILLED, {
        killerId: killer.id,
        killerName: killer.name,
        killerColor: killer.color,
        killerKills: killer.kills,
        victimId: victim.id,
        victimName: victim.name,
        victimColor: victim.color,
        victimDeaths: victim.deaths,
    });

    // nach kurzer zeit neu starten (wenn der spieler dann noch da ist)
    respawnTimers[target.id] = setTimeout(() => {
        delete respawnTimers[target.id];
        const player = respawnPlayer(target.id);
        if (!player) return;
        io.emit(EVENTS.HEALTH_CHANGED, { id: player.id, health: player.health });
        io.emit(EVENTS.PLAYER_RESPAWNED, { id: player.id, x: player.x, y: player.y, angle: player.angle, health: player.health });
    }, RESPAWN.delay);
}

export function setupNetwork(io) {
    io.on("connection", (socket) => {
        console.log("a user connected " + socket.id);

        const id = socket.id;

        socket.on(EVENTS.READY, (data = {}) => {
            if (!getPlayer(id)) addPlayer(id, data.name);
            setPlayerVehicle(id, data.vehicleKey);
            socket.emit(EVENTS.INIT, {
                id: id,
                players: getAllPlayers(),
                boostAvailable: !boostPickupClaimed,
                rocketPickupsTaken: rocketPickups
                    .map((pickup, index) => (pickup.claimed ? index : null))
                    .filter((index) => index !== null),
            });
            socket.broadcast.emit(EVENTS.PLAYER_JOINED, getPlayer(id));
        });

        socket.on(EVENTS.UPDATE, (data) => {
            const player = updatePlayer(id, data);
            if (player) {
                socket.broadcast.emit(EVENTS.PLAYER_MOVED, { id: id, x: player.x, y: player.y, angle: player.angle });
            }
        });

        socket.on(EVENTS.BOOST_PICKUP, () => {
            if (boostPickupClaimed) return;

            const player = getPlayer(id);
            if (!player || Math.hypot(player.x - SPEED_BOOST.x, player.y - SPEED_BOOST.y) > SPEED_BOOST.pickupRadius) {
                socket.emit(EVENTS.BOOST_PICKUP_REJECTED);
                return;
            }

            boostPickupClaimed = true;
            io.emit(EVENTS.BOOST_PICKUP_TAKEN);
            socket.emit(EVENTS.BOOST_GRANTED);
            boostRespawnTimer = setTimeout(() => {
                boostPickupClaimed = false;
                boostRespawnTimer = null;
                io.emit(EVENTS.BOOST_PICKUP_RESPAWNED);
            }, SPEED_BOOST.respawnDelay);
        });

        // schuss an alle anderen weitergeben
        socket.on(EVENTS.SHOOT, (data = {}) => {
            if (!getPlayer(id)) return;
            socket.broadcast.emit(EVENTS.SHOT_FIRED, { id: id, x: data.x, y: data.y, vx: data.vx, vy: data.vy });
        });

        // treffer prüfen, lebenspunkte abziehen und allen die neuen werte schicken
        let lastHitTime = 0;
        socket.on(EVENTS.HIT, (data = {}) => {
            const shooter = getPlayer(id);
            const target = getPlayer(data.targetId);
            if (!shooter || !target || target.id === id || target.health <= 0 || shooter.health <= 0) return;

            // nicht öfter treffen als geschossen werden kann
            const now = Date.now();
            if (now - lastHitTime < MACHINE_GUN.fireRate / 2) return;

            // ziel muss in schussweite sein
            const distance = Math.hypot(shooter.x - target.x, shooter.y - target.y);
            if (distance > MACHINE_GUN.range + MACHINE_GUN.hitTolerance) return;

            lastHitTime = now;
            damagePlayer(target.id, MACHINE_GUN.damage);
            handleDamageResult(io, shooter.id, target);
        });

        // raketen-item einsammeln: nur möglich, wenn es gerade verfügbar und man nahe genug dran ist
        socket.on(EVENTS.ROCKET_PICKUP, (data = {}) => {
            const pickupId = data.pickupId;
            const pickup = rocketPickups[pickupId];
            const position = ROCKET.pickupPositions[pickupId];
            if (!pickup || !position || pickup.claimed) {
                socket.emit(EVENTS.ROCKET_PICKUP_REJECTED, { pickupId });
                return;
            }

            const player = getPlayer(id);
            if (!player || Math.hypot(player.x - position.x, player.y - position.y) > ROCKET.pickupRadius) {
                socket.emit(EVENTS.ROCKET_PICKUP_REJECTED, { pickupId });
                return;
            }

            pickup.claimed = true;
            io.emit(EVENTS.ROCKET_PICKUP_TAKEN, { pickupId });
            socket.emit(EVENTS.ROCKET_GRANTED);
            pickup.timer = setTimeout(() => {
                pickup.claimed = false;
                pickup.timer = null;
                io.emit(EVENTS.ROCKET_PICKUP_RESPAWNED, { pickupId });
            }, ROCKET.respawnDelay);
        });

        // raketenabschuss an alle anderen weitergeben, damit sie die rakete mitverfolgen können
        socket.on(EVENTS.ROCKET_FIRE, (data = {}) => {
            if (!getPlayer(id)) return;
            socket.broadcast.emit(EVENTS.ROCKET_FIRED, { id, x: data.x, y: data.y, angle: data.angle, targetId: data.targetId });
        });

        // raketentreffer prüfen: zieht 25% der maximalen lebenspunkte ab (siehe damagePlayerFlat)
        let lastRocketHitTime = 0;
        socket.on(EVENTS.ROCKET_HIT, (data = {}) => {
            const shooter = getPlayer(id);
            const target = getPlayer(data.targetId);
            if (!shooter || !target || target.id === id || target.health <= 0 || shooter.health <= 0) return;

            const now = Date.now();
            if (now - lastRocketHitTime < 300) return;   // raketen treffen nicht mehrfach pro bruchteil einer sekunde

            const distance = Math.hypot(shooter.x - target.x, shooter.y - target.y);
            if (distance > ROCKET.lockRange + ROCKET.hitTolerance) return;

            lastRocketHitTime = now;
            damagePlayerFlat(target.id, ROCKET.damageFraction);
            handleDamageResult(io, shooter.id, target);
        });

        socket.on("disconnect", () => {
            console.log("user disconnected " + id);
            clearTimeout(respawnTimers[id]);
            delete respawnTimers[id];
            if (getPlayer(id)) {
                socket.broadcast.emit(EVENTS.PLAYER_LEFT, { id: id });
                removePlayer(id);
            }
        });
    });
}
