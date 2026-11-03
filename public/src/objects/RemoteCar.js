// auto eines anderen spielers. hat keine eigene physik, die position kommt vom server.

import { CAR } from "../config.js";
import { DEFAULT_VEHICLE_KEY } from "/shared/vehicles.js";
import { HealthBar } from "./HealthBar.js";

export class RemoteCar extends Phaser.Physics.Arcade.Sprite {
    constructor(scene, player) {
        super(scene, player.x, player.y, player.vehicleKey || DEFAULT_VEHICLE_KEY);
        scene.add.existing(this);
        scene.physics.add.existing(this);

        this.playerId = player.id;
        this.setVehicle(player.vehicleKey);
        this.setAngle(player.angle);
        this.setTint(player.color);
        this.setImmovable(true);
        this.healthBar = new HealthBar(scene, this);
    }

    setVehicle(vehicleKey) {
        this.setTexture(vehicleKey || DEFAULT_VEHICLE_KEY);
        const scale = CAR.scale * CAR.referenceSize / Math.max(this.width, this.height);
        this.setScale(scale);
        const radius = Math.min(this.width, this.height) * CAR.hitbox.widthRatio / 2;
        const offsetX = (this.width - radius * 2) / 2;
        const offsetY = (this.height - radius * 2) / 2;
        this.setCircle(radius, offsetX, offsetY);
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
