
export default class AdjacencyList {
  constructor(settings) {
    this.settings = settings;
    this.list = makeList(settings);
  }

  getValue(fromId, toId) {
    if (this.hasEdge(fromId, toId)) {
      return this.list[fromId][toId];
    }
    return null;
  }

  setValue(fromId, toId, value) {
    if (this.hasEdge(fromId, toId)) {
      this.list[fromId][toId] = value;
      this.list[toId][fromId] = value;
    }
  }

  hasEdge(fromId, toId) {
    return this.list[fromId][toId] !== undefined;
  }

  edges() {
    let output = [];
    for (let i = 0; i < this.settings.N; i++) {
      for (let j = i + 1; j < this.settings.N; j++) {
        if (this.hasEdge(i, j)) {
          output.push({ from: i, to: j, val: this.getValue(i, j) });
        }
      }
    }
    return output;
  }
}

// create a core list object from a settings object
function makeList(settings) {
  const totalIds = settings.N*settings.N;
  let m = [];
  let i, j, iPos, jPos, rDiff, cDiff;
  for (i = 0; i < totalIds; i++) {
    m.push({});
    for (j = 0; j < totalIds; j++) {
      iPos = idToPos(i, settings);
      jPos = idToPos(j, settings);
      rDiff = Math.abs(iPos.r - jPos.r);
      cDiff = Math.abs(iPos.c - jPos.c);
      if ((cDiff === 1 && rDiff === 0) || (cDiff === 0 && rDiff === 1)) {
        m[i][j] = 0;
      }
    }
  }
  return m;
}
