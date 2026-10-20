// verbindet die scene mit dem server: eigene position senden, andere autos anzeigen

import { socket, EVENTS } from "../network.js";
import { RemoteCar } from "../objects/RemoteCar.js";

export class Multiplayer {
    constructor(scene, localCar, playerHud) {
        this.scene = scene;
        this.localCar = localCar;
        this.playerHud = playerHud;
        this.playerId = null;
        this.remoteCars = {};

        // alle server-events: event-name -> funktion
        this.handlers = {
            [EVENTS.INIT]: (data) => this.onInit(data),
            [EVENTS.PLAYER_JOINED]: (player) => this.onPlayerJoined(player),
            [EVENTS.PLAYER_LEFT]: (data) => this.onPlayerLeft(data.id),
            [EVENTS.PLAYER_MOVED]: (data) => this.remoteCars[data.id]?.applyState(data),
        };

        for (const [event, handler] of Object.entries(this.handlers)) {
            socket.on(event, handler);
        }
        // listener wieder entfernen, wenn die scene beendet wird. sonst gibt es sie nach einem neustart doppelt.
        scene.events.once(Phaser.Scenes.Events.SHUTDOWN, () => this.destroy());

        socket.emit(EVENTS.READY);
    }

    onInit(data) {
        this.playerId = data.id;

        // für unser car die position, den winkel und die farbe vom server übernehmen
        this.localCar.applyServerData(data.players[this.playerId]);
        this.playerHud.setPlayers(data.players);

        for (const player of Object.values(data.players)) {
            this.addRemoteCar(player);
        }
    }

    onPlayerJoined(player) {
        this.addRemoteCar(player);
        this.playerHud.addPlayer(player);
    }

    onPlayerLeft(id) {
        this.removeRemoteCar(id);
        this.playerHud.removePlayer(id);
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
        socket.emit(EVENTS.UPDATE, this.localCar.getState());
    }

    destroy() {
        for (const [event, handler] of Object.entries(this.handlers)) {
            socket.off(event, handler);
        }
    }
}
