import { N, Colors } from './consts';
import { isHorizontalEdge, idToPos } from './board-logic';

export function drawBoard(ctx, nodeMatrix, adjacencyMatrix) {
  const boardSide = ctx.canvas.width;
  const tileSide = boardSide / N;
  const edgeShortSide = 0.2 * tileSide;
  const nodeSide = tileSide - edgeShortSide;
  const edgeLongSide = tileSide;

  ctx.clearRect(0, 0, boardSide, boardSide);

  // background color
  ctx.fillStyle = Colors.EDGE;
  ctx.fillRect(0, 0, boardSide, boardSide);

  let topX, topY, r, c, from, to;

  // draw nodes and players
  ctx.fillStyle = Colors.NODE;
  for (r = 0; r < nodeMatrix.length; r++) {
    for (c = 0; c < nodeMatrix[r].length; c++) {
      topX = (edgeShortSide / 2) + (c * tileSide);
      topY = (edgeShortSide / 2) + (r * tileSide);
      ctx.fillRect(topX, topY, nodeSide, nodeSide);
      if (nodeMatrix[r][c] > 0) {
        ctx.fillStyle = Colors.PLAYERS[nodeMatrix[r][c]];
        ctx.fillRect(topX + nodeSide / 4, topY + nodeSide / 4, nodeSide / 2, nodeSide / 2);
        ctx.fillStyle = Colors.NODE;
      }
    }
  }

  // draw edges
  let edgeVal, width, height;
  for (from = 0; from < adjacencyMatrix.length; from++) {
    for (to = from + 1; to < adjacencyMatrix[from].length; to++) {
      edgeVal = adjacencyMatrix[from][to];
      if (edgeVal <= 0) continue;
      const fromPos = idToPos(from);
      const toPos = idToPos(to);
      if (isHorizontalEdge(from, to)) {
        topX = fromPos.c * tileSide;
        topY = (fromPos.r * tileSide) + (edgeShortSide / 2) + nodeSide;
        width = tileSide;
        height = edgeShortSide;
      } else {
        topY = fromPos.r * tileSide;
        topX = (fromPos.c * tileSide) + (edgeShortSide / 2) + nodeSide;
        width = edgeShortSide;
        height = tileSide;
      }
      ctx.fillStyle = Colors.PLAYERS[edgeVal];
      ctx.fillRect(topX, topY, width, height);
    }
  }
}

export function coordsToPos(ctx, x, y) {
  const tileSide = ctx.canvas.width / N;
  return {
    r: Math.floor(y / tileSide),
    c: Math.floor(x / tileSide)
  };
}

export function coordsToQuadrant(ctx, x, y) {
  const tileSide = ctx.canvas.width / N;
  const quadrantSide = tileSide;

  const topLeft = {
    r: Math.floor((y - (tileSide / 2)) / tileSide),
    c: Math.floor((x - (tileSide / 2)) / tileSide)
  }

  return {
    topLeft: topLeft,
    topRight: {r: topLeft.r, c: topLeft.c + 1},
    bottomLeft: {r: topLeft.r + 1, c: topLeft.c},
    bottomRight: {r: topLeft.r + 1, c: topLeft.c + 1}
  };
}
