// alle socket.io events am server

import { EVENTS } from "../shared/events.js";
import { addPlayer, getAllPlayers, getPlayer, updatePlayer, removePlayer } from "./players.js";

export function setupNetwork(io) {
    io.on("connection", (socket) => {
        console.log("a user connected " + socket.id);

        const id = socket.id;
        addPlayer(id);

        socket.on(EVENTS.READY, () => {
            socket.emit(EVENTS.INIT, { id: id, players: getAllPlayers() });
            socket.broadcast.emit(EVENTS.PLAYER_JOINED, getPlayer(id));
        });

        socket.on(EVENTS.UPDATE, (data) => {
            const player = updatePlayer(id, data);
            if (player) {
                socket.broadcast.emit(EVENTS.PLAYER_MOVED, { id: id, x: player.x, y: player.y, angle: player.angle });
            }
        });

        socket.on("disconnect", () => {
            console.log("user disconnected " + id);
            socket.broadcast.emit(EVENTS.PLAYER_LEFT, { id: id });
            removePlayer(id);
        });
    });
}
