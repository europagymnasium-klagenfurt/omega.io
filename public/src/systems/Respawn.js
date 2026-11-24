// neustart nach dem tod: zeigt einen countdown und setzt das auto auf die position, die der server schickt.
// die lebenspunkte (und damit "wieder am leben") kommen über HEALTH_CHANGED, siehe PlayerHealth.

import { socket, EVENTS } from "../network.js";
import { RESPAWN, VIEW_WIDTH } from "../config.js";

export class Respawn {
    constructor(scene, car, multiplayer) {
        this.scene = scene;
        this.car = car;
        this.multiplayer = multiplayer;
        this.respawnAt = null;

        this.message = scene.add.text(VIEW_WIDTH / 2, RESPAWN.messageY, "", {
            color: "#ffffff",
            fontSize: `${RESPAWN.messageFontSize}px`,
            fontStyle: "bold",
            stroke: "#333333",
            strokeThickness: 6,
            align: "center",
        }).setOrigin(0.5).setScrollFactor(0).setDepth(RESPAWN.depth).setVisible(false);

        this.handlers = {
            [EVENTS.PLAYER_KILLED]: (data) => this.onKilled(data),
            [EVENTS.PLAYER_RESPAWNED]: (data) => this.onRespawned(data),
        };
        for (const [event, handler] of Object.entries(this.handlers)) {
            socket.on(event, handler);
        }
        scene.events.once(Phaser.Scenes.Events.SHUTDOWN, () => this.destroy());
    }

    onKilled(data) {
        if (data.victimId !== this.multiplayer.playerId) return;
        this.respawnAt = this.scene.time.now + RESPAWN.delay;
        this.message.setVisible(true);
    }

    onRespawned(data) {
        if (data.id === this.multiplayer.playerId) {
            this.car.body.reset(data.x, data.y);
            this.car.setAngle(data.angle);
            this.respawnAt = null;
            this.message.setVisible(false);
        } else {
            this.multiplayer.remoteCars[data.id]?.applyState(data);
        }
    }

    // wird jeden frame von der scene aufgerufen
    update() {
        if (this.respawnAt === null) return;
        const seconds = Math.max(1, Math.ceil((this.respawnAt - this.scene.time.now) / 1000));
        this.message.setText(`ZERSTÖRT\nNeustart in ${seconds}`);
    }

    destroy() {
        for (const [event, handler] of Object.entries(this.handlers)) {
            socket.off(event, handler);
        }
    }
}
