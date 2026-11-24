// minen: mit STRG legt das eigene auto eine mine ab. der server entscheidet (cooldown, explosion),
// hier werden nur die minen angezeigt und die taste abgefragt.

import { socket, EVENTS } from "../network.js";
import { Mine } from "../objects/Mine.js";
import { MineCooldownHud } from "../objects/MineCooldownHud.js";

export class Mines {
    constructor(scene, playerHealth) {
        this.scene = scene;
        this.playerHealth = playerHealth;
        this.mines = {};
        this.hud = new MineCooldownHud(scene);
        this.key = scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.CTRL);

        this.handlers = {
            [EVENTS.INIT]: (data) => {
                Object.values(data.mines ?? {}).forEach((mine) => this.addMine(mine));
                this.hud.start(data.mineCooldownLeft ?? 0);   // z.b. nach dem garagen-wechsel läuft der cooldown weiter
            },
            [EVENTS.MINE_PLACED]: (mine) => {
                this.addMine(mine);
                if (mine.ownerId === socket.id) this.hud.start();
            },
            [EVENTS.MINE_REMOVED]: (data) => this.removeMine(data.id, data.exploded),
        };

        for (const [event, handler] of Object.entries(this.handlers)) {
            socket.on(event, handler);
        }
        scene.events.once(Phaser.Scenes.Events.SHUTDOWN, () => this.destroy());
    }

    // wird jeden frame von der scene aufgerufen
    update(delta) {
        this.hud.update(delta);
        if (Phaser.Input.Keyboard.JustDown(this.key) && this.playerHealth.isAlive()) {
            socket.emit(EVENTS.MINE_PLACE);
        }
    }

    addMine(data) {
        if (!this.mines[data.id]) this.mines[data.id] = new Mine(this.scene, data);
    }

    removeMine(id, exploded) {
        const mine = this.mines[id];
        if (!mine) return;
        if (exploded) mine.explode();
        mine.destroy();
        delete this.mines[id];
    }

    destroy() {
        for (const [event, handler] of Object.entries(this.handlers)) {
            socket.off(event, handler);
        }
    }
}
