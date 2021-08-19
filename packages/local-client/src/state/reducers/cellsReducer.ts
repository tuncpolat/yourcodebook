import produce from "immer";
import { ActionType } from "../action-types";
import { Action } from "../actions"; // all the possible actions that we will receive
import { Cell } from "../cell";

interface CellsState {
  loading: boolean;
  error: string | null;
  order: string[]; // array of strings
  data: {
    [key: string]: Cell; // keys are the ids {1: {cell01}, 2: {cell02}}
  };
}

const initialState: CellsState = {
  loading: false,
  error: null,
  order: [],
  data: {},
};

// use immer
const reducer = produce((state: CellsState = initialState, action: Action) => {
  switch (action.type) {
    case ActionType.SAVE_CELLS_ERROR:
      state.error = action.payload;
      return state;
    case ActionType.FETCH_CELLS:
      state.loading = true;
      state.error = null;
      return state;
    case ActionType.FETCH_CELLS_COMPLETE:
      state.order = action.payload.map((cell) => cell.id);
      state.data = action.payload.reduce((acc, cell) => {
        acc[cell.id] = cell;
        return acc;
      }, {} as CellsState["data"]);

      return state;
    case ActionType.FETCH_CELLS_ERROR:
      state.loading = false;
      state.error = action.payload;
      return state;
    case ActionType.UPDATE_CELL:
      const { id, content } = action.payload;
      state.data[id].content = content;
      return state;
    /* 
        without immer
        return {
          ...state,
          data: {
            ...state.data,
            [action.payload.id]: {
              ...state.data[action.payload.id],
              content: action.payload.content,
            },
          },
        }; 
    */
    case ActionType.DELETE_CELL:
      delete state.data[action.payload]; // remove rom data
      state.order = state.order.filter((id) => id !== action.payload); // remove from order
      return state;
    case ActionType.MOVE_CELL:
      const { direction } = action.payload;
      const index = state.order.findIndex((id) => id === action.payload.id);
      const targetIndex = direction === "up" ? index - 1 : index + 1;
      if (targetIndex < 0 || targetIndex > state.order.length - 1) {
        return state;
      }
      // swap
      state.order[index] = state.order[targetIndex];
      state.order[targetIndex] = action.payload.id;
      return state;
    case ActionType.INSERT_CELL_AFTER:
      const cell: Cell = {
        content: "",
        type: action.payload.type,
        id: randomId(),
      };
      state.data[cell.id] = cell; // add to data
      const idx = state.order.findIndex((id) => id === action.payload.id);
      // if null append it at the beginning
      if (idx < 0) {
        state.order.unshift(cell.id);
      } else {
        state.order.splice(idx + 1, 0, cell.id);
      }
      return state;
    default:
      return state;
  }
});

const randomId = () => {
  return Math.random().toString(36).substr(2, 5);
};

export default reducer;
