// spieler mit 10+ kills in folge leuchten gold. alle anderen sehen einen goldenen pfeil am bildrand,
// der zu ihm zeigt (nur wenn er gerade nicht im bild ist).

import { socket, EVENTS } from "../network.js";
import { GOLD_STREAK, VIEW_WIDTH, VIEW_HEIGHT } from "../config.js";

export class GoldStreak {
    constructor(scene, car, multiplayer) {
        this.scene = scene;
        this.car = car;
        this.multiplayer = multiplayer;
        this.goldIds = new Set();
        this.glows = {};    // id -> leuchtender kreis
        this.arrows = {};   // id -> pfeil am bildrand

        this.handlers = {
            [EVENTS.INIT]: (data) => this.onInit(data),
            [EVENTS.GOLD_CHANGED]: (data) => this.setGold(data.id, data.gold),
            [EVENTS.PLAYER_LEFT]: (data) => this.setGold(data.id, false),
        };

        for (const [event, handler] of Object.entries(this.handlers)) {
            socket.on(event, handler);
        }
        scene.events.once(Phaser.Scenes.Events.SHUTDOWN, () => this.destroy());
    }

    // wer schon beim beitritt gold ist
    onInit(data) {
        for (const player of Object.values(data.players)) {
            if (player.killStreak >= GOLD_STREAK.minStreak) this.setGold(player.id, true);
        }
    }

    setGold(id, gold) {
        if (gold) {
            this.goldIds.add(id);
            return;
        }
        this.goldIds.delete(id);
        this.glows[id]?.destroy();
        this.arrows[id]?.destroy();
        delete this.glows[id];
        delete this.arrows[id];
    }

    getCar(id) {
        return id === this.multiplayer.playerId ? this.car : this.multiplayer.remoteCars[id];
    }

    // wird jeden frame von der scene aufgerufen
    update(time) {
        for (const id of this.goldIds) {
            const car = this.getCar(id);
            if (!car) continue;

            this.updateGlow(id, car, time);
            if (car !== this.car) this.updateArrow(id, car);
        }
    }

    updateGlow(id, car, time) {
        if (!this.glows[id]) {
            this.glows[id] = this.scene.add.circle(car.x, car.y, 1, GOLD_STREAK.color)
                .setBlendMode(Phaser.BlendModes.ADD)
                .setDepth(GOLD_STREAK.glowDepth);
        }

        const pulse = (Math.sin(time / GOLD_STREAK.pulseSpeed * Math.PI) + 1) / 2;
        const { min, max } = GOLD_STREAK.glowAlpha;
        const glow = this.glows[id];
        glow.setPosition(car.x, car.y);
        glow.setRadius(Math.max(car.displayWidth, car.displayHeight) * GOLD_STREAK.glowScale);
        glow.setAlpha(Phaser.Math.Linear(min, max, pulse));
    }

    // pfeil am rand des bildschirms, zeigt zum goldenen spieler
    updateArrow(id, car) {
        if (!this.arrows[id]) {
            const size = GOLD_STREAK.arrowSize;
            this.arrows[id] = this.scene.add.triangle(0, 0, 0, -size / 2, size, 0, 0, size / 2, GOLD_STREAK.color)
                .setStrokeStyle(2, 0x000000)
                .setScrollFactor(0)
                .setDepth(GOLD_STREAK.arrowDepth);
        }

        const arrow = this.arrows[id];
        const view = this.scene.cameras.main.worldView;
        if (view.contains(car.x, car.y)) {
            arrow.setVisible(false);
            return;
        }

        // richtung von der bildmitte zum ziel, dann auf den bildrand (mit abstand) begrenzen
        const dx = car.x - view.centerX;
        const dy = car.y - view.centerY;
        const scale = Math.min(
            (VIEW_WIDTH / 2 - GOLD_STREAK.arrowMargin) / Math.abs(dx || 1e-6),
            (VIEW_HEIGHT / 2 - GOLD_STREAK.arrowMargin) / Math.abs(dy || 1e-6),
        );
        arrow.setVisible(true);
        arrow.setPosition(VIEW_WIDTH / 2 + dx * scale, VIEW_HEIGHT / 2 + dy * scale);
        arrow.setRotation(Math.atan2(dy, dx));
    }

    destroy() {
        for (const [event, handler] of Object.entries(this.handlers)) {
            socket.off(event, handler);
        }
        for (const id of [...this.goldIds]) this.setGold(id, false);
    }
}
