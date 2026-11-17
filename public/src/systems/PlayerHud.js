import { PLAYER_HUD, VIEW_WIDTH } from "../config.js";

export class PlayerHud {
    constructor(scene) {
        this.scene = scene;
        this.players = {};
        this.rows = [];
        this.fpsElapsed = 0;
        this.fpsFrames = 0;

        this.container = scene.add.container(
            VIEW_WIDTH - PLAYER_HUD.width - PLAYER_HUD.margin,
            PLAYER_HUD.margin,
        ).setScrollFactor(0).setDepth(100);

        this.background = scene.add.rectangle(
            0,
            0,
            PLAYER_HUD.width,
            PLAYER_HUD.baseHeight,
            0x101820,
            0.88,
        ).setOrigin(0);
        this.background.setStrokeStyle(2, 0x4ec9f5, 0.9);

        this.title = scene.add.text(
            PLAYER_HUD.padding,
            PLAYER_HUD.padding,
            "FAHRER-DASHBOARD",
            { color: "#8ad8ff", fontSize: `${PLAYER_HUD.smallFontSize}px`, fontStyle: "bold" },
        );

        this.fpsText = scene.add.text(
            PLAYER_HUD.width - PLAYER_HUD.padding,
            PLAYER_HUD.padding,
            "FPS: ---",
            {
                color: "#cfe4ff",
                fontSize: `${PLAYER_HUD.smallFontSize}px`,
                fontStyle: "bold",
            },
        ).setOrigin(1, 0);

        this.playerListTitle = scene.add.text(
            PLAYER_HUD.padding,
            PLAYER_HUD.listTitleY,
            "SPIELER",
            { color: "#8ad8ff", fontSize: `${PLAYER_HUD.smallFontSize}px`, fontStyle: "bold" },
        );

        this.speedText = scene.add.text(
            PLAYER_HUD.width / 2,
            PLAYER_HUD.speedValueY,
            "0",
            { color: "#ffffff", fontSize: `${PLAYER_HUD.valueFontSize}px`, fontStyle: "bold" },
        ).setOrigin(0.5);

        this.unitText = scene.add.text(
            PLAYER_HUD.width / 2,
            PLAYER_HUD.speedUnitY,
            "km/h",
            { color: "#cfe4ff", fontSize: `${PLAYER_HUD.smallFontSize}px`, fontStyle: "bold" },
        ).setOrigin(0.5);

        this.gaugeBackground = scene.add.rectangle(
            PLAYER_HUD.width / 2,
            PLAYER_HUD.gaugeY,
            PLAYER_HUD.gaugeWidth,
            PLAYER_HUD.gaugeBackgroundHeight,
            0x1f2b3a,
            1,
        ).setOrigin(0.5);
        this.gaugeBackground.setStrokeStyle(1, 0x4a5a6b, 0.8);

        this.gaugeFill = scene.add.rectangle(
            PLAYER_HUD.width / 2 - PLAYER_HUD.gaugeWidth / 2,
            PLAYER_HUD.gaugeY,
            0,
            PLAYER_HUD.gaugeFillHeight,
            0x4ec9f5,
            1,
        ).setOrigin(0, 0.5);

        this.container.add([
            this.background,
            this.title,
            this.fpsText,
            this.playerListTitle,
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

    update(speedKmh, delta) {
        const speed = Math.max(0, Math.round(speedKmh));
        this.speedText.setText(String(speed));

        const fraction = Phaser.Math.Clamp(speed / PLAYER_HUD.maxSpeedKmh, 0, 1);
        this.gaugeFill.width = PLAYER_HUD.gaugeWidth * fraction;
        this.gaugeFill.setFillStyle(this.getGaugeColor(fraction));

        this.fpsElapsed += delta;
        this.fpsFrames += 1;
        if (this.fpsElapsed >= PLAYER_HUD.fpsRefreshInterval) {
            const fps = Math.round(this.fpsFrames * 1000 / this.fpsElapsed);
            this.fpsText.setText(`FPS: ${fps}`);
            this.fpsElapsed = 0;
            this.fpsFrames = 0;
        }
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
        const height = PLAYER_HUD.baseHeight + players.length * PLAYER_HUD.rowHeight;
        this.background.setSize(PLAYER_HUD.width, height);

        players.forEach((player, index) => {
            const color = `#${player.color.toString(16).padStart(6, "0")}`;
            const row = this.scene.add.text(
                PLAYER_HUD.padding,
                PLAYER_HUD.listStartY + index * PLAYER_HUD.rowHeight,
                player.name || "Unbekannt",
                { color, fontSize: `${PLAYER_HUD.fontSize}px` },
            );
            this.rows.push(row);
        });

        this.container.add(this.rows);
    }
}
