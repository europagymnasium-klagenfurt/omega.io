// startpunkt des servers: express liefert die dateien aus, socket.io macht den multiplayer.
// die eigentliche logik liegt in server/

import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";
import { join } from "path";
import { setupNetwork } from "./server/network.js";

const PORT = 3000;
const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer);

app.use(express.static(join(import.meta.dirname, "public")));
app.use("/shared", express.static(join(import.meta.dirname, "shared")));   // shared/ auch für den browser

setupNetwork(io);

httpServer.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
