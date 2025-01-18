import express from "express";
import { CLIENT_DIST_PATH, PORT } from "./constants";
import loader from "./loaders";
import api from "./api";
async function startServer(): Promise<void> {
  const app = express();
  app.use(express.json());
  app.use(express.text());
  app.use(express.static(CLIENT_DIST_PATH));
  await loader();
  api(app);
  app.listen(PORT, () => {
    console.log(`🚀 Server running at http://localhost:${PORT}`);
  });
}

startServer();
