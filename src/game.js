import React from 'react';
import * as Q from './quoridors';
import Board from './board';

export default class Game extends React.Component {

  // React Component Overrides -------------------------------------------------

  constructor(props) {
    super(props);
    this.settings = this.props;
    this.idToPos = this.idToPos.bind(this);
    this.posToId = this.posToId.bind(this);
    this.reset = this.reset.bind(this);
    this.state = {
      turn: 1,
      mode: 'move',
      finished: false,
      horizontalEdge: true,
      goals: Q.initGoals(this.settings),
      nodeMatrix: Q.initNodeMatrix(this.settings),
      adjacencyList: Q.initAdjacencyList(this.idToPos, this.settings)
    };
  }

  reset() {
    this.setState({
      turn: 1,
      mode: 'move',
      finished: false,
      horizontalEdge: true,
      goals: Q.initGoals(this.settings),
      nodeMatrix: Q.initNodeMatrix(this.settings),
      adjacencyList: Q.initAdjacencyList(this.idToPos, this.settings)
    });
  }

  componentDidMount() {
    window.addEventListener('keydown', e => {
      switch (e.keyCode) {
        case 32: // spacebar
          this.setState({
            mode: this.state.mode === 'move' ? 'place' : 'move'
          });
          break;
        default: // arrow keys
          this.setState({ horizontalEdge: !this.state.horizontalEdge });
          break;
      }
    });
  }

  render() {
    return (
      <div>
        <Board {...this.state}
          handleClick={this.handleClick.bind(this)}
          idToPos={this.idToPos}
          posToId={this.posToId}
          isHorizontalEdge={this.isHorizontalEdge.bind(this)}
          settings={this.settings} />
        <p>Player {this.state.turn}'s turn.</p>
        <p>Mode: {this.state.mode} </p>
        <p>Horizontal Edge: {this.state.horizontalEdge.toString()} </p>
        {this.state.finished ? <button onClick={this.reset}>Play Again</button> : <React.Fragment />}
      </div>
    );
  };

  // Action Handlers -----------------------------------------------------------

  // data is a position and a quadrant
  handleClick({ pos, quadrant }) {
    if (this.state.mode === 'move') {
      this.handleMove(pos);
    } else {
      this.handlePlace(quadrant);
    }
  }

  // a single position
  handleMove(pos) {
    const { turn } = this.state;
    const currPos = this.posOfPlayer(turn);
    if (this.isValidMove(currPos, pos)) {
      this.move(currPos, pos);
      if (this.hasWon(turn, pos)) {
        this.setState({ finished: true });
      } else {
        this.setState({ turn: 1 + turn % this.props.numPlayers });
      }
    } else {
      alert('invalid move');
    }
  }

  // a quadrant is 4 node ids
  handlePlace(quadrant) {
    let edge1, edge2, edge3, edge4;
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
    const { turn, horizontalEdge, adjacencyList } = this.state;
    if (horizontalEdge) {
      edge1 = left;
      edge2 = right;
      edge3 = top;
      edge4 = bottom;
    } else {
      edge1 = top;
      edge2 = bottom;
      edge3 = left;
      edge4 = right;
    }
    if (this.isValidPlacement([edge1, edge2])) {
      if (adjacencyList[edge3.from][edge3.to] === 0 || adjacencyList[edge4.from][edge4.to] === 0) {
        this.setState({
          turn: 1 + (turn) % this.props.numPlayers,
          adjacencyList: this.place(turn, [edge1, edge2])
        });
      }
    } else {
      alert('invalid placement');
    }
  }

  // Quoridors Functions -------------------------------------------------------

  // turn an r and c value into a node id
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
    return { r: Math.floor(id / N), c: id % N};
  }

  // check if an edge is horizontal
  isHorizontalEdge(idA, idB) {
    return this.idToPos(idA).r - this.idToPos(idB).r !== 0;
  }

  // check if a move is valid given current game state
  isValidMove(fromPos, toPos) {
    const { nodeMatrix, adjacencyList } = this.state;
    const fromId = this.posToId(fromPos);
    const toId = this.posToId(toPos);
    const dirs = [{r:0, c:1}, {r:0,c:-1}, {r:1,c:0}, {r:-1, c:0}];
    const visited = new Set();
    const moves = new Set();
    visited.add(fromId);
    dirs.forEach(dir => this.getMoves(fromPos, dir, visited, moves));
    return moves.has(toId);
  }

  // get the r and c of a player id
  posOfPlayer(pid) {
    const { nodeMatrix } = this.state;
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
    const { goals, adjacencyList } = this.state;
    const noEdgeThere = edges.reduce(
      (acc, {from, to}) => acc && adjacencyList[from][to] === 0,
      true
    );
    if (!noEdgeThere) {
      return false;
    }
    this.place(-1, edges);
    const noPlayerStuck =
      (new Array(this.settings.numPlayers))
      .fill(0)
      .map((val, i) => i + 1)
      .map(id => Q.pathExists(this.idToPos, adjacencyList, this.posToId(this.posOfPlayer(id)), goals[id]))
      .reduce((acc, curr) => acc && curr, true);
    this.place(0, edges);
    if (!noPlayerStuck) {
      return false;
    }
    return true;
  }

  // move a piece
  move(from, to) {
    const { nodeMatrix } = this.state;
    nodeMatrix[to.r][to.c] = nodeMatrix[from.r][from.c];
    nodeMatrix[from.r][from.c] = 0;
    return nodeMatrix;
  }

  place(pid, edges) {
    const { adjacencyList } = this.state;
    edges.forEach(({ from, to }) => {
      adjacencyList[from][to] = pid;
      adjacencyList[to][from] = pid;
    });
    return adjacencyList;
  }

  hasWon(pid, pos) {
    const { goals } = this.state;
    const anyRow = goals[pid].r === undefined;
    const anyCol = goals[pid].c === undefined;
    return (anyRow || pos.r === goals[pid].r) && (anyCol || goals[pid].c === pos.c);
  }

  getMoves(src, dir, visited, moves) {
    const { N } = this.settings;
    const { nodeMatrix, adjacencyList, turn } = this.state;
    const pos = {r: src.r + dir.r, c: src.c + dir.c};

    const posId = this.posToId(pos);
    if (visited.has(posId)) {
      return;
    } else {
      visited.add(posId);
    }

    // out of bounds
    if (pos.r < 0 || pos.c < 0 || pos.r >= N || pos.c >= N) {
      return;
    }

    // edge in the way?
    if (adjacencyList[this.posToId(src)][this.posToId(pos)] !== 0) {
      const val = nodeMatrix[src.r][src.c];
      if (val !== 0 && val !== turn) {
        const { dir1, dir2 } = Q.swapDir(dir);
        this.getMoves(src, dir1, visited, moves);
        this.getMoves(src, dir2, visited, moves);
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

}
