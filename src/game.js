import React from 'react';
import * as Q from './quoridors';
import Board from './board';

export default class Game extends React.Component {

  // React Component Overrides -------------------------------------------------

  constructor(props) {
    super(props);
    this.settings = this.props;
    this.idToPos = this.idToPos.bind(this);
    this.reset = this.reset.bind(this);
    this.state = {
      turn: 1,
      mode: 'move',
      finished: false,
      horizontalEdge: true,
      goals: Q.initGoals(this.settings),
      nodeMatrix: Q.initNodeMatrix(this.settings),
      adjacencyMatrix: Q.initAdjacencyMatrix(this.idToPos, this.settings)
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
      adjacencyMatrix: Q.initAdjacencyMatrix(this.idToPos, this.settings)
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
    const { turn, nodeMatrix, adjacencyMatrix } = this.state;
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

  // a quadrant is 4 positions
  handlePlace(quadrant) {
    let edge1, edge2;
    const { turn, adjacencyMatrix, nodeMatrix, horizontalEdge } = this.state;
    if (horizontalEdge) {
      edge1 = {
        from: this.posToId(quadrant.topLeft),
        to: this.posToId(quadrant.bottomLeft)
      };
      edge2 = {
        from: this.posToId(quadrant.topRight),
        to: this.posToId(quadrant.bottomRight)
      }
    } else {
      edge1 = {
        from: this.posToId(quadrant.topLeft),
        to: this.posToId(quadrant.topRight)
      };
      edge2 = {
        from: this.posToId(quadrant.bottomLeft),
        to: this.posToId(quadrant.bottomRight)
      }
    }
    if (this.isValidPlacement([edge1, edge2])) {
      this.setState({
        turn: 1 + (turn) % this.props.numPlayers,
        adjacencyMatrix: this.place(turn, [edge1, edge2])
      });
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
    const { nodeMatrix, adjacencyMatrix } = this.state;
    const fromId = this.posToId(fromPos);
    const toId = this.posToId(toPos);
    const path = Q.getPath(this.idToPos, adjacencyMatrix, fromId, toPos);
    const jumps = path.reduce((acc, curr) => {
      let {r, c} = this.idToPos(curr);
      return acc + (nodeMatrix[r][c] > 0 ? 1 : 0);
    }, 0);
    return nodeMatrix[toPos.r][toPos.c] === 0 && path && path.length === jumps + 1;
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
    const { goals, nodeMatrix, adjacencyMatrix } = this.state;
    const noEdgeThere = edges.reduce(
      (acc, {from, to}) => acc && (adjacencyMatrix[from][to] === 0),
      true
    );
    if (!noEdgeThere) {
      console.log('edge already there');
      return false;
    }

    this.place(-1, edges);
    const noPlayerStuck =
      (new Array(this.settings.numPlayers))
      .fill(0)
      .map((val, i) => i + 1)
      .map(id => Q.getPath(this.idToPos, adjacencyMatrix, this.posToId(this.posOfPlayer(id)), goals[id]))
      .reduce((acc, curr) => acc && (curr ? true : false), true);
    this.place(0, edges);
    if (!noPlayerStuck) {
      console.log('A PLAYER IS NOW STUCK');
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
    const { adjacencyMatrix } = this.state;
    edges.forEach(({ from, to }) => {
      adjacencyMatrix[from][to] = pid;
      adjacencyMatrix[to][from] = pid;
    });
    return adjacencyMatrix;
  }

  hasWon(pid, pos) {
    const { goals } = this.state;
    const anyRow = goals[pid].r === undefined;
    const anyCol = goals[pid].c === undefined;
    return (anyRow || pos.r === goals[pid].r) && (anyCol || goals[pid].c === pos.c);
  }

}
