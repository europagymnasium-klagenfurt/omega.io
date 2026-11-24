// ein einsammelbares raketen-item mit statischem arcade-body.
// es gibt mehrere auf der karte (siehe ROCKET.pickupPositions), jedes mit eigener nummer (pickupId).

import { ROCKET } from "../config.js";

export class RocketPickup extends Phaser.Physics.Arcade.Image {
    constructor(scene, pickupId, position) {
        super(scene, position.x, position.y, "rocket");
        this.pickupId = pickupId;
        this.setDisplaySize(ROCKET.pickupSize, ROCKET.pickupSize);
        scene.add.existing(this);
        scene.physics.add.existing(this, true);
    }
}
