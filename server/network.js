// alle socket.io events am server

import { EVENTS } from "../shared/events.js";
import { addPlayer, getAllPlayers, getPlayer, setPlayerVehicle, updatePlayer, removePlayer, damagePlayer } from "./players.js";
import { tryPlaceMine, removeMine, findTriggeredMine, getAllMines, getCooldownLeft, forgetPlayer } from "./mines.js";
import { SPEED_BOOST, MACHINE_GUN, MINE, getVehicleStats } from "../public/src/config.js";

let boostPickupClaimed = false;
let boostRespawnTimer = null;

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
                mines: getAllMines(),
                mineCooldownLeft: getCooldownLeft(id, Date.now()),
            });
            socket.broadcast.emit(EVENTS.PLAYER_JOINED, getPlayer(id));
        });

        socket.on(EVENTS.UPDATE, (data) => {
            const player = updatePlayer(id, data);
            if (player) {
                socket.broadcast.emit(EVENTS.PLAYER_MOVED, { id: id, x: player.x, y: player.y, angle: player.angle });

                // fährt der spieler auf eine fremde mine, explodiert sie
                const mine = findTriggeredMine(player);
                if (mine) {
                    removeMine(mine.id);
                    io.emit(EVENTS.MINE_REMOVED, { id: mine.id, exploded: true });
                    damagePlayer(player.id, MINE.damage);
                    io.emit(EVENTS.HEALTH_CHANGED, { id: player.id, health: player.health, maxHealth: player.maxHealth });
                }
            }
        });

        // mine legen (cooldown und position prüft der server)
        socket.on(EVENTS.MINE_PLACE, () => {
            const player = getPlayer(id);
            if (!player) return;

            const mine = tryPlaceMine(player, Date.now(), (expired) => {
                io.emit(EVENTS.MINE_REMOVED, { id: expired.id, exploded: false });
            });
            if (mine) io.emit(EVENTS.MINE_PLACED, mine);
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
            if (!shooter || !target || target.id === id || target.health <= 0) return;

            // nicht öfter treffen als geschossen werden kann (je nach fahrzeug unterschiedlich schnell)
            const stats = getVehicleStats(shooter.vehicleKey);
            const now = Date.now();
            if (now - lastHitTime < MACHINE_GUN.fireRate * stats.fireRate / 2) return;

            // ziel muss in schussweite sein
            const distance = Math.hypot(shooter.x - target.x, shooter.y - target.y);
            if (distance > MACHINE_GUN.range + MACHINE_GUN.hitTolerance) return;

            lastHitTime = now;
            damagePlayer(target.id, MACHINE_GUN.damage * stats.damage);
            io.emit(EVENTS.HEALTH_CHANGED, { id: target.id, health: target.health, maxHealth: target.maxHealth });
        });

        socket.on("disconnect", () => {
            console.log("user disconnected " + id);
            forgetPlayer(id);
            if (getPlayer(id)) {
                socket.broadcast.emit(EVENTS.PLAYER_LEFT, { id: id });
                removePlayer(id);
            }
        });
    });
}
