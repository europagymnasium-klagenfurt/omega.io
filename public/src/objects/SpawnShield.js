// spawnschutz-blase: hellblaue, transparente blase um ein auto für kurze zeit nach dem spawnen.
// zeigt nur die optik. ob wirklich kein schaden entsteht, prüft der server (siehe server/players.js, server/network.js).

import { SPAWN_SHIELD } from "../config.js";

export class SpawnShield {
    constructor(scene, car, durationMs = SPAWN_SHIELD.duration) {
        this.scene = scene;
        this.car = car;

        const radius = Math.max(car.displayWidth, car.displayHeight) / 2 + SPAWN_SHIELD.radiusPadding;
        this.bubble = scene.add.circle(car.x, car.y, radius, SPAWN_SHIELD.color, SPAWN_SHIELD.fillAlpha);
        this.bubble.setStrokeStyle(SPAWN_SHIELD.borderWidth, SPAWN_SHIELD.borderColor, SPAWN_SHIELD.borderAlpha);
        this.bubble.setDepth(6);

        this.pulseTween = scene.tweens.add({
            targets: this.bubble,
            scale: 1 + SPAWN_SHIELD.pulseScale,
            duration: SPAWN_SHIELD.pulseDuration,
            yoyo: true,
            repeat: -1,
            ease: "Sine.InOut",
        });

        this.fadeTimer = scene.time.delayedCall(
            Math.max(0, durationMs - SPAWN_SHIELD.fadeDuration),
            () => this.fadeOut(),
        );
    }

    fadeOut() {
        if (!this.bubble) return;
        this.pulseTween.stop();
        this.scene.tweens.add({
            targets: this.bubble,
            alpha: 0,
            duration: SPAWN_SHIELD.fadeDuration,
            ease: "Sine.In",
            onComplete: () => this.destroy(),
        });
    }

    // wird jeden frame von PlayerCar/RemoteCar aufgerufen, damit die blase am auto bleibt
    updatePosition() {
        if (!this.bubble) return;
        this.bubble.setPosition(this.car.x, this.car.y);
    }

    destroy() {
        this.pulseTween?.stop();
        this.fadeTimer?.remove();
        this.bubble?.destroy();
        this.bubble = null;
    }
}
