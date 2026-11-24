// eine mine am boden. sie ist nur ein bild, ausgelöst wird sie vom server.

import { MINE } from "../config.js";

export class Mine extends Phaser.GameObjects.Image {
    constructor(scene, data) {
        super(scene, data.x, data.y, "mine");
        scene.add.existing(this);

        this.mineId = data.id;
        this.setDepth(1);
    }

    // kurze explosion: ein oranger kreis wächst und verblasst
    explode() {
        const blast = this.scene.add.circle(this.x, this.y, MINE.size / 2, 0xff9900, 0.8).setDepth(12);
        this.scene.tweens.add({
            targets: blast,
            scale: MINE.explosionScale,
            alpha: 0,
            duration: MINE.explosionDuration,
            onComplete: () => blast.destroy(),
        });
    }
}
