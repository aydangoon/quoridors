import React from 'react';
import { Colors } from './quoridors';

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
    const quoridors                     = this.props.quoridors;
    const { nodeMatrix, adjacencyList } = quoridors;
    const utils                         = quoridors.utils;
    const { N }                         = quoridors.settings;

    const boardSide = ctx.canvas.width;
    const tileSide = boardSide / N;
    const edgeShortSide = 0.2 * tileSide;
    const nodeSide = tileSide - edgeShortSide;

    ctx.clearRect(0, 0, boardSide, boardSide);

    // background color
    ctx.fillStyle = Colors.EDGE;
    ctx.fillRect(0, 0, boardSide, boardSide);

    let topX, topY, r, c, from, to;

    // draw nodes and players
    ctx.fillStyle = Colors.NODE;
    for (r = 0; r < nodeMatrix.length; r++) {
      for (c = 0; c < nodeMatrix[r].length; c++) {
        topX = (edgeShortSide / 2) + (c * tileSide);
        topY = (edgeShortSide / 2) + (r * tileSide);
        ctx.fillRect(topX, topY, nodeSide, nodeSide);
        if (nodeMatrix[r][c] > 0) {
          ctx.fillStyle = Colors.PLAYERS[nodeMatrix[r][c]];
          ctx.fillRect(topX + nodeSide / 4, topY + nodeSide / 4, nodeSide / 2, nodeSide / 2);
          ctx.fillStyle = Colors.NODE;
        }
      }
    }

    // draw edges
    let width, height;
    for (from = 0; from < adjacencyList.length; from++) {
      for (to = from + 1; to < adjacencyList.length; to++) {
        if (adjacencyList[from][to] === undefined) {
          continue;
        }
        const val = adjacencyList[from][to];
        if (val <= 0) {
          continue;
        }
        const fromPos = utils.idToPos(from);
        if (utils.isHorizontalEdge(from, to)) {
          topX = fromPos.c * tileSide;
          topY = (fromPos.r * tileSide) + (edgeShortSide / 2) + nodeSide;
          width = tileSide;
          height = edgeShortSide;
        } else {
          topY = fromPos.r * tileSide;
          topX = (fromPos.c * tileSide) + (edgeShortSide / 2) + nodeSide;
          width = edgeShortSide;
          height = tileSide;
        }
        ctx.fillStyle = Colors.PLAYERS[val];
        ctx.fillRect(topX, topY, width, height);
      }
    }
  }

  coordsToPos(x, y) {
    const { N } = this.props.quoridors.settings;
    const ctx = this.canvasRef.current.getContext('2d');
    const tileSide = ctx.canvas.width / N;
    return {
      r: Math.floor(y / tileSide),
      c: Math.floor(x / tileSide)
    };
  }

  coordsToQuadrant(x, y) {
    const utils = this.props.quoridors.utils;
    const { N } = this.props.quoridors.settings;
    const ctx = this.canvasRef.current.getContext('2d');
    const tileSide = ctx.canvas.width / N;

    const topLeft = {
      r: Math.floor((y - (tileSide / 2)) / tileSide),
      c: Math.floor((x - (tileSide / 2)) / tileSide)
    }

    return {
      topLeft: utils.posToId(topLeft),
      topRight: utils.posToId(topLeft.r, topLeft.c + 1),
      bottomLeft: utils.posToId(topLeft.r + 1, topLeft.c),
      bottomRight: utils.posToId(topLeft.r + 1, topLeft.c + 1)
    };
  }

  getClickData(e) {
    const rect = this.canvasRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left);
    const y = (e.clientY - rect.top);
    return {
      pos: this.coordsToPos(x, y),
      quadrant: this.coordsToQuadrant(x, y)
    };
  }

  render() {
    return (
      <canvas ref={this.canvasRef} width="600" height="600" style={{width: '600px', height: '600px'}}
        onClick={e => this.props.handleClick(this.getClickData(e))} />
    );
  }
}
