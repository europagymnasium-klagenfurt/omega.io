import express from "express";
import { createServer } from "http";

const PORT = 3000;


const app = express();
const httpServer = createServer(app);


app.use(express.static("public"));

httpServer.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});