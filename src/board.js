import React from 'react';
import { drawBoard, coordsToPos, coordsToQuadrant } from './quoridors';

// Manages the drawing of the board as well as collecting data about
// a users click. No other logic.
export default class Board extends React.Component {

  constructor(props) {
    super(props);
    this.canvasRef = React.createRef();
  }
  componentDidMount() {
    this.draw();
  }
  componentDidUpdate() {
    this.draw();
  }

  draw() {
    const ctx = this.canvasRef.current.getContext('2d');
    const { nodeMatrix, adjacencyMatrix } = this.props;
    drawBoard(ctx, nodeMatrix, adjacencyMatrix);
  }

  getClickData(e) {
    const canvas = this.canvasRef.current;
    const ctx = canvas.getContext('2d');
    const rect = canvas.getBoundingClientRect();
    const x = (e.clientX - rect.left);
    const y = (e.clientY - rect.top);
    return {
      pos: coordsToPos(ctx, x, y),
      quadrant: coordsToQuadrant(ctx, x, y)
    };
  }

  render() {
    return (
      <canvas ref={this.canvasRef} width="600" height="600" style={{width: '600px', height: '600px'}}
        onClick={e => this.props.handleClick(this.getClickData(e))} />
    );
  }
}
