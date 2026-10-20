// verbindet die scene mit dem server: eigene position senden, andere autos anzeigen

import { socket, EVENTS } from "../network.js";
import { RemoteCar } from "../objects/RemoteCar.js";

export class Multiplayer {
    constructor(scene, localCar) {
        this.scene = scene;
        this.localCar = localCar;
        this.playerId = null;
        this.remoteCars = {};
        this.latestState = localCar.getState();
        this.animationFrameId = null;

        // alle server-events: event-name -> funktion
        this.handlers = {
            [EVENTS.INIT]: (data) => this.onInit(data),
            [EVENTS.PLAYER_JOINED]: (player) => this.addRemoteCar(player),
            [EVENTS.PLAYER_LEFT]: (data) => this.removeRemoteCar(data.id),
            [EVENTS.PLAYER_MOVED]: (data) => this.remoteCars[data.id]?.applyState(data),
        };

        for (const [event, handler] of Object.entries(this.handlers)) {
            socket.on(event, handler);
        }
        // listener wieder entfernen, wenn die scene beendet wird. sonst gibt es sie nach einem neustart doppelt.
        scene.events.once(Phaser.Scenes.Events.SHUTDOWN, () => this.destroy());

        this.sendAtRefreshRate();
        socket.emit(EVENTS.READY);
    }

    onInit(data) {
        this.playerId = data.id;

        // für unser car die position, den winkel und die farbe vom server übernehmen
        this.localCar.applyServerData(data.players[this.playerId]);

        for (const player of Object.values(data.players)) {
            this.addRemoteCar(player);
        }
    }

    addRemoteCar(player) {
        if (player.id === this.playerId || this.remoteCars[player.id]) return;   // eigene id, oder player id gibt es schon
        this.remoteCars[player.id] = new RemoteCar(this.scene, player);
    }

    removeRemoteCar(id) {
        if (this.remoteCars[id]) {
            this.remoteCars[id].destroy();
            delete this.remoteCars[id];
        }
    }

    // wird jeden frame von der scene aufgerufen
    sendState() {
        this.latestState = this.localCar.getState();
    }

    sendAtRefreshRate() {
        const send = () => {
            socket.emit(EVENTS.UPDATE, this.latestState);
            this.animationFrameId = requestAnimationFrame(send);
        };

        this.animationFrameId = requestAnimationFrame(send);
    }

    destroy() {
        cancelAnimationFrame(this.animationFrameId);
        for (const [event, handler] of Object.entries(this.handlers)) {
            socket.off(event, handler);
        }
    }
}
