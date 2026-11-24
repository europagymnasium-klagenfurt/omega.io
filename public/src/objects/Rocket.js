// eine abgeschossene rakete: fliegt in richtung ihres ziels und lenkt dabei nur allmählich ein
// (kein sofortiges einrasten), damit man ihr ausweichen kann. ohne ziel fliegt sie einfach geradeaus.

import { ROCKET } from "../config.js";

export class Rocket extends Phaser.Physics.Arcade.Sprite {
    // ownerId: id des schützen, null = eigene rakete. targetId: wen sie verfolgt (kann null sein).
    constructor(scene, x, y, angle, ownerId = null, targetId = null) {
        super(scene, x, y, "rocket");
        scene.add.existing(this);
        scene.physics.add.existing(this);

        this.ownerId = ownerId;
        this.targetId = targetId;
        this.lifetime = ROCKET.lifespan;
        this.setDepth(6);
        this.setRotation(angle + Math.PI / 2);   // das bild zeigt nach oben
        this.scene.physics.velocityFromRotation(angle, ROCKET.speed, this.body.velocity);
    }

    // dreht die flugrichtung schrittweise auf das ziel zu, ohne die geschwindigkeit zu ändern
    steerTo(targetX, targetY, delta) {
        const currentAngle = this.body.velocity.angle();
        const desiredAngle = Phaser.Math.Angle.Between(this.x, this.y, targetX, targetY);
        const maxStep = Phaser.Math.DegToRad(ROCKET.turnRate) * (delta / 1000);
        const newAngle = Phaser.Math.Angle.RotateTo(currentAngle, desiredAngle, maxStep);

        this.scene.physics.velocityFromRotation(newAngle, ROCKET.speed, this.body.velocity);
        this.setRotation(newAngle + Math.PI / 2);
    }

    preUpdate(time, delta) {
        super.preUpdate(time, delta);
        this.lifetime -= delta;
        if (this.lifetime <= 0) this.destroy();
    }
}
