export function initNodeMatrix(settings) {
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

export function initAdjacencyList(idToPos, settings) {
  const { N } = settings;
  let m = [];
  let i, j, iPos, jPos, rDiff, cDiff;
  for (i = 0; i < N*N; i++) {
    m.push({});
    for (j = 0; j < N*N; j++) {
      iPos = idToPos(i);
      jPos = idToPos(j);
      rDiff = Math.abs(iPos.r - jPos.r);
      cDiff = Math.abs(iPos.c - jPos.c);
      if ((cDiff === 1 && rDiff === 0) || (cDiff === 0 && rDiff === 1)) {
        m[i][j] = 0;
      }
    }
  }
  console.log(m);
  return m;
}

export function initGoals(settings) {
  const { N } = settings;
  return {
    '1': { r: N-1 },
    '2': { r: 0 },
    '3': { c: N-1 },
    '4': { c: 0 }
  };
}

export function pathExists(idToPos, adjacencyList, src, goal) {
  const anyRow = goal.r === undefined;
  const anyCol = goal.c === undefined;
  const marked = new Set(); // set of visited node ids
  marked.add(src);
  const queue = [src];
  let node, i, children, child;
  while (queue.length > 0) {
    node = queue.shift();
    children = neighbors(adjacencyList, node);
    for (i = 0; i < children.length; i++) {
      child = children[i];
      if (!marked.has(child)) {
        marked.add(child);
        queue.push(child);
      }
      let { r, c } = idToPos(child);
      if ((anyCol || goal.c === c) && (anyRow || goal.r === r)) {
        return true;
      }
    }
  }
  return false;
}

export function neighbors(adjacencyList, nodeId) {
  const ids = [];
  Object.entries(adjacencyList[nodeId]).forEach(([id, val]) => {
    if (parseInt(val) === 0) {
      ids.push(parseInt(id));
    }
  });
  return ids;
}

export function swapDir(dir) {
  let dir1, dir2;
  if (dir.c !== 0) {
    dir1 = { r: -1, c: 0 };
    dir2 = { r: 1, c: 0 };
  } else {
    dir1 = { c: -1, r: 0 };
    dir2 = { c: 1, r: 0 };
  }
  return { dir1, dir2 };
}
