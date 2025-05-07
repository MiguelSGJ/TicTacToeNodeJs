import express from 'express'
import { app } from './app.js'
import { dotenv } from 'dotenv'

dotenv.config();

const port = process.env.SERVER_PORT || 3000;

app.listen(port, () => {
    console.log(`Servidor rodando na porta`, $port);
})