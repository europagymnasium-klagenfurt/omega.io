// raketenwerfer: taste 1 verschießt eine rakete aus dem inventar auf das nächste gegnerische auto in reichweite.
// die rakete lenkt sich danach jeden frame etwas weiter auf ihr (bewegliches) ziel ein, siehe Rocket.steerTo().
// trifft eine EIGENE rakete ein anderes auto, meldet das der client dem server (ROCKET_HIT).
// der server zieht 25% der maximalen lebenspunkte ab und schickt HEALTH_CHANGED an alle (siehe PlayerHealth).

import { socket, EVENTS } from "../network.js";
import { ROCKET } from "../config.js";
import { Rocket } from "../objects/Rocket.js";

export class RocketLauncher {
    constructor(scene, car, multiplayer, playerHealth, rocketPickupField, obstacleField) {
        this.scene = scene;
        this.car = car;
        this.multiplayer = multiplayer;
        this.playerHealth = playerHealth;
        this.rocketPickupField = rocketPickupField;
        this.rockets = scene.physics.add.group();   // alle raketen (eigene und fremde)

        this.fireKey = scene.input.keyboard.addKey(ROCKET.fireKey);
        this.fireKey.on("down", () => this.fire());

        // raketen bleiben an hindernissen stecken, statt durchzufliegen
        this.obstacleCollider = scene.physics.add.collider(this.rockets, obstacleField.group, (a, b) => {
            const rocket = a instanceof Rocket ? a : b;
            rocket.destroy();
        });

        this.handlers = {
            [EVENTS.ROCKET_FIRED]: (data) => this.spawnRocket(data.x, data.y, data.angle, data.id, data.targetId),
        };
        for (const [event, handler] of Object.entries(this.handlers)) {
            socket.on(event, handler);
        }
        scene.events.once(Phaser.Scenes.Events.SHUTDOWN, () => this.destroy());
    }

    // wird jeden frame von der scene aufgerufen
    update(delta) {
        this.steerRockets(delta);
        this.checkHits();
    }

    fire() {
        if (!this.playerHealth.isAlive() || !this.rocketPickupField.useAmmo()) return;

        const target = this.findTarget();
        const angle = this.car.rotation - Math.PI / 2;   // das bild zeigt nach oben, phaser rechnet ab "rechts"
        const distance = this.car.displayHeight / 2 + ROCKET.muzzleOffset;
        const x = this.car.x + Math.cos(angle) * distance;
        const y = this.car.y + Math.sin(angle) * distance;
        const targetId = target?.playerId ?? null;

        this.spawnRocket(x, y, angle, null, targetId);
        socket.emit(EVENTS.ROCKET_FIRE, { x, y, angle, targetId });
    }

    // nächstes gegnerisches auto innerhalb von ROCKET.lockRange suchen
    findTarget() {
        let closest = null;
        let closestDistance = ROCKET.lockRange;

        for (const remoteCar of Object.values(this.multiplayer.remoteCars)) {
            const distance = Phaser.Math.Distance.Between(this.car.x, this.car.y, remoteCar.x, remoteCar.y);
            if (distance <= closestDistance) {
                closest = remoteCar;
                closestDistance = distance;
            }
        }
        return closest;
    }

    spawnRocket(x, y, angle, ownerId = null, targetId = null) {
        const rocket = new Rocket(this.scene, x, y, angle, ownerId, targetId);
        this.rockets.add(rocket);
    }

    // jede rakete ein stück weiter in richtung ihres (ggf. inzwischen bewegten) ziels einlenken lassen
    steerRockets(delta) {
        for (const rocket of this.rockets.getChildren()) {
            const target = this.resolveTarget(rocket.targetId);
            if (target) rocket.steerTo(target.x, target.y, delta);
        }
    }

    // targetId -> das zugehörige auto (eigenes auto, ein remote-auto oder nichts mehr, falls der spieler weg ist)
    resolveTarget(targetId) {
        if (targetId === null) return null;
        if (targetId === this.multiplayer.playerId) return this.car;
        return this.multiplayer.remoteCars[targetId] ?? null;
    }

    checkHits() {
        // fremde raketen, die das eigene auto treffen, nur verschwinden lassen. den treffer meldet der schütze selbst.
        this.scene.physics.overlap(this.car, this.rockets, (a, b) => {
            const rocket = a instanceof Rocket ? a : b;
            if (rocket.ownerId !== null) rocket.destroy();
        });

        for (const remoteCar of Object.values(this.multiplayer.remoteCars)) {
            this.scene.physics.overlap(remoteCar, this.rockets, (a, b) => {
                const rocket = a instanceof Rocket ? a : b;
                if (rocket.ownerId === remoteCar.playerId) return;   // eigenes auto trifft man nicht

                if (rocket.ownerId === null) socket.emit(EVENTS.ROCKET_HIT, { targetId: remoteCar.playerId });
                rocket.destroy();
            });
        }
    }

    destroy() {
        for (const [event, handler] of Object.entries(this.handlers)) {
            socket.off(event, handler);
        }
        this.fireKey.removeAllListeners();
        this.scene.input.keyboard?.removeKey(this.fireKey);
        this.obstacleCollider.destroy();
    }
}
