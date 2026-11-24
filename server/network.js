// alle socket.io events am server

import { EVENTS } from "../shared/events.js";
import { setupRounds, isRunning, getRoundInfo, onPlayerJoined, playerDied, playerLeft, scheduleRespawn } from "./rounds.js";
import { addPlayer, setSpectator, getAllPlayers, getPlayer, setPlayerVehicle, updatePlayer, removePlayer, damagePlayer, recordKill, healPlayer } from "./players.js";
import { SPEED_BOOST, MACHINE_GUN, REPAIR_KIT, HEALTH_BAR, OBSTACLE_DAMAGE } from "../public/src/config.js";

let boostPickupClaimed = false;
let boostRespawnTimer = null;
const repairClaimed = REPAIR_KIT.positions.map(() => false);   // ist das kit gerade eingesammelt?

export function setupNetwork(io) {
    setupRounds(io);

    io.on("connection", (socket) => {
        console.log("a user connected " + socket.id);

        const id = socket.id;

        socket.on(EVENTS.READY, (data = {}) => {
            const isNew = !getPlayer(id);
            if (isNew) {
                addPlayer(id, data.name);
                if (isRunning()) {   // mitten in der runde: erst zusehen, dann starten
                    setSpectator(id);
                    scheduleRespawn(id);
                }
            }
            setPlayerVehicle(id, data.vehicleKey);
            socket.emit(EVENTS.INIT, {
                id: id,
                players: getAllPlayers(),
                boostAvailable: !boostPickupClaimed,
                round: getRoundInfo(),
                repairClaimed: repairClaimed,
            });
            socket.broadcast.emit(EVENTS.PLAYER_JOINED, getPlayer(id));
            if (isNew) onPlayerJoined();
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

        // reparatur-kit: server prüft abstand, lebenspunkte und ob das kit noch da ist
        socket.on(EVENTS.REPAIR_PICKUP, (data = {}) => {
            const index = data.index;
            const spot = REPAIR_KIT.positions[index];
            const player = getPlayer(id);
            const valid = spot && !repairClaimed[index] && player
                && player.health > 0 && player.health < HEALTH_BAR.points
                && Math.hypot(player.x - spot.x, player.y - spot.y) <= REPAIR_KIT.pickupRadius;
            if (!valid) {
                socket.emit(EVENTS.REPAIR_REJECTED, { index: index });
                return;
            }

            repairClaimed[index] = true;
            healPlayer(id, REPAIR_KIT.heal);
            io.emit(EVENTS.HEALTH_CHANGED, { id: id, health: player.health });
            io.emit(EVENTS.REPAIR_TAKEN, { index: index });
            setTimeout(() => {
                repairClaimed[index] = false;
                io.emit(EVENTS.REPAIR_RESPAWNED, { index: index });
            }, REPAIR_KIT.respawnDelay);
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
            if (!isRunning() || !shooter || !target || target.id === id || target.health <= 0 || shooter.health <= 0) return;

            // nicht öfter treffen als geschossen werden kann
            const now = Date.now();
            if (now - lastHitTime < MACHINE_GUN.fireRate / 2) return;

            // ziel muss in schussweite sein
            const distance = Math.hypot(shooter.x - target.x, shooter.y - target.y);
            if (distance > MACHINE_GUN.range + MACHINE_GUN.hitTolerance) return;

            lastHitTime = now;
            damagePlayer(target.id, MACHINE_GUN.damage);
            io.emit(EVENTS.HEALTH_CHANGED, { id: target.id, health: target.health });

            // keine lebenspunkte mehr: abschuss verbuchen und allen melden
            if (target.health <= 0) {
                const { killer, victim } = recordKill(shooter.id, target.id);
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

                // ausgeschieden: startet nach der wartezeit neu, ist nur noch einer übrig, ist die runde vorbei
                playerDied(target.id);
            }
        });

        // aufprall gegen ein hindernis: schaden mit abklingzeit, damit nicht jeder frame zählt
        let lastObstacleHitTime = 0;
        socket.on(EVENTS.OBSTACLE_HIT, () => {
            const player = getPlayer(id);
            if (!isRunning() || !player || player.health <= 0) return;

            const now = Date.now();
            if (now - lastObstacleHitTime < OBSTACLE_DAMAGE.cooldown) return;

            lastObstacleHitTime = now;
            damagePlayer(id, OBSTACLE_DAMAGE.damage);
            io.emit(EVENTS.HEALTH_CHANGED, { id: id, health: player.health });

            // am hindernis zerstört: als tod zählen (ohne gegner), im killfeed steht der name dann zweimal
            if (player.health <= 0) {
                player.deaths += 1;
                io.emit(EVENTS.PLAYER_KILLED, {
                    killerId: id,
                    killerName: player.name,
                    killerColor: player.color,
                    killerKills: player.kills,
                    victimId: id,
                    victimName: player.name,
                    victimColor: player.color,
                    victimDeaths: player.deaths,
                });

                // ausgeschieden (zuschauen übernimmt irgendeinen lebenden spieler)
                player.alive = false;
                playerDied(id);
            }
        });

        socket.on("disconnect", () => {
            console.log("user disconnected " + id);
            if (getPlayer(id)) {
                socket.broadcast.emit(EVENTS.PLAYER_LEFT, { id: id });
                removePlayer(id);
                playerLeft(id);
            }
        });
    });
}
