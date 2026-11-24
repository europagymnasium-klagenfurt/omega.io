// eine garage in der welt (von oben gesehen): dach, rolltor, lampen, hinweisstreifen und leuchtschild.
// das auto kann einfahren und verschwindet dabei unter dem dach.

import { GARAGES } from "../config.js";

export class Garage {
    constructor(scene, data) {
        this.name = data.name;
        this.x = data.x;
        this.y = data.y;

        const w = GARAGES.width;
        const h = GARAGES.height;
        const left = this.x - w / 2;
        const top = this.y - h / 2;
        const bottom = this.y + h / 2;

        const g = scene.add.graphics().setDepth(1);

        // schatten
        g.fillStyle(0x000000, 0.3);
        g.fillRoundedRect(left + 8, top + 10, w, h, 10);

        // dach: obere hälfte heller, untere dunkler, dazwischen der first
        g.fillStyle(0x7a8791, 1);
        g.fillRoundedRect(left, top, w, h / 2 + 2, { tl: 10, tr: 10, bl: 0, br: 0 });
        g.fillStyle(0x56626c, 1);
        g.fillRoundedRect(left, this.y, w, h / 2, { tl: 0, tr: 0, bl: 10, br: 10 });
        g.fillStyle(0x9aa7b1, 1);
        g.fillRect(left, this.y - 3, w, 6);

        // dachbleche
        g.lineStyle(2, 0x000000, 0.18);
        for (let px = left + 24; px < left + w - 4; px += 24) {
            g.lineBetween(px, top + 4, px, bottom - 4);
        }

        // rand
        g.lineStyle(5, 0x2b343b, 1);
        g.strokeRoundedRect(left, top, w, h, 10);

        // lüfter auf dem dach
        for (const vx of [left + 44, left + w - 44]) {
            g.fillStyle(0x2b343b, 1);
            g.fillCircle(vx, top + 32, 13);
            g.fillStyle(0x9aa7b1, 1);
            g.fillCircle(vx, top + 32, 9);
            g.lineStyle(2, 0x2b343b, 1);
            g.lineBetween(vx - 8, top + 32, vx + 8, top + 32);
            g.lineBetween(vx, top + 24, vx, top + 40);
        }

        // rolltor am unteren rand: orange mit lamellen
        const doorW = GARAGES.doorWidth;
        const doorH = GARAGES.doorHeight;
        const doorX = this.x - doorW / 2;
        const doorY = bottom - doorH - 4;
        g.fillStyle(0x1b222a, 1);
        g.fillRect(doorX - 4, doorY - 4, doorW + 8, doorH + 8);
        g.fillStyle(0xf59a2f, 1);
        g.fillRect(doorX, doorY, doorW, doorH);
        g.lineStyle(2, 0xb86a14, 1);
        for (let ly = doorY + 5; ly < doorY + doorH; ly += 5) {
            g.lineBetween(doorX, ly, doorX + doorW, ly);
        }

        // lampen links und rechts vom tor
        for (const lx of [doorX - 14, doorX + doorW + 14]) {
            g.fillStyle(0xffe27a, 0.35);
            g.fillCircle(lx, doorY + doorH / 2, 13);
            g.fillStyle(0xffe27a, 1);
            g.fillCircle(lx, doorY + doorH / 2, 5);
        }

        // gelb-schwarze warnstreifen vor dem tor
        const stripeY = bottom + 4;
        const stripeW = 17;
        for (let sx = 0; sx < doorW + 8; sx += stripeW) {
            g.fillStyle(Math.floor(sx / stripeW) % 2 ? 0x1b222a : 0xffcc33, 1);
            g.fillRect(doorX - 4 + sx, stripeY, Math.min(stripeW, doorW + 8 - sx), 9);
        }

        // leuchtschild über dem dach: dunkle platte, neon-schrift mit glühen
        const label = scene.add.text(this.x, top - GARAGES.labelGap, this.name, {
            color: GARAGES.labelColor,
            fontFamily: "Impact, 'Arial Black', sans-serif",
            fontSize: `${GARAGES.labelFontSize}px`,
            letterSpacing: 4,
        }).setOrigin(0.5).setDepth(3);
        label.setStroke("#7a3a00", 3);
        label.setShadow(0, 0, "#" + GARAGES.labelGlow.toString(16), 14, true, true);

        const plateW = label.width + 36;
        const plateH = label.height + 12;
        const plate = scene.add.graphics().setDepth(2);
        plate.fillStyle(0x0d131a, 0.95);
        plate.fillRoundedRect(this.x - plateW / 2, label.y - plateH / 2, plateW, plateH, 8);
        plate.lineStyle(3, GARAGES.labelGlow, 1);
        plate.strokeRoundedRect(this.x - plateW / 2, label.y - plateH / 2, plateW, plateH, 8);
        // halterung zum dach
        plate.fillStyle(0x2b343b, 1);
        plate.fillRect(this.x - 40, label.y + plateH / 2, 6, GARAGES.labelGap - plateH / 2);
        plate.fillRect(this.x + 34, label.y + plateH / 2, 6, GARAGES.labelGap - plateH / 2);

        // status auf dem dach: offen oder gesperrt mit restzeit
        this.statusText = scene.add.text(this.x, this.y - 6, "", {
            fontFamily: "monospace",
            fontSize: "18px",
            fontStyle: "bold",
            backgroundColor: "#0d131a",
            padding: { x: 6, y: 2 },
        }).setOrigin(0.5).setDepth(3);
        this.setLockedSeconds(0);

        // schrift flackert leicht wie ein neonschild
        scene.tweens.add({
            targets: label,
            alpha: 0.82,
            duration: 900 + Math.random() * 600,
            yoyo: true,
            repeat: -1,
            ease: "Sine.InOut",
        });
    }

    // sperre anzeigen (0 = offen)
    setLockedSeconds(seconds) {
        if (seconds === this.lockedSeconds) return;
        this.lockedSeconds = seconds;
        if (seconds > 0) {
            const m = Math.floor(seconds / 60);
            const s = String(seconds % 60).padStart(2, "0");
            this.statusText.setText(`GESPERRT ${m}:${s}`).setColor("#ff6a5a");
        } else {
            this.statusText.setText("OFFEN").setColor("#7dff8a");
        }
    }

    // ist der mittelpunkt des autos weit genug in der garage?
    contains(car) {
        return Math.abs(car.x - this.x) < GARAGES.width * GARAGES.enterRatio / 2
            && Math.abs(car.y - this.y) < GARAGES.height * GARAGES.enterRatio / 2;
    }
}
