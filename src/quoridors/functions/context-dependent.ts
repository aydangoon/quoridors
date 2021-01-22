import {
  getDirections,
  sumPositions,
  getPerpendicularDirections,
  neighbors,
  posInGoal
} from './helpers';
import { posToId, idToPos, getGoals, posInBounds } from './settings-dependent';
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

// Check if a move between positionsis valid given a game context.
export function isValidMove(context: QuoridorsContext, pid: number, from: Pos, to: Pos): boolean {
  const { settings } = context;
  const fromId = posToId(settings, from);
  const toId = posToId(settings, to);
  const dirs = getDirections();
  const visited: Set<NodeId> = new Set();
  const moves: Set<NodeId> = new Set();
  visited.add(fromId);
  dirs.forEach(dir => getMoves(context, pid, from, dir, visited, moves));
  return moves.has(toId);
}

// Get the position of a player by id given a game context.
export function posOfPlayer({ q }: QuoridorsContext, pid: number): Pos {
  const { nodeMatrix } = q;
  for (let r = 0; r < nodeMatrix.length; r++) {
    for (let c = 0; c < nodeMatrix[r].length; c++) {
      if (nodeMatrix[r][c] === pid) {
        return { r, c };
      }
    }
  }
  return {r: -1, c: -1};
}

// check if a set of edge placements is valid given current game state
export function isValidPlacement(context: QuoridorsContext, edges: Array<Edge>): boolean {
  const { settings, q } = context;
  const { adjacencyList, nodeMatrix } = q;
  const goals = getGoals(settings);
  const edgeThere = edges.reduce(
    (acc, {from, to}) => acc || adjacencyList[from][to] !== 0,
    false
  );
  const temp = place(context, -1, edges);
  const playerStuck =
    [...Array(settings.numPlayers).keys()]
    .map(i => i + 1)
    .map(id => {
      const src = posToId(settings, posOfPlayer(context, id));
      const goal = goals[id];
      const tempContext: QuoridorsContext = {
        settings: settings,
        q: { nodeMatrix: nodeMatrix, adjacencyList: temp}
      };
      return !pathExists(tempContext, src, goal);
    })
    .reduce((acc, curr) => acc || curr, false);
  return !(playerStuck || edgeThere);
}

export function move({q}: QuoridorsContext, from: Pos, to: Pos): Array<Array<number>> {
  const { nodeMatrix } = q;
  const ma = _.cloneDeep(nodeMatrix);
  ma[to.r][to.c] = ma[from.r][from.c];
  ma[from.r][from.c] = 0;
  return ma;
}

export function place({q}: QuoridorsContext, pid: number, edges: Array<Edge>): Array<NodeMap> {
  const { adjacencyList } = q;
  const li = _.cloneDeep(adjacencyList);
  edges.forEach(({ from, to }) => {
    li[from][to] = pid;
    li[to][from] = pid;
  });
  return li;
}

export function noOverlap({q}: QuoridorsContext, perp: Array<Edge>): boolean {
  const { adjacencyList } = q;
  const [edge1, edge2] = perp;
  return adjacencyList[edge1.from][edge1.to] === 0 || adjacencyList[edge2.from][edge2.to] === 0
}

export function hasWon({settings}: QuoridorsContext, pid: number, pos: Pos): boolean {
  const goal = getGoals(settings)[pid];
  return posInGoal(pos, goal);
}

export function getMoves(context: QuoridorsContext, pid: number, src: Pos, dir: Pos, visited: Set<NodeId>, moves: Set<NodeId>) {
  const { settings, q } = context;
  const { nodeMatrix, adjacencyList } = q;
  const pos = sumPositions(src, dir);

  const posId = posToId(settings, pos);
  if (visited.has(posId)) {
    return;
  } else {
    visited.add(posId);
  }

  // out of bounds
  if (!posInBounds(settings, pos)) {
    return;
  }

  // edge in the way?
  if (adjacencyList[posToId(settings, src)][posToId(settings, pos)] !== 0) {
    const val = nodeMatrix[src.r][src.c];
    if (val !== 0 && val !== pid) {
      getPerpendicularDirections(dir).forEach(newDir => {
        getMoves(context, pid, src, newDir, visited, moves);
      });
    }
    return;
  }

  const toVal = nodeMatrix[pos.r][pos.c];
  if (toVal !== 0 && toVal !== pid) {
    getMoves(context, pid, pos, dir, visited, moves);
  } else {
    moves.add(posId);
  }
}

export function pathExists(context: QuoridorsContext, src: NodeId, goal: Goal): boolean {
  const { settings, q } = context;
  const { adjacencyList } = q;
  const marked = new Set(); // set of visited node ids
  marked.add(src);
  const queue = [src];
  let node, i, children, child;
  while (queue.length > 0) {
    node = queue.shift() as number;
    children = neighbors(adjacencyList, node);
    for (i = 0; i < children.length; i++) {
      child = children[i];
      if (!marked.has(child)) {
        marked.add(child);
        queue.push(child);
      }
      if (posInGoal(idToPos(settings, child), goal)) {
        return true;
      }
    }
  }
  return false;
}
