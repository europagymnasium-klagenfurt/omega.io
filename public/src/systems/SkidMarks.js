// bremsspuren: zeichnet dauerhafte reifenspuren hinter dem auto,
// wenn stark gebremst oder eine scharfe kurve gefahren wird.

import { SKID_MARKS } from "../config.js";

export class SkidMarks {
    constructor(scene, car) {
        this.scene = scene;
        this.car = car;
        this.graphics = scene.add.graphics().setDepth(SKID_MARKS.depth);
        this.graphics.fillStyle(SKID_MARKS.color, SKID_MARKS.alpha);
        this.pointCount = 0;
        this.lastPoint = null;

        scene.events.once(Phaser.Scenes.Events.SHUTDOWN, () => this.destroy());
    }

    // wird jeden frame von der scene aufgerufen
    update(cursors, isAlive) {
        if (!isAlive) return;

        const speed = Math.hypot(this.car.body.velocity.x, this.car.body.velocity.y);
        const isBraking = cursors.down.isDown && this.car.currentSpeed > SKID_MARKS.brakeSpeedThreshold;
        const isSharpTurn = (cursors.left.isDown || cursors.right.isDown) && speed > SKID_MARKS.turnSpeedThreshold;

        if (isBraking || isSharpTurn) this.emitMarks();
    }

    // zwei kreise (ein punkt pro hinterrad) an der aktuellen position fest einzeichnen
    emitMarks() {
        const forwardAngle = this.car.rotation - Math.PI / 2;
        const rearX = this.car.x - Math.cos(forwardAngle) * SKID_MARKS.rearOffset;
        const rearY = this.car.y - Math.sin(forwardAngle) * SKID_MARKS.rearOffset;

        if (this.lastPoint && Phaser.Math.Distance.Between(this.lastPoint.x, this.lastPoint.y, rearX, rearY) < SKID_MARKS.pointMinDistance) {
            return;
        }
        this.lastPoint = { x: rearX, y: rearY };

        const sideAngle = forwardAngle + Math.PI / 2;
        const sideX = Math.cos(sideAngle) * SKID_MARKS.wheelSpread / 2;
        const sideY = Math.sin(sideAngle) * SKID_MARKS.wheelSpread / 2;

        this.graphics.fillCircle(rearX - sideX, rearY - sideY, SKID_MARKS.width / 2);
        this.graphics.fillCircle(rearX + sideX, rearY + sideY, SKID_MARKS.width / 2);
        this.pointCount += 2;

        // irgendwann reicht es: sonst würde die zeichnung über eine lange spielzeit immer größer werden
        if (this.pointCount > SKID_MARKS.maxPoints) {
            this.graphics.clear();
            this.graphics.fillStyle(SKID_MARKS.color, SKID_MARKS.alpha);
            this.pointCount = 0;
        }
    }

    destroy() {
        this.graphics.destroy();
    }
}
