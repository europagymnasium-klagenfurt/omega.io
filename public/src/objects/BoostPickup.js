// sichtbares speed-item mit statischem arcade-body

import { SPEED_BOOST } from "../config.js";

export class BoostPickup extends Phaser.Physics.Arcade.Image {
    constructor(scene) {
        super(scene, SPEED_BOOST.x, SPEED_BOOST.y, "speedBoost");
        this.setDisplaySize(SPEED_BOOST.size, SPEED_BOOST.size);
        scene.add.existing(this);
        scene.physics.add.existing(this, true);
    }
}