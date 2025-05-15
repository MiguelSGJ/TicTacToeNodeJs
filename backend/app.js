import express from "express";
import cors from "cors";
import Mongo from "./database/mongo.js";
import router from "./routes/index.js";
import { config } from "dotenv";

config();
const app = express();

app.use(cors({}));
app.use(express.json());

app.use(router);

(async () => {
  await Mongo.connect({
    mongoConnectionString: process.env.MONGO_CS,
    mongoDbName: process.env.MONGO_DB_NAME,
  });
})();

export { app };
