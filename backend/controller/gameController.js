// controllers/gameController.js
import Board from "../model/boardModel.js";
import User from "../model/userModel.js";
import { generateBoardImage } from "./utils/base64Encoder.js";

const Game = Board;

// Função para criar um novo jogo
export async function createGame(req, res) {
  const { phoneNumber } = req.params;

  try {
    // Busca usuário pelo telefone (ou cria um novo)
    let user = await User.findOne({
      phoneNumber,
    });
    if (!user) {
      user = new User({ phoneNumber, name: "Teste" });
      await user.save();
    }

    const existingGame = await Game.findOne({
      player: user._id,
      status: "playing",
    });
    if (existingGame) {
      return res.status(400).json({
        message: "Jogador ja esta em um jogo!",
        gameId: existingGame._id,
        board: existingGame.board,
        gameBoardImage: existingGame.image,
      });
    }

    // Cria novo jogo vinculado ao usuário
    const game = new Game({ player: user._id });
    await game.save();

    res.status(201).json({
      success: true,
      gameId: game._id,
      board: game.board,
      userId: user._id,
      gameBoardImage: game.image,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}

// Função para buscar um jogo pelo numero do telefone
export async function getGameByPlayerNumber(req, res) {
  const { playerNumber } = req.params;

  try {
    const user = await User.findOne({ phoneNumber: playerNumber });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Busca o jogo ativo desse usuário
    const game = await Game.findOne({ player: user._id, status: "playing" });
    if (!game) {
      return res
        .status(404)
        .json({ message: "No active game found for this user" });
    }

    // Retorna o jogo encontrado
    res.json(game);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}

// Função para encerrar o jogo
export async function endGame(req, res) {
  const { playerNumber } = req.params;
  try {
    // Busca usuário pelo telefone
    const user = await User.findOne({ phoneNumber: playerNumber });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Busca jogo ativo desse usuário
    const game = await Board.findOne({ player: user._id, status: "playing" });
    if (!game) {
      return res
        .status(404)
        .json({ message: "There's no active game for this user" });
    }

    // Verifica se o jogo já está finalizado
    if (game.status !== "playing") {
      return res.status(400).json({ message: "Game is already over" });
    }

    game.status = "finished"; // Atualiza o status para 'finished'
    game.winner = null; // Empate
    await game.save();
    res.json({ message: "Game Over", game });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error ending the game", details: error.message });
  }
}

// Função para realizar a jogada
export async function makeMove(req, res) {
  const { number, playerNumber } = req.body; // posição da jogada e telefone do usuário

  // 1) validação mínima do número
  if (typeof number !== "number" || isNaN(number)) {
    return res
      .status(400)
      .json({ message: "Campo number é obrigatório e deve ser um número." });
  }

  let row, col;
  try {
    // 2) tenta converter, mas se for inválido, pega o erro e devolve 400
    ({ row, col } = numberToPosition(number));
  } catch (err) {
    return res.status(400).json({ message: err.message });
  }

  try {
    // Busca usuário pelo telefone
    const user = await User.findOne({ phoneNumber: playerNumber });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Busca jogo ativo desse usuário
    const game = await Board.findOne({ player: user._id, status: "playing" });
    if (!game) {
      return res
        .status(404)
        .json({ message: "There's no active game for this user" });
    }

    // Verifica se o jogo já está finalizado
    if (game.status !== "playing") {
      return res.status(400).json({ message: "Game is already over" });
    }

    // Verifica se é o turno do jogador (X)
    if (game.currentPlayer !== "X") {
      return res.status(400).json({ message: "Not your turn" });
    }

    // Verifica se a casa está ocupada
    if (game.board[row][col] !== "") {
      return res.status(400).json({ message: "Invalid move!" });
    }

    // Jogador humano joga
    game.board[row][col] = "X";

    // Verifica vitória ou empate após jogada do jogador
    let winner = checkWinner(game.board);
    if (winner) {
      game.winner = winner;
      game.status = "finished";
    } else if (checkDraw(game.board)) {
      game.status = "finished";
    } else {
      // Turno para o sistema jogar (O)
      game.currentPlayer = "O";

      // Sistema joga automaticamente
      systemPlay(game);

      // Verifica vitória ou empate após jogada do sistema
      winner = checkWinner(game.board);
      if (winner) {
        game.winner = winner;
        game.status = "finished";
      } else if (checkDraw(game.board)) {
        game.status = "finished";
      } else {
        // Volta o turno para o jogador humano
        game.currentPlayer = "X";
      }
    }

    game.image = await generateBoardImage(game.image, game.board);

    await game.save();

    // Responde com o jogo atualizado e imagem
    res.json({
      message: winner
        ? winner === "X"
          ? "Você venceu!"
          : "Sistema venceu!"
        : game.status === "finished"
        ? "Empate!"
        : "Jogada realizada!",
      game,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}

function systemPlay(game) {
  // Lista todas as posições vazias
  const emptyPositions = [];
  for (let row = 0; row < 3; row++) {
    for (let col = 0; col < 3; col++) {
      if (game.board[row][col] === "") {
        emptyPositions.push({ row, col });
      }
    }
  }

  if (emptyPositions.length === 0) {
    return; // Tabuleiro cheio, não tem jogada possível
  }

  // Escolhe uma posição aleatória entre as vazias
  const randomIndex = Math.floor(Math.random() * emptyPositions.length);
  const { row, col } = emptyPositions[randomIndex];

  // Faz a jogada do sistema como 'O'
  game.board[row][col] = "O";
}

// Função para verificar vencedor
function checkWinner(board) {
  for (let i = 0; i < 3; i++) {
    if (
      board[i][0] !== "" &&
      board[i][0] === board[i][1] &&
      board[i][1] === board[i][2]
    )
      return board[i][0];

    if (
      board[0][i] !== "" &&
      board[0][i] === board[1][i] &&
      board[1][i] === board[2][i]
    )
      return board[0][i];
  }
  if (
    board[0][0] !== "" &&
    board[0][0] === board[1][1] &&
    board[1][1] === board[2][2]
  )
    return board[0][0];
  if (
    board[0][2] !== "" &&
    board[0][2] === board[1][1] &&
    board[1][1] === board[2][0]
  )
    return board[0][2];

  return null;
}

// Função para verificar empate
function checkDraw(board) {
  for (const row of board) {
    for (const cell of row) {
      if (cell === "") return false;
    }
  }
  return checkWinner(board) === null;
}

// Função para converter número de 1 a 9 para posição (linha, coluna)
function numberToPosition(number) {
  if (number < 1 || number > 9) {
    throw new Error("Número inválido, deve estar entre 1 e 9.");
  }
  const row = Math.floor((number - 1) / 3); // Linha (0 a 2)
  const col = (number - 1) % 3; // Coluna (0 a 2)
  return { row, col };
}

// export { createGame, getGameById, makeMove, endGame };