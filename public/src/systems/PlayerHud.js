import { PLAYER_HUD, VIEW_WIDTH } from "../config.js";

export class PlayerHud {
    constructor(scene) {
        this.scene = scene;
        this.players = {};
        this.rows = [];

        this.container = scene.add.container(
            VIEW_WIDTH - PLAYER_HUD.width - PLAYER_HUD.margin,
            PLAYER_HUD.margin,
        ).setScrollFactor(0).setDepth(100);

        this.background = scene.add.rectangle(
            0,
            0,
            PLAYER_HUD.width,
            120,
            0x101820,
            0.88,
        ).setOrigin(0);
        this.background.setStrokeStyle(2, 0x4ec9f5, 0.9);

        this.title = scene.add.text(
            PLAYER_HUD.padding,
            PLAYER_HUD.padding,
            "SPEED",
            { color: "#8ad8ff", fontSize: "12px", fontStyle: "bold" },
        );

        this.speedText = scene.add.text(
            PLAYER_HUD.width / 2,
            42,
            "0",
            { color: "#ffffff", fontSize: "38px", fontStyle: "bold" },
        ).setOrigin(0.5);

        this.unitText = scene.add.text(
            PLAYER_HUD.width / 2,
            78,
            "km/h",
            { color: "#cfe4ff", fontSize: "12px", fontStyle: "bold" },
        ).setOrigin(0.5);

        this.gaugeBackground = scene.add.rectangle(
            PLAYER_HUD.width / 2,
            92,
            160,
            10,
            0x1f2b3a,
            1,
        ).setOrigin(0.5);
        this.gaugeBackground.setStrokeStyle(1, 0x4a5a6b, 0.8);

        this.gaugeFill = scene.add.rectangle(
            PLAYER_HUD.width / 2 - 80,
            92,
            0,
            8,
            0x4ec9f5,
            1,
        ).setOrigin(0, 0.5);

        this.container.add([
            this.background,
            this.title,
            this.speedText,
            this.unitText,
            this.gaugeBackground,
            this.gaugeFill,
        ]);
    }

    setPlayers(players) {
        this.players = { ...players };
        this.updateRows();
    }

    addPlayer(player) {
        this.players[player.id] = player;
        this.updateRows();
    }

    removePlayer(id) {
        delete this.players[id];
        this.updateRows();
    }

    updateSpeed(speedKmh) {
        const speed = Math.max(0, Math.round(speedKmh));
        this.speedText.setText(String(speed));

        const maxSpeed = 260;
        const fraction = Phaser.Math.Clamp(speed / maxSpeed, 0, 1);
        this.gaugeFill.width = 160 * fraction;
        this.gaugeFill.setFillStyle(this.getGaugeColor(fraction));
    }

    getGaugeColor(fraction) {
        if (fraction < 0.5) return 0x4ec9f5;
        if (fraction < 0.8) return 0xffd166;
        return 0xff5d5d;
    }

    updateRows() {
        for (const row of this.rows) {
            this.container.remove(row, true);
        }
        this.rows = [];

        const players = Object.values(this.players);
        const height = 120 + players.length * PLAYER_HUD.rowHeight;
        this.background.setSize(PLAYER_HUD.width, height);

        players.forEach((player, index) => {
            const color = `#${player.color.toString(16).padStart(6, "0")}`;
            const row = this.scene.add.text(
                PLAYER_HUD.padding,
                120 + index * PLAYER_HUD.rowHeight,
                player.id,
                { color, fontSize: `${PLAYER_HUD.fontSize}px` },
            );
            this.rows.push(row);
        });

        this.container.add(this.rows);
    }
}
