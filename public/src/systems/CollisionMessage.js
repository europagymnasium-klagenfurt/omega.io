import { COLLISION_MESSAGE, VIEW_WIDTH, VIEW_HEIGHT } from "../config.js";

export class CollisionMessage {
    constructor(scene) {
        this.scene = scene;
        this.isShowing = false;
        this.text = scene.add.text(VIEW_WIDTH / 2, VIEW_HEIGHT / 2, "IDIOT", {
            fontFamily: "Arial Black, Arial, sans-serif",
            fontSize: `${COLLISION_MESSAGE.fontSize}px`,
            fontStyle: "bold",
            color: "#ff2020",
            stroke: "#ffffff",
            strokeThickness: 10,
            shadow: {
                offsetX: 4,
                offsetY: 4,
                color: "#000000",
                blur: 8,
                fill: true,
            },
        }).setOrigin(0.5).setScrollFactor(0).setDepth(1000).setAlpha(0);

        scene.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
            scene.tweens.killTweensOf(this.text);
            this.text.destroy();
        });
    }

    show() {
        if (this.isShowing) return;
        this.isShowing = true;
        this.text.setAlpha(1).setScale(0.2).setAngle(-8);

        this.scene.tweens.add({
            targets: this.text,
            scale: COLLISION_MESSAGE.popScale,
            angle: 0,
            duration: 220,
            ease: "Back.Out",
            onComplete: () => {
                this.scene.tweens.add({
                    targets: this.text,
                    alpha: 0,
                    delay: COLLISION_MESSAGE.fadeDelay,
                    duration: COLLISION_MESSAGE.fadeDuration,
                    ease: "Quad.In",
                    onComplete: () => {
                        this.isShowing = false;
                    },
                });
            },
        });
    }
}