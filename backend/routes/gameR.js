import {
  createGame,
  makeMove,
  endGame,
  getGameByPlayerNumber,
} from "../controller/gameController.js";
import express from "express";

const gameRouter = express.Router();

gameRouter.post("/startgame/:phoneNumber", createGame);
gameRouter.post("/move", makeMove);
gameRouter.post("/endgame/:playerNumber", endGame);
gameRouter.get("/getgame/:playerNumber", getGameByPlayerNumber);

export default gameRouter;
