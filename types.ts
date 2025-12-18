export enum AppState {
  IDLE = 'IDLE',
  SPINNING = 'SPINNING',
  SELECTING = 'SELECTING', // The transition/slowdown phase
  SELECTED = 'SELECTED',
}

export interface Student {
  id: number;
  name: string;
  position: [number, number, number];
  color: string;
}

export enum GestureType {
  NONE = 'None',
  OPEN_PALM = 'Open_Palm',
  CLOSED_FIST = 'Closed_Fist',
  VICTORY = 'Victory',
}