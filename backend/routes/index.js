import express from 'express'
import gameRoutes from './gameR'

const router = express.Router();

router.use('/game', gameRoutes);

export default router;