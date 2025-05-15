import {
  createGame,
  makeMove,
  endGame,
  getGameById,
} from "../controller/gameController.js";
import express from "express";

const gameRouter = express.Router();

gameRouter.post("/startgame", createGame);
gameRouter.post("/move/:id", makeMove);
gameRouter.post("/endgame/:id", endGame);
gameRouter.get("/getgame/:id", getGameById);

export default gameRouter;
