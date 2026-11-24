// minimap unten rechts: zeigt hindernisse, das boost-item, alle spieler und den sichtbaren ausschnitt.
// die statische karte (hintergrund, raster, hindernisse) wird einmal gezeichnet,
// nur spieler und boost werden jeden frame neu gezeichnet. mit der taste M ein- und ausblenden.

import { MINIMAP, GOLD_STREAK, SPEED_BOOST, VIEW_WIDTH, VIEW_HEIGHT, WORLD_WIDTH, WORLD_HEIGHT } from "../config.js";

export class Minimap {
    constructor(scene, car, multiplayer, playerHud, obstacleField, speedBoost) {
        this.scene = scene;
        this.car = car;
        this.multiplayer = multiplayer;
        this.playerHud = playerHud;
        this.speedBoost = speedBoost;

        this.scale = MINIMAP.width / WORLD_WIDTH;
        this.width = MINIMAP.width;
        this.height = WORLD_HEIGHT * this.scale;

        const x = VIEW_WIDTH - this.width - MINIMAP.margin;
        const y = VIEW_HEIGHT - this.height - MINIMAP.margin;

        // zwei ebenen: unten die statische karte, oben die beweglichen punkte
        this.base = scene.add.graphics().setScrollFactor(0).setDepth(MINIMAP.depth).setPosition(x, y);
        this.dynamic = scene.add.graphics().setScrollFactor(0).setDepth(MINIMAP.depth + 1).setPosition(x, y);
        this.title = scene.add.text(x + 8, y + 6, "KARTE  [M]", {
            color: "#8ad8ff",
            fontSize: `${MINIMAP.titleFontSize}px`,
            fontStyle: "bold",
        }).setScrollFactor(0).setDepth(MINIMAP.depth + 1).setAlpha(0.8);

        this.drawBase(obstacleField);

        this.visible = true;
        this.toggleKey = scene.input.keyboard.addKey(MINIMAP.toggleKey);
        this.toggleKey.on("down", () => this.setVisible(!this.visible));
        scene.events.once(Phaser.Scenes.Events.SHUTDOWN, () => this.destroy());
    }

    // weltkoordinate -> position auf der karte
    toMap(value) {
        return value * this.scale;
    }

    drawBase(obstacleField) {
        const g = this.base;
        g.clear();

        g.fillStyle(MINIMAP.backgroundColor, MINIMAP.backgroundAlpha);
        g.fillRoundedRect(0, 0, this.width, this.height, MINIMAP.cornerRadius);

        // raster
        g.lineStyle(1, MINIMAP.gridColor, MINIMAP.gridAlpha);
        for (let i = 1; i < MINIMAP.gridLines; i += 1) {
            const gx = (this.width / MINIMAP.gridLines) * i;
            const gy = (this.height / MINIMAP.gridLines) * i;
            g.lineBetween(gx, 0, gx, this.height);
            g.lineBetween(0, gy, this.width, gy);
        }

        // hindernisse (stehen fest, müssen nur einmal gezeichnet werden)
        g.fillStyle(MINIMAP.obstacleColor, MINIMAP.obstacleAlpha);
        for (const obstacle of obstacleField.group.getChildren()) {
            const w = Math.max(2, this.toMap(obstacle.displayWidth));
            const h = Math.max(2, this.toMap(obstacle.displayHeight));
            g.fillRect(this.toMap(obstacle.x) - w / 2, this.toMap(obstacle.y) - h / 2, w, h);
        }

        g.lineStyle(2, MINIMAP.borderColor, 0.9);
        g.strokeRoundedRect(0, 0, this.width, this.height, MINIMAP.cornerRadius);
    }

    update(time) {
        if (!this.visible) return;

        const g = this.dynamic;
        g.clear();

        // sichtbarer kartenausschnitt, auf die karte begrenzt
        const view = this.scene.cameras.main.worldView;
        const vx = Phaser.Math.Clamp(this.toMap(view.x), 0, this.width);
        const vy = Phaser.Math.Clamp(this.toMap(view.y), 0, this.height);
        const vr = Phaser.Math.Clamp(this.toMap(view.right), 0, this.width);
        const vb = Phaser.Math.Clamp(this.toMap(view.bottom), 0, this.height);
        g.lineStyle(1, MINIMAP.viewColor, MINIMAP.viewAlpha);
        g.strokeRect(vx, vy, vr - vx, vb - vy);

        const pulse = (Math.sin(time / MINIMAP.pulseSpeed) + 1) / 2;   // 0..1

        // boost-item, nur wenn es gerade da ist
        if (this.speedBoost.pickup.visible) {
            const bx = this.toMap(SPEED_BOOST.x);
            const by = this.toMap(SPEED_BOOST.y);
            g.lineStyle(1, MINIMAP.boostColor, 1 - pulse);
            g.strokeCircle(bx, by, MINIMAP.boostRadius + pulse * MINIMAP.pulseRadius);
            g.fillStyle(MINIMAP.boostColor, 1);
            g.fillCircle(bx, by, MINIMAP.boostRadius * 0.7);
        }

        // andere spieler in ihrer farbe
        for (const [id, remoteCar] of Object.entries(this.multiplayer.remoteCars)) {
            const isGold = this.scene.goldStreak?.goldIds.has(id);
            const color = isGold ? GOLD_STREAK.color : (this.playerHud.players[id]?.color ?? 0xffffff);
            const radius = isGold ? GOLD_STREAK.minimapRadius : MINIMAP.remoteDotRadius;
            const rx = this.toMap(remoteCar.x);
            const ry = this.toMap(remoteCar.y);
            if (isGold) this.drawGoldRing(g, rx, ry, radius, pulse);
            g.fillStyle(0x000000, 0.6);
            g.fillCircle(rx, ry, radius + 1.5);
            g.fillStyle(color, 1);
            g.fillCircle(rx, ry, radius);
        }

        this.drawOwnCar(g, pulse);
    }

    // pulsierender goldener ring um spieler mit goldener killstreak
    drawGoldRing(g, x, y, radius, pulse) {
        g.lineStyle(2, GOLD_STREAK.color, 1 - pulse * 0.6);
        g.strokeCircle(x, y, radius + 2 + pulse * MINIMAP.pulseRadius);
    }

    // eigenes auto: pfeil in fahrtrichtung mit pulsierendem ring
    drawOwnCar(g, pulse) {
        const x = this.toMap(this.car.x);
        const y = this.toMap(this.car.y);
        const size = MINIMAP.ownArrowSize;
        const color = this.playerHud.players[this.multiplayer.playerId]?.color ?? MINIMAP.ownColor;

        g.lineStyle(1, color, 0.8 * (1 - pulse));
        g.strokeCircle(x, y, size + pulse * MINIMAP.pulseRadius);
        if (this.scene.goldStreak?.goldIds.has(this.multiplayer.playerId)) this.drawGoldRing(g, x, y, size, pulse);

        // das auto-bild zeigt bei winkel 0 nach oben
        const points = [[0, -size], [size * 0.7, size * 0.8], [0, size * 0.35], [-size * 0.7, size * 0.8]]
            .map(([px, py]) => {
                const cos = Math.cos(this.car.rotation);
                const sin = Math.sin(this.car.rotation);
                return { x: x + px * cos - py * sin, y: y + px * sin + py * cos };
            });

        g.fillStyle(MINIMAP.ownColor, 1);
        g.lineStyle(2, color, 1);
        g.fillPoints(points, true);
        g.strokePoints(points, true);
    }

    setVisible(visible) {
        this.visible = visible;
        this.base.setVisible(visible);
        this.dynamic.setVisible(visible);
        this.title.setVisible(visible);
    }

    destroy() {
        this.toggleKey.removeAllListeners();
        this.scene.input.keyboard?.removeKey(this.toggleKey);
        this.base.destroy();
        this.dynamic.destroy();
        this.title.destroy();
    }
}
