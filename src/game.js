import React from 'react';
import * as Q from './quoridors';
import Board from './board';

export default class Game extends React.Component {
  constructor(props) {
    super(props);
    this.settings = this.props;
    console.log('game constructor called');
    this.reset();
  }

  reset() {
    this.state = {
      turn: 1,
      mode: 'move',
      finished: false,
      horizontalEdge: true,
      nodeMatrix: Q.initNodeMatrix(this.settings),
      adjacencyMatrix: Q.initAdjacencyMatrix(this.settings)
    };
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
    if (Q.isValidMove(nodeMatrix, adjacencyMatrix, currPos, pos)) {
      Q.move(nodeMatrix, currPos, pos);
      if (Q.hasWon(turn, pos)) {
        this.setState({ finished: true });
      }
      this.setState({ turn: 1 + turn % this.props.numPlayers });
    } else {
      alert('invalid move');
    }
  }

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

  // a quadrant is 4 positions
  handlePlace(quadrant) {
    let edge1, edge2;
    const pid = this.state.turn;
    const adjacencyMatrix = this.state.adjacencyMatrix;
    const nodeMatrix = this.state.nodeMatrix;
    if (this.state.horizontalEdge) {
      edge1 = {
        from: Q.posToId(quadrant.topLeft),
        to: Q.posToId(quadrant.bottomLeft)
      };
      edge2 = {
        from: Q.posToId(quadrant.topRight),
        to: Q.posToId(quadrant.bottomRight)
      }
    } else {
      edge1 = {
        from: Q.posToId(quadrant.topLeft),
        to: Q.posToId(quadrant.topRight)
      };
      edge2 = {
        from: Q.posToId(quadrant.bottomLeft),
        to: Q.posToId(quadrant.bottomRight)
      }
    }
    if (Q.isValidPlacement(nodeMatrix, adjacencyMatrix, [edge1, edge2])) {
      this.setState({
        turn: 1 + (pid) % this.props.numPlayers,
        adjacencyMatrix: Q.place(adjacencyMatrix, pid, [edge1, edge2])
      });
    } else {
      alert('invalid placement');
    }
  }

  render() {
    return (
      <div>
        <Board {...this.state} handleClick={this.handleClick.bind(this)}/>
        <p>Player {this.state.turn}'s turn.</p>
        <p>Mode: {this.state.mode} </p>
        <p>Horizontal Edge: {this.state.horizontalEdge.toString()} </p>
        {this.state.finished ? <button>Play Again</button> : <React.Fragment />}
      </div>
    );
  };
}
