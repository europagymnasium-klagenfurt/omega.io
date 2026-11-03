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
            PLAYER_HUD.padding * 2 + PLAYER_HUD.titleHeight,
            0x111111,
            0.8,
        ).setOrigin(0);
        this.title = scene.add.text(
            PLAYER_HUD.padding,
            PLAYER_HUD.padding,
            "SPIELER",
            { color: "#ffffff", fontSize: `${PLAYER_HUD.fontSize}px` },
        );

        this.container.add([this.background, this.title]);
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

    updateRows() {
        for (const row of this.rows) {
            this.container.remove(row, true);
        }
        this.rows = [];

        const players = Object.values(this.players);
        const height = PLAYER_HUD.padding * 2
            + PLAYER_HUD.titleHeight
            + players.length * PLAYER_HUD.rowHeight;
        this.background.setSize(PLAYER_HUD.width, height);

        players.forEach((player, index) => {
            const color = `#${player.color.toString(16).padStart(6, "0")}`;
            const row = this.scene.add.text(
                PLAYER_HUD.padding,
                PLAYER_HUD.padding + PLAYER_HUD.titleHeight + index * PLAYER_HUD.rowHeight,
                player.id,
                { color, fontSize: `${PLAYER_HUD.fontSize}px` },
            );
            this.rows.push(row);
        });

        this.container.add(this.rows);
    }
}
