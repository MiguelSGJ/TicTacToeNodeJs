import { createCanvas, loadImage } from 'canvas';

export async function generateBoardImage(base64Image, board) {
  try {
    // Remove prefixo base64 e converte para buffer
    const base64Data = base64Image.replace(/^data:image\/\w+;base64,/, '');
    const imgBuffer = Buffer.from(base64Data, 'base64');

    // Carrega a imagem base
    const img = await loadImage(imgBuffer);

    // Cria canvas com o tamanho da imagem base
    const canvas = createCanvas(img.width, img.height);
    const ctx = canvas.getContext('2d');

    // Desenha a imagem base no canvas
    ctx.drawImage(img, 0, 0);

    // Configura fonte e estilo do texto
    ctx.font = '64px Arial'; // ajuste o tamanho e a fonte se quiser
    ctx.fillStyle = 'black'; // cor do texto
    ctx.textBaseline = 'middle';
    ctx.textAlign = 'center';

    // Coordenadas das casas (ajuste conforme sua imagem)
    const positions = [
      { x: 270, y: 910 }, { x: 540, y: 910 }, { x: 790, y: 910 },
      { x: 270, y: 1150 }, { x: 540, y: 1150 }, { x: 790, y: 1150 },
      { x: 270, y: 1365 }, { x: 540, y: 1365 }, { x: 790, y: 1365 },
    ];

    // Para cada posição no tabuleiro, escreve X ou O centralizado
    for (let row = 0; row < 3; row++) {
      for (let col = 0; col < 3; col++) {
        const cell = board[row][col];
        if (cell === 'X' || cell === 'O') {
          const pos = positions[row * 3 + col];
          ctx.fillText(cell, pos.x, pos.y);
        }
      }
    }

    // Retorna a imagem em base64 (data URL)
    return canvas.toDataURL('image/png');

  } catch (error) {
    console.error('Error generating image with canvas:', error);
    throw error;
  }
}
