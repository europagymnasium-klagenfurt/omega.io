// treffer-feedback: wird das EIGENE auto getroffen, blitzt der bildschirm kurz rot auf und die kamera wackelt.
// erkannt wird der treffer an sinkenden lebenspunkten in HEALTH_CHANGED.

import { socket, EVENTS } from "../network.js";
import { HIT_FEEDBACK, HEALTH_BAR, VIEW_WIDTH, VIEW_HEIGHT } from "../config.js";

export class HitFeedback {
    constructor(scene, multiplayer) {
        this.scene = scene;
        this.multiplayer = multiplayer;
        this.lastHealth = HEALTH_BAR.points;

        this.flash = scene.add.rectangle(0, 0, VIEW_WIDTH, VIEW_HEIGHT, HIT_FEEDBACK.flashColor, 1)
            .setOrigin(0).setScrollFactor(0).setDepth(HIT_FEEDBACK.depth).setAlpha(0);

        this.handlers = {
            [EVENTS.INIT]: (data) => this.lastHealth = data.players[data.id]?.health ?? HEALTH_BAR.points,
            [EVENTS.HEALTH_CHANGED]: (data) => this.onHealthChanged(data),
        };
        for (const [event, handler] of Object.entries(this.handlers)) {
            socket.on(event, handler);
        }
        scene.events.once(Phaser.Scenes.Events.SHUTDOWN, () => this.destroy());
    }

    onHealthChanged(data) {
        if (data.id !== this.multiplayer.playerId) return;

        const lost = data.health < this.lastHealth;
        this.lastHealth = data.health;
        if (!lost) return;

        this.scene.tweens.killTweensOf(this.flash);
        this.flash.setAlpha(HIT_FEEDBACK.flashAlpha);
        this.scene.tweens.add({ targets: this.flash, alpha: 0, duration: HIT_FEEDBACK.flashDuration });

        const dead = data.health <= 0;
        this.scene.cameras.main.shake(
            dead ? HIT_FEEDBACK.deathShakeDuration : HIT_FEEDBACK.shakeDuration,
            dead ? HIT_FEEDBACK.deathShakeIntensity : HIT_FEEDBACK.shakeIntensity,
        );
    }

    destroy() {
        for (const [event, handler] of Object.entries(this.handlers)) {
            socket.off(event, handler);
        }
    }
}
