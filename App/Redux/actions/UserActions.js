import { UPDATE_USER_DATA } from "../types";

export const setUserData = (data) => {
  return (dispatch) => {
    dispatch({ type: UPDATE_USER_DATA, payload: data });
  };
};
