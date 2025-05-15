import express from "express";
import gameRouter from "./gameR.js";

const router = express.Router();

router.use("/api", gameRouter);

export default router;
