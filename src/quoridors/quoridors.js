import * as helpers from './board-logic';
import { Utils } from './utils';

export class Quoridors {

  constructor(settings, eventHooks) {
    this.settings = settings;
    this.utils = new Utils(this.settings);
    this.eventHooks = eventHooks;
    this.reset();
  }

  reset() {
    this.adjacencyList = this.utils.initAdjacencyList();
    this.nodeMatrix = this.utils.initNodeMatrix();
    this.goals = this.utils.initGoals();
    this.setState({
      turn: 1,
      horizontalEdge: true,
      mode: 'move',
      finished: false
    });
  }

  handleMove(pos) {
    const { turn } = this;
    const currPos = this.posOfPlayer(turn);
    if (this.isValidMove(currPos, pos)) {
      this.move(currPos, pos);
      if (this.hasWon(turn, pos)) {
        this.setState({finished: true});
      } else {
        this.setState({turn: 1 + turn % this.settings.numPlayers});
      }
    } else {
      alert('invalid move');
    }
  }

  // a quadrant is 4 node ids
  handlePlace(quadrant) {
    let toPlace, perp;
    let { top, left, bottom, right } = helpers.getQuadrantEdges(quadrant);
    let { turn, horizontalEdge, adjacencyList } = this;
    if (horizontalEdge) {
      toPlace = [left, right];
      perp = [top, bottom];
    } else {
      toPlace = [top, bottom];
      perp = [left, right];
    }
    if (this.isValidPlacement(toPlace) && this.noOverlap(perp)) {
      this.adjacencyList = helpers.place(adjacencyList, turn, toPlace);
      this.setState({ turn: 1 + (turn) % this.settings.numPlayers });
    } else {
      alert('invalid placement');
    }
  }

  // check if a move is valid given current game state
  isValidMove(fromPos, toPos) {
    const fromId = this.utils.posToId(fromPos);
    const toId = this.utils.posToId(toPos);
    const dirs = helpers.getDirections();
    const visited = new Set();
    const moves = new Set();
    visited.add(fromId);
    dirs.forEach(dir => this.getMoves(fromPos, dir, visited, moves));
    return moves.has(toId);
  }

  // get the r and c of a player id
  posOfPlayer(pid) {
    const { nodeMatrix } = this;
    for (let r = 0; r < nodeMatrix.length; r++) {
      for (let c = 0; c < nodeMatrix[r].length; c++) {
        if (nodeMatrix[r][c] === pid) {
          return { r, c };
        }
      }
    }
    return null;
  }

  // check if a set of edge placements is valid given current game state
  isValidPlacement(edges) {
    const { goals, adjacencyList } = this;
    const edgeThere = edges.reduce(
      (acc, {from, to}) => acc || adjacencyList[from][to] !== 0,
      false
    );
    const hypotheticalAdjacencyList = helpers.place(adjacencyList, -1, edges);
    const playerStuck =
      [...Array(this.settings.numPlayers).keys()]
      .map(i => i + 1)
      .map(id => !helpers.pathExists(this.utils.idToPos, hypotheticalAdjacencyList, this.utils.posToId(this.posOfPlayer(id)), goals[id]))
      .reduce((acc, curr) => acc || curr, false);
    return !(playerStuck || edgeThere);
  }

  move(from, to) {
    const { nodeMatrix } = this;
    nodeMatrix[to.r][to.c] = nodeMatrix[from.r][from.c];
    nodeMatrix[from.r][from.c] = 0;
  }

  noOverlap(perp) {
    const { adjacencyList } = this;
    const [edge1, edge2] = perp;
    return adjacencyList[edge1.from][edge1.to] === 0 || adjacencyList[edge2.from][edge2.to] === 0
  }

  hasWon(pid, pos) {
    const { goals } = this;
    const anyRow = goals[pid].r === undefined;
    const anyCol = goals[pid].c === undefined;
    return (anyRow || pos.r === goals[pid].r) && (anyCol || goals[pid].c === pos.c);
  }

  getMoves(src, dir, visited, moves) {
    const { nodeMatrix, adjacencyList, turn } = this;
    const pos = helpers.sumPositions(src, dir);

    const posId = this.utils.posToId(pos);
    if (visited.has(posId)) {
      return;
    } else {
      visited.add(posId);
    }

    // out of bounds
    if (!this.utils.posInBounds(pos)) {
      return;
    }

    // edge in the way?
    if (adjacencyList[this.utils.posToId(src)][this.utils.posToId(pos)] !== 0) {
      const val = nodeMatrix[src.r][src.c];
      if (val !== 0 && val !== turn) {
        helpers.getPerpendicularDirections(dir).forEach(newDir => {
          this.getMoves(src, newDir, visited, moves);
        });
      }
      return;
    }

    const toVal = nodeMatrix[pos.r][pos.c];
    if (toVal !== 0 && toVal !== turn) {
      this.getMoves(pos, dir, visited, moves);
    } else {
      moves.add(posId);
    }
  }

  execHooks(event) {
    this.eventHooks[event].forEach(fun => {
      fun(this);
    });
  }

  setState(next) {
    Object.entries(next).forEach(([key, value]) => {
      this[key] = value;
    });
    this.execHooks('state-change');
  }
}
