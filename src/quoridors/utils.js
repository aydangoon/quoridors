export class Utils {
  constructor(settings) {
    this.settings = settings;
    this.idToPos = this.idToPos.bind(this);
    this.posToId = this.posToId.bind(this);
    this.posInBounds = this.posInBounds.bind(this);
  }

  posToId() {
    const { N } = this.settings;
    let r, c;
    if (typeof arguments[0] === 'object') {
      r = arguments[0].r;
      c = arguments[0].c;
    } else {
      r = arguments[0];
      c = arguments[1];
    }
    return N*r + c;
  }

  // turn an id into an r and c value
  idToPos(id) {
    const { N } = this.settings;
    return { r: Math.floor(id / N), c: id % N };
  }

  isHorizontalEdge(idA, idB) {
    return this.idToPos(idA).r - this.idToPos(idB).r !== 0;
  }

  initNodeMatrix() {
    const { N, numPlayers } = this.settings;
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

  initAdjacencyList() {
    const { N } = this.settings;
    let m = [];
    let i, j, iPos, jPos, rDiff, cDiff;
    for (i = 0; i < N*N; i++) {
      m.push({});
      for (j = 0; j < N*N; j++) {
        iPos = this.idToPos(i);
        jPos = this.idToPos(j);
        rDiff = Math.abs(iPos.r - jPos.r);
        cDiff = Math.abs(iPos.c - jPos.c);
        if ((cDiff === 1 && rDiff === 0) || (cDiff === 0 && rDiff === 1)) {
          m[i][j] = 0;
        }
      }
    }
    return m;
  }

  initGoals() {
    const { N } = this.settings;
    return {
      '1': { r: N-1 },
      '2': { r: 0 },
      '3': { c: N-1 },
      '4': { c: 0 }
    };
  }

  posInBounds(pos) {
    const { N } = this.settings;
    return pos.r >= 0 && pos.c >= 0 && pos.r < N && pos.c < N;
  }

}
