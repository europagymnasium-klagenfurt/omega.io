// zeigt die umriss-hitboxen aller autos, hindernisse und des items. mit einer taste ein- und ausblenden.

import { DEBUG, HITBOX } from "../config.js";
import { getWorldShape } from "./HitboxShapes.js";

export class HitboxDebug {
    constructor(scene) {
        this.scene = scene;
        this.visible = DEBUG;
        this.graphics = scene.add.graphics().setDepth(HITBOX.debugDepth);

        scene.input.keyboard.on(`keydown-${HITBOX.toggleKey}`, () => {
            this.visible = !this.visible;
            if (!this.visible) this.graphics.clear();
        });
        scene.events.on(Phaser.Scenes.Events.POST_UPDATE, this.draw, this);
        scene.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
            scene.events.off(Phaser.Scenes.Events.POST_UPDATE, this.draw, this);
        });
    }

    draw() {
        if (!this.visible) return;
        const scene = this.scene;
        this.graphics.clear();

        for (const obstacle of scene.obstacleField?.group.getChildren() ?? []) {
            this.drawSprite(obstacle, HITBOX.colors.obstacle);
        }
        const pickup = scene.speedBoost?.pickup;
        if (pickup?.visible) this.drawSprite(pickup, HITBOX.colors.pickup);
        for (const remoteCar of Object.values(scene.multiplayer?.remoteCars ?? {})) {
            this.drawSprite(remoteCar, HITBOX.colors.remoteCar);
        }
        if (scene.car?.visible) this.drawSprite(scene.car, HITBOX.colors.car);
    }

    drawSprite(sprite, color) {
        this.graphics.lineStyle(HITBOX.debugLineWidth, color, 1);
        for (const points of getWorldShape(sprite).polygons) {
            this.graphics.beginPath();
            this.graphics.moveTo(points[0], points[1]);
            for (let i = 2; i < points.length; i += 2) this.graphics.lineTo(points[i], points[i + 1]);
            this.graphics.closePath();
            this.graphics.strokePath();
        }
    }
}
