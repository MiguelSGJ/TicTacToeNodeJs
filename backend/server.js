import { app } from "./app.js";
import { config } from "dotenv";

config();

const port = process.env.SERVER_PORT || 3000;

app.listen(port, () => {
  console.log(`Servidor rodando na porta ${port}`);
});
