// controllers/gameController.js
import Board from "../model/boardModel.js";

// Função para criar um novo jogo
export async function createGame(req, res) {
  try {
    const game = await Board.create({});
    const id = game._id;

    console.log(`Jogo iniciado ${id}`);
    res.status(201).json({
      success: true,
      message: "Game initiated",
      id,
    }); // Retorna o jogo criado com status 201
  } catch (error) {
    res.status(500).json({ message: "Error creating game" }); // Erro no servidor
    console.log(error);
  }
}

// Função para buscar um jogo pelo ID
export async function getGameById(req, res) {
  const { id } = req.params;
  try {
    const game = await Board.findById(id);
    if (!game) {
      return res.status(404).json({ message: "Game not found" });
    }
    res.json(game); // Retorna o jogo encontrado
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}

// Função para encerrar o jogo
export async function endGame(req, res) {
  const { id } = req.params;
  try {
    const game = await Board.findById(id);
    if (!game) {
      return res.status(404).json({ message: "Game not found" });
    }

    game.status = "finished"; // Atualiza o status para 'finished'
    game.winner = "None"; // Empate
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
  const { id } = req.params;
  const { number } = req.body; // Número da posição e jogador

  try {
    // Busca o jogo
    const game = await Board.findById(id);
    if (!game) {
      return res.status(404).json({ message: "Game not found" });
    }

    // Verifica se o jogo já está finalizado
    if (game.status !== "playing") {
      return res.status(400).json({ message: "Game is already over" });
    }

    // Verifica se é o turno correto
    if (game.currentPlayer !== player) {
      return res.status(400).json({ message: "Not your turn" });
    }

    // Converte o número da posição para linha e coluna
    const { row, col } = numberToPosition(number);

    // Verifica se a casa está ocupada
    if (game.board[row][col] !== "") {
      return res.status(400).json({ message: "Invalid move!" });
    }

    // Realiza a jogada
    game.board[row][col] = player;

    // Verifica vencedor ou empate
    const winner = checkWinner(game.board);
    if (winner) {
      game.winner = winner;
      game.status = "finished";
    } else if (checkDraw(game.board)) {
      game.status = "finished";
    } else {
      // Alterna o turno para o próximo jogador
      game.currentPlayer = player === "X" ? "O" : "X";
      // O sistema joga automaticamente o turno do próximo jogador
      systemPlay(game); // Função para o sistema jogar automaticamente
    }

    await game.save();
    res.json(game._id, game.board); // Retorna o estado atualizado do jogo
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}

// Função para alternar a jogada do sistema (IA simples)
function systemPlay(game) {
  for (let row = 0; row < 3; row++) {
    for (let col = 0; col < 3; col++) {
      if (game.board[row][col] === "") {
        game.board[row][col] = game.currentPlayer === "X" ? "O" : "X"; // Alterna o jogador
        game.currentPlayer = game.currentPlayer === "X" ? "O" : "X"; // Alterna o turno
        return;
      }
    }
  }
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
