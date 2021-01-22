export type NodeId = number;

export interface NodeMap {
  [index: number]: number;
}

export interface EdgeMap {
  [propName: string]: Edge
}

export interface GoalMap {
  [propName: number]: Goal;
}

export interface QuoridorState {
  turn: number;
  mode: "place" | "move";
  finished: boolean;
  horizontalEdge: boolean;
  nodeMatrix: Array<Array<number>>;
  adjacencyList: Array<NodeMap>;
}

export interface Settings {
  readonly numSides: number;
  readonly numPlayers: number;
}

export interface QuoridorsContext {
  readonly q: {
    nodeMatrix: Array<Array<NodeId>>;
    adjacencyList: Array<NodeMap>;
  };
  readonly settings: Settings;
  [propName: string]: any;
}

export interface Pos {
  readonly r: number;
  readonly c: number;
}

export interface Quadrant {
  readonly topLeft: NodeId;
  readonly bottomLeft: NodeId;
  readonly topRight: NodeId;
  readonly bottomRight: NodeId;
}

export interface Goal {
  readonly r?: number;
  readonly c?: number;
}

export interface Edge {
  readonly from: NodeId;
  readonly to: NodeId;
}
