import React from 'react';
import { Colors } from './quoridors/';
import * as Q from './quoridors/';
import { Settings, QuoridorState, Pos, Quadrant, QuoridorsContext } from './types';

// Manages the drawing of the board as well as collecting data about
// a users click. No other state or logic.
export default class Board extends React.Component<QuoridorsContext, {}> {
  canvasRef: any;
  constructor(props: QuoridorsContext) {
    super(props);
    this.canvasRef = React.createRef();
  }
  componentDidMount() {
    this.draw();
  }
  componentDidUpdate() {
    this.draw();
  }

  draw(): void {
    const ctx = this.canvasRef.current.getContext('2d');
    const { q, settings } = this.props;
    const { nodeMatrix, adjacencyList } = q;
    const { numSides } = settings;

    const boardSide = ctx.canvas.width;
    const tileSide = boardSide / numSides;
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
        const fromPos = Q.idToPos(settings, from);
        if (Q.isHorizontalEdge(settings, from, to)) {
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

  coordsToPos(x: number, y: number): Pos {
    const { numSides } = this.props.settings;
    const ctx = this.canvasRef.current.getContext('2d');
    const tileSide = ctx.canvas.width / numSides;
    return {
      r: Math.floor(y / tileSide),
      c: Math.floor(x / tileSide)
    };
  }

  coordsToQuadrant(x: number, y: number): Quadrant {
    const settings = this.props.settings;
    const { numSides } = settings;
    const ctx = this.canvasRef.current.getContext('2d');
    const tileSide = ctx.canvas.width / numSides;

    const topLeft = {
      r: Math.floor((y - (tileSide / 2)) / tileSide),
      c: Math.floor((x - (tileSide / 2)) / tileSide)
    }

    return {
      topLeft: Q.posToId(settings, topLeft),
      topRight: Q.posToId(settings, Q.sumPositions(topLeft, {r: 0, c: 1})),
      bottomLeft: Q.posToId(settings, Q.sumPositions(topLeft, {r: 1, c: 0})),
      bottomRight: Q.posToId(settings, Q.sumPositions(topLeft, {r: 1, c: 1}))
    };
  }

  getClickData(e: any): { pos: Pos, quadrant: Quadrant } {
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
