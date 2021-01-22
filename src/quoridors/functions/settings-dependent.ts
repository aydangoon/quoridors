import {
  Pos,
  QuoridorsContext,
  Edge,
  Settings,
  NodeMap,
  EdgeMap,
  Goal,
  GoalMap,
  NodeId,
  Quadrant
} from '../../types';
const _ = require('lodash');

export function posToId(settings: Settings, pos: Pos): NodeId {
  const { numSides } = settings;
  const { r, c } = pos;
  return numSides*r + c;
}

export function idToPos(settings: Settings, id: NodeId): Pos {
  const { numSides } = settings;
  return { r: Math.floor(id / numSides), c: id % numSides };
}

export function isHorizontalEdge(settings: Settings, a: NodeId, b: NodeId): boolean {
  return idToPos(settings, a).r - idToPos(settings, b).r !== 0;
}

export function initNodeMatrix(settings: Settings): Array<Array<number>> {
  const { numSides, numPlayers } = settings;
  let m = [];
  for (let i = 0; i < numSides; i++)
    m.push((new Array(numSides)).fill(0));

  // add players
  const half = Math.floor(numSides/2);
  if (numPlayers > 3)
    m[half][numSides - 1] = 4;
  if (numPlayers > 2)
    m[half][0] = 3;
  m[0][half] = 1;
  m[numSides - 1][half] = 2;
  return m;
}

export function initAdjacencyList(settings: Settings): Array<NodeMap> {
  const { numSides } = settings;
  let m = [];
  let i, j, iPos, jPos, rDiff, cDiff, map: NodeMap;
  for (i = 0; i < numSides*numSides; i++) {
    map = {};
    m.push(map);
    for (j = 0; j < numSides*numSides; j++) {
      iPos = idToPos(settings, i);
      jPos = idToPos(settings, j);
      rDiff = Math.abs(iPos.r - jPos.r);
      cDiff = Math.abs(iPos.c - jPos.c);
      if ((cDiff === 1 && rDiff === 0) || (cDiff === 0 && rDiff === 1)) {
        m[i][j] = 0;
      }
    }
  }
  return m;
}

export function getGoals(settings: Settings): GoalMap {
  const { numSides } = settings;
  return {
    '1': { r: numSides - 1 },
    '2': { r: 0 },
    '3': { c: numSides - 1 },
    '4': { c: 0 }
  };
}

export function posInBounds(settings: Settings, {r, c}: Pos): boolean {
  const { numSides } = settings;
  return r >= 0 && c >= 0 && r < numSides && c < numSides;
}
