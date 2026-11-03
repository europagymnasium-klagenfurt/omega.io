// ein schuss vom maschinengewehr: fliegt gerade aus und verschwindet nach MACHINE_GUN.range pixeln (vom auto aus gesehen)

import { MACHINE_GUN } from "../config.js";

export class Bullet extends Phaser.Physics.Arcade.Sprite {
    // ownerId: id des schützen, null = eigener schuss
    constructor(scene, x, y, ownerId = null) {
        super(scene, x, y, "bullet");
        scene.add.existing(this);
        scene.physics.add.existing(this);

        this.ownerId = ownerId;
        this.lifetime = MACHINE_GUN.range / MACHINE_GUN.bulletSpeed * 1000;   // millisekunden bis er verschwindet
        this.setDepth(5);
    }

    // erst aufrufen, NACHDEM der schuss in eine physics-group gelegt wurde,
    // weil die group beim hinzufügen die geschwindigkeit auf 0 zurücksetzt
    fire(velocityX, velocityY) {
        this.body.velocity.set(velocityX, velocityY);
    }

    preUpdate(time, delta) {
        super.preUpdate(time, delta);
        this.lifetime -= delta;
        if (this.lifetime <= 0) this.destroy();
    }
}
