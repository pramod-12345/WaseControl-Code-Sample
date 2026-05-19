import { UPDATE_USER_DATA } from "../types";

const initialState = {
  data: null,
  token: null,
  isAppPaid: false,
};

export default (state = initialState, action) => {
  // noinspection JSRedundantSwitchStatement
  switch (action.type) {
    case UPDATE_USER_DATA:
      return { ...state, data: action.payload };
    default:
      return state;
  }
};
