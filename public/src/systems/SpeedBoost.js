// verwaltet pickup, server-abstimmung und den lokalen boost

import { socket, EVENTS } from "../network.js";
import { SPEED_BOOST, VIEW_WIDTH } from "../config.js";
import { BoostPickup } from "../objects/BoostPickup.js";

export class SpeedBoost {
    constructor(scene, car) {
        this.scene = scene;
        this.car = car;
        this.pickup = new BoostPickup(scene);
        this.requestPending = false;
        this.taken = false;
        this.retryTimer = null;

        this.handlers = {
            [EVENTS.INIT]: (data) => this.onInit(data),
            [EVENTS.BOOST_PICKUP_TAKEN]: () => this.onTaken(),
            [EVENTS.BOOST_PICKUP_RESPAWNED]: () => this.onRespawn(),
            [EVENTS.BOOST_PICKUP_REJECTED]: () => this.onRejected(),
            [EVENTS.BOOST_GRANTED]: () => this.onBoostGranted(),
        };

        for (const [event, handler] of Object.entries(this.handlers)) {
            socket.on(event, handler);
        }

        this.overlap = scene.physics.add.overlap(car, this.pickup, () => this.requestPickup());
        scene.events.once(Phaser.Scenes.Events.SHUTDOWN, () => this.destroy());
    }

    requestPickup() {
        if (this.requestPending || !this.pickup.visible) return;

        this.requestPending = true;
        this.setAvailable(false);
        socket.emit(EVENTS.BOOST_PICKUP);
    }

    onInit(data) {
        this.taken = !data.boostAvailable;
        this.setAvailable(data.boostAvailable);
    }

    onTaken() {
        this.taken = true;
        this.retryTimer?.remove(false);
        this.spawnSmoke();
        this.setAvailable(false);
    }

    onRespawn() {
        this.taken = false;
        this.setAvailable(true);
    }

    onRejected() {
        this.requestPending = false;
        this.retryTimer = this.scene.time.delayedCall(SPEED_BOOST.retryDelay, () => {
            if (!this.taken) this.setAvailable(true);
        });
    }

    onBoostGranted() {
        this.car.activateSpeedBoost();

        const message = this.scene.add.text(VIEW_WIDTH / 2, SPEED_BOOST.messageY, "SUIP", {
            fontSize: SPEED_BOOST.messageFontSize,
            color: "#ffffff",
            stroke: "#333333",
            strokeThickness: 6,
        });
        message.setOrigin(0.5).setScrollFactor(0).setDepth(1000);
        this.scene.time.delayedCall(SPEED_BOOST.messageDuration, () => message.destroy());
    }

    spawnSmoke() {
        const emitter = this.scene.add.particles(this.pickup.x, this.pickup.y, "boostSmoke", {
            lifespan: SPEED_BOOST.smokeLifespan,
            speed: SPEED_BOOST.smokeSpeed,
            scale: SPEED_BOOST.smokeScale,
            alpha: SPEED_BOOST.smokeAlpha,
            emitting: false,
        });
        emitter.explode(SPEED_BOOST.smokeCount, this.pickup.x, this.pickup.y);
        this.scene.time.delayedCall(SPEED_BOOST.smokeLifespan, () => emitter.destroy());
    }

    setAvailable(available) {
        this.requestPending = false;
        this.pickup.setVisible(available);
        this.pickup.body.enable = available;
    }

    destroy() {
        for (const [event, handler] of Object.entries(this.handlers)) {
            socket.off(event, handler);
        }
        this.overlap.destroy();
        this.retryTimer?.remove(false);
        this.pickup.destroy();
    }
}