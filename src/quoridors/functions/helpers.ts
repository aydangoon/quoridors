import {
  Pos,
  Edge,
  NodeMap,
  EdgeMap,
  NodeId,
  Quadrant,
  Goal
} from '../../types';
const _ = require('lodash');

export function neighbors(adjacencyList: Array<NodeMap>, nodeId: NodeId): Array<NodeId> {
  const ids: Array<NodeId> = [];
  Object.entries(adjacencyList[nodeId]).forEach(([id, val]) => {
    if (parseInt(val) === 0) {
      ids.push(parseInt(id));
    }
  });
  return ids;
}

export function getPerpendicularDirections(dir: Pos): Array<Pos> {
  let dir1, dir2;
  if (dir.c !== 0) {
    dir1 = { r: -1, c: 0 };
    dir2 = { r: 1, c: 0 };
  } else {
    dir1 = { c: -1, r: 0 };
    dir2 = { c: 1, r: 0 };
  }
  return [dir1, dir2];
}

export function getDirections(): Array<Pos> {
  return [{r:0, c:1}, {r:0,c:-1}, {r:1,c:0}, {r:-1, c:0}];
}

export function sumPositions(...positions: Array<Pos>): Pos {
  let res = {r: 0, c: 0};
  positions.forEach(({r, c}) => {
    res.r += r;
    res.c += c;
  });
  return res;
}

export function getQuadrantEdges(quadrant: Quadrant): EdgeMap {
  let top: Edge = {
    from: quadrant.topLeft,
    to: quadrant.topRight
  };
  let right: Edge = {
    from: quadrant.topRight,
    to: quadrant.bottomRight
  };
  let bottom: Edge = {
    from: quadrant.bottomRight,
    to: quadrant.bottomLeft
  };
  let left: Edge = {
    from: quadrant.bottomLeft,
    to: quadrant.topLeft
  };
  return { top, right, bottom, left };
}

export function posInGoal(pos: Pos, goal: Goal): boolean {
  const anyRow = goal.r === undefined;
  const anyCol = goal.c === undefined;
  return (anyCol || goal.c === pos.c) && (anyRow || goal.r === pos.r);
}
