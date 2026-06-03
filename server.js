import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";



const PORT = 3000;
const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer);

io.on("connection", (socket) => {
  console.log("a user connected");

  socket.on("disconnect", () => {
    console.log("user disconnected");
  });
});


app.use(express.static("public"));

httpServer.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});