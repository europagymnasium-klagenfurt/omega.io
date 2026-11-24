// anzeige unten links: zeigt, ob die nächste mine bereit ist oder wie lange der cooldown noch dauert

import { MINE, MINE_HUD, VIEW_HEIGHT } from "../config.js";

export class MineCooldownHud {
    constructor(scene) {
        this.scene = scene;
        this.remaining = 0;   // millisekunden bis die nächste mine bereit ist

        this.container = scene.add.container(
            MINE_HUD.x,
            VIEW_HEIGHT - MINE_HUD.height - MINE_HUD.bottomMargin,
        ).setScrollFactor(0).setDepth(100);

        const background = scene.add.rectangle(0, 0, MINE_HUD.width, MINE_HUD.height, 0x101820, 0.88)
            .setOrigin(0)
            .setStrokeStyle(2, 0x4ec9f5, 0.9);
        this.label = scene.add.text(MINE_HUD.padding, MINE_HUD.padding - 2, "", {
            color: "#cfe4ff",
            fontSize: `${MINE_HUD.fontSize}px`,
            fontStyle: "bold",
        });
        this.bar = scene.add.rectangle(
            MINE_HUD.padding,
            MINE_HUD.height - MINE_HUD.padding - MINE_HUD.barHeight,
            MINE_HUD.width - MINE_HUD.padding * 2,
            MINE_HUD.barHeight,
            MINE_HUD.readyColor,
        ).setOrigin(0);
        this.container.add([background, this.label, this.bar]);
        this.draw();
    }

    // cooldown (neu) starten, ms = restzeit
    start(ms = MINE.cooldown) {
        this.remaining = ms;
    }

    update(delta) {
        if (this.remaining <= 0) return;
        this.remaining = Math.max(0, this.remaining - delta);
        this.draw();
    }

    // balken wächst, bis die mine wieder bereit ist
    draw() {
        const ready = this.remaining <= 0;
        const fullWidth = MINE_HUD.width - MINE_HUD.padding * 2;
        this.label.setText(ready ? "MINE BEREIT [STRG]" : `MINE: ${(this.remaining / 1000).toFixed(1)} s`);
        this.bar.setFillStyle(ready ? MINE_HUD.readyColor : MINE_HUD.cooldownColor);
        this.bar.width = ready ? fullWidth : fullWidth * (1 - this.remaining / MINE.cooldown);
    }
}
