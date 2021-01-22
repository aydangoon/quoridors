import { Component, Fragment } from 'react';
import * as Q from './quoridors/';
import Board from './board';
import { Settings, QuoridorState, Pos, Quadrant, QuoridorsContext } from './types';

export default class Quoridors extends Component<Settings, QuoridorState> {

  constructor(props: Settings) {
    super(props);
    this.state = {
      turn: 1,
      mode: 'move',
      finished: false,
      horizontalEdge: true,
      nodeMatrix: Q.initNodeMatrix(props),
      adjacencyList: Q.initAdjacencyList(props)
    };
    this.reset = this.reset.bind(this);
  }

  reset() {
    this.setState({
      turn: 1,
      mode: 'move',
      finished: false,
      horizontalEdge: true,
      nodeMatrix: Q.initNodeMatrix(this.props),
      adjacencyList: Q.initAdjacencyList(this.props)
    });
  }

  handleMove(pos: Pos): void {
    const context: QuoridorsContext = { q: this.state, settings: this.props };
    const { turn } = this.state;
    const currPos = Q.posOfPlayer(context, turn);
    if (Q.isValidMove(context, turn, currPos, pos)) {
      const newNodeMatrix = Q.move(context, currPos, pos);
      if (Q.hasWon(context, turn, pos)) {
        this.setState({nodeMatrix: newNodeMatrix, finished: true});
      } else {
        this.setState({nodeMatrix: newNodeMatrix, turn: 1 + turn % this.props.numPlayers});
      }
    } else {
      alert('invalid move');
    }
  }

  // a quadrant is 4 node ids
  handlePlace(quadrant: Quadrant): void {
    const context: QuoridorsContext = { q: this.state, settings: this.props };
    let toPlace, perp;
    let { top, left, bottom, right } = Q.getQuadrantEdges(quadrant);
    let { turn, horizontalEdge } = this.state;
    if (horizontalEdge) {
      toPlace = [left, right];
      perp = [top, bottom];
    } else {
      toPlace = [top, bottom];
      perp = [left, right];
    }
    if (Q.isValidPlacement(context, toPlace) && Q.noOverlap(context, perp)) {
      this.setState({
        adjacencyList: Q.place(context, turn, toPlace),
        turn: 1 + (turn) % this.props.numPlayers
      });
    } else {
      alert('invalid placement');
    }
  }

  componentDidMount() {
    window.addEventListener('keydown', e => {
      switch (e.keyCode) {
        case 32: // spacebar
          this.setState({ mode: this.state.mode === 'move' ? 'place' : 'move'});
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
        <Board q={this.state} settings={this.props}
          handleClick={this.handleClick.bind(this)} />
        <p>Player {this.state.turn}'s turn.</p>
        <p>Mode:{this.state.mode} </p>
        <p>Horizontal Edge: {this.state.horizontalEdge.toString()} </p>
        {this.state.finished ? <button onClick={this.reset}>Play Again</button> : <Fragment />}
      </div>
    );
  };

  // data is a position and a quadrant
  handleClick({ pos, quadrant }: {pos: Pos, quadrant: Quadrant}) {
    if (this.state.mode === 'move') {
      this.handleMove(pos);
    } else {
      this.handlePlace(quadrant);
    }
  }
}
