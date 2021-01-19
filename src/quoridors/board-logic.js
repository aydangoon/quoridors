import _ from 'lodash';

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

export function place(adjacencyList, pid, edges) {
  const li = _.cloneDeep(adjacencyList);
  edges.forEach(({ from, to }) => {
    li[from][to] = pid;
    li[to][from] = pid;
  });
  return li;
}

export function getPerpendicularDirections(dir) {
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

export function getDirections() {
  return [{r:0, c:1}, {r:0,c:-1}, {r:1,c:0}, {r:-1, c:0}];
}

export function sumPositions(...positions) {
  let res = {r: 0, c: 0};
  positions.forEach(({r, c}) => {
    res.r += r;
    res.c += c;
  });
  return res;
}

export function getQuadrantEdges(quadrant) {
  let top = {
    from: quadrant.topLeft,
    to: quadrant.topRight
  };
  let right = {
    from: quadrant.topRight,
    to: quadrant.bottomRight
  };
  let bottom = {
    from: quadrant.bottomRight,
    to: quadrant.bottomLeft
  };
  let left = {
    from: quadrant.bottomLeft,
    to: quadrant.topLeft
  };
  return { top, right, bottom, left };
}
