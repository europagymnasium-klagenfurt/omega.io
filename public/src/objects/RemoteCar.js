// auto eines anderen spielers. hat keine eigene physik, die position kommt vom server.

import { CAR } from "../config.js";
import { DEFAULT_VEHICLE_KEY } from "/shared/vehicles.js";

export class RemoteCar extends Phaser.GameObjects.Sprite {
    constructor(scene, player) {
        super(scene, player.x, player.y, player.vehicleKey || DEFAULT_VEHICLE_KEY);
        scene.add.existing(this);

        this.playerId = player.id;
        this.setVehicle(player.vehicleKey);
        this.setAngle(player.angle);
    }

    setVehicle(vehicleKey) {
        this.setTexture(vehicleKey || DEFAULT_VEHICLE_KEY);
        const scale = CAR.scale * CAR.referenceSize / Math.max(this.width, this.height);
        this.setScale(scale);
    }

    applyState(data) {
        this.setPosition(data.x, data.y);
        this.setAngle(data.angle);
    }
}
