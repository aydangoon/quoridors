import React from 'react';
import { Quoridors } from './quoridors';
import Board from './board';


export default class QuoridorWrapper extends React.Component {

  constructor(props) {
    super(props);
    this.quoridors = new Quoridors(this.props, {
      'state-change' : [
        ({turn, mode, finished, horizontalEdge}) => {
          this.setState({
            turn: turn,
            mode: mode,
            finished: finished,
            horizontalEdge: horizontalEdge
          });
        }
      ]
    });
    this.state = {
      turn: 1,
      mode: 'move',
      finished: false,
      horizontalEdge: true
    };
    this.reset = this.reset.bind(this);
  }

  reset() {
    this.quoridors.reset();
  }

  componentDidMount() {
    window.addEventListener('keydown', e => {
      switch (e.keyCode) {
        case 32: // spacebar
          this.quoridors.setState({
            mode: this.quoridors.mode === 'move' ? 'place' : 'move'
          });
          break;
        default: // arrow keys
          this.quoridors.setState({ horizontalEdge: !this.quoridors.horizontalEdge });
          break;
      }
    });
  }

  render() {
    return (
      <div>
        <Board {...this.state}
          handleClick={this.handleClick.bind(this)}
          quoridors={this.quoridors} />
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
      this.quoridors.handleMove(pos);
    } else {
      this.quoridors.handlePlace(quadrant);
    }
  }
}
