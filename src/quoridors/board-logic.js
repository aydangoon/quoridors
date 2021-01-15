import { N, Colors, PLAYERS } from './consts';
const GOALS = {
  '1': { r: N-1 },
  '2': { r: 0 },
  '3': { c: N-1 },
  '4': { c: 0 }
};

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

export function initAdjacencyMatrix(settings) {
  const { N } = settings;
  let m = [];
  let i, j, iPos, jPos, rDiff, cDiff;
  for (i = 0; i < N*N; i++) {
    m.push([]);
    for (j = 0; j < N*N; j++) {
      iPos = idToPos(i);
      jPos = idToPos(j);
      rDiff = Math.abs(iPos.r - jPos.r);
      cDiff = Math.abs(iPos.c - jPos.c);
      m[i].push(((cDiff === 1 && rDiff === 0) || (cDiff === 0 && rDiff === 1)) ? 0 : -1);
    }
  }
  return m;
}

export function posToId() {
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

export function idToPos(id) {
  return { r: Math.floor(id / N), c: id % N};
}

// Expects edge (idA, idB) to exist.
export function isHorizontalEdge(idA, idB) {
  const aPos = idToPos(idA);
  const bPos = idToPos(idB);
  return aPos.r - bPos.r !== 0;
}

export function posOfPlayer(nodeMatrix, pid) {
  for (let r = 0; r < nodeMatrix.length; r++) {
    for (let c = 0; c < nodeMatrix[r].length; c++) {
      if (nodeMatrix[r][c] === pid) {
        return { r, c };
      }
    }
  }
  return null;
}

export function isValidMove(nodeMatrix, adjacencyMatrix, from, to) {
  const fromId = posToId(from);
  const toId = posToId(to);
  const path = getPath(adjacencyMatrix, fromId, to);
  const jumps = path.reduce((acc, curr) => {
    let {r, c} = idToPos(curr);
    return acc + (nodeMatrix[r][c] > 0 ? 1 : 0);
  }, 0);
  return nodeMatrix[to.r][to.c] === 0 && path && path.length === jumps + 1;
}

export function getPath(adjacencyMatrix, src, goal) {
  const anyRow = goal.r === undefined;
  const anyCol = goal.c === undefined;
  const marked = new Set(); // set of visited node ids
  marked.add(src);
  const parentOf = {};
  const queue = [src];
  let node, i, children, child;
  while (queue.length > 0) {
    console.log(queue, marked);
    node = queue.shift();
    children = neighbors(adjacencyMatrix, node);
    //console.log(node, children);
    for (i = 0; i < children.length; i++) {
      child = children[i];
      if (!marked.has(child)) {
        marked.add(child);
        parentOf[child] = node;
        queue.push(child);
      }
      let { r, c } = idToPos(child);
      if ((anyCol || goal.c === c) && (anyRow || goal.r === r)) {
        console.log('WE ESCAPED');
        let path = [];
        while (child) {
          path.push(child);
          child = parentOf[child];
        }
        return path;
      }
    }
  }
  return null;
}

export function neighbors(adjacencyMatrix, nodeId) {
  console.log('NODE ID', nodeId);
  const ids = [];
  adjacencyMatrix[nodeId].forEach((val, i) => {
    if (val === 0) {
      ids.push(i);
    }
  });
  return ids;
}

export function isValidPlacement(nodeMatrix, adjacencyMatrix, edges) {
  const noEdgeThere = edges.reduce(
    (acc, {from, to}) => acc && (adjacencyMatrix[from][to] === 0),
    true
  );
  if (!noEdgeThere) {
    console.log('edge already there');
    return false;
  }

  place(adjacencyMatrix, -1, edges);
  const noPlayerStuck =
    [1, 2]
    .map(id => getPath(adjacencyMatrix, posToId(posOfPlayer(nodeMatrix, id)), GOALS[id]))
    .reduce((acc, curr) => acc && (curr ? true : false), true);
  place(adjacencyMatrix, 0, edges);
  if (!noPlayerStuck) {
    console.log('A PLAYER IS NOW STUCK');
    return false;
  }
  return true;
}

// from and to are positions
export function move(nodeMatrix, from, to) {
  nodeMatrix[to.r][to.c] = nodeMatrix[from.r][from.c];
  nodeMatrix[from.r][from.c] = 0;
  return nodeMatrix;
}

// from and to are ids
export function place(adjacencyMatrix, pid, edges) {
  edges.forEach(({ from, to }) => {
    adjacencyMatrix[from][to] = pid;
    adjacencyMatrix[to][from] = pid;
  });
  return adjacencyMatrix;
}

export function hasWon(pid, pos) {
  const anyRow = GOALS[pid].r === undefined;
  const anyCol = GOALS[pid].c === undefined;
  return (anyRow || pos.r === GOALS[pid].r) && (anyCol || GOALS[pid].c === pos.c);
}
