// auto eines anderen spielers. hat keine eigene physik, die position kommt vom server.

import { CAR } from "../config.js";
import { HealthBar } from "./HealthBar.js";

export class RemoteCar extends Phaser.Physics.Arcade.Sprite {
    constructor(scene, player) {
        super(scene, player.x, player.y, "car");
        scene.add.existing(this);
        scene.physics.add.existing(this);

        this.playerId = player.id;
        this.setScale(CAR.scale);
        this.setAngle(player.angle);
        this.setTint(player.color);
        this.setCircle(CAR.hitbox.radius, CAR.hitbox.offsetX, CAR.hitbox.offsetY);
        this.setImmovable(true);
        this.healthBar = new HealthBar(scene, this);
    }

    preUpdate(time, delta) {
        super.preUpdate(time, delta);
        this.healthBar.updatePosition();
    }

    destroy(fromScene) {
        this.healthBar.destroy();
        super.destroy(fromScene);
    }

    applyState(data) {
        this.setPosition(data.x, data.y);
        this.setAngle(data.angle);
    }
}
