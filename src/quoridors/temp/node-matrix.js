
export default class NodeMatrix {
  constructor(settings) {
    this.settings = settings;
    this.matrix = makeNodeMatrix(settings);
  }

  hasNode(r, c) {

  }
  
  get(r, c) {
    return this.matrix[r][c];
  }

  move(currPos, nextPos) {
    this.matrix[nextPos.r][nextPos.c] = this.matrix[currPos.r][currPos.c];
    this.matrix[currPos.r][currPos.c] = 0;
  }

  posOfValue(value) {
    for (let r = 0; r < this.matrix.length; r++) {
      for (let c = 0; c < this.matrix[r].length; c++) {
        if (this.get(r, c) === value) {
          return { r, c };
        }
      }
    }
    return null;
  }
}

function makeNodeMatrix(settings) {
  const { N, numPlayers } = settings;
  let m = [];
  for (let i = 0; i < N; i++)
    m.push((new Array(N)).fill(0));

  // add players
  const half = Math.floor(N/2);
  if (numPlayers > 3)
    m[half][N - 1] = 4;
  if (numPlayers > 2)
    m[half][0] = 3;
  m[0][half] = 1;
  m[N - 1][half] = 2;
  return m;
}
