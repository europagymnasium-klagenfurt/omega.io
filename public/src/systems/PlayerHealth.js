// lebenspunkte aller autos: übernimmt die werte vom server und zeigt sie im lebensbalken an.
// hat das eigene auto keine lebenspunkte mehr, bleibt es stehen und ist nicht mehr steuerbar.

import { socket, EVENTS } from "../network.js";

export class PlayerHealth {
    constructor(scene, car, multiplayer) {
        this.scene = scene;
        this.car = car;
        this.multiplayer = multiplayer;
        this.alive = true;

        this.handlers = {
            [EVENTS.INIT]: (data) => this.onInit(data),
            [EVENTS.HEALTH_CHANGED]: (data) => this.setHealth(data.id, data.health),
        };

        for (const [event, handler] of Object.entries(this.handlers)) {
            socket.on(event, handler);
        }
        scene.events.once(Phaser.Scenes.Events.SHUTDOWN, () => this.destroy());
    }

    // lebenspunkte aller spieler vom server übernehmen
    onInit(data) {
        for (const player of Object.values(data.players)) {
            if (player.health !== undefined) this.setHealth(player.id, player.health);
        }
    }

    setHealth(id, health) {
        if (id !== this.multiplayer.playerId) {
            this.multiplayer.remoteCars[id]?.healthBar.setHealth(health);
            return;
        }

        this.car.healthBar.setHealth(health);
        if (health <= 0 && this.alive) this.die();
    }

    // eigenes auto anhalten. body.moves = false: auch zusammenstöße schieben es nicht mehr weg
    die() {
        this.alive = false;
        this.car.setVelocity(0, 0);
        this.car.setAngularVelocity(0);
        this.car.body.moves = false;
    }

    isAlive() {
        return this.alive;
    }

    destroy() {
        for (const [event, handler] of Object.entries(this.handlers)) {
            socket.off(event, handler);
        }
    }
}
