import { CATEGORY_ON_SELECT, CONTAINERS_ARRAY } from "../types";

export const setActiveCategory = (id) => {
  return (dispatch) => {
    dispatch({ type: CATEGORY_ON_SELECT, payload: id });
  };
};

export const setContainerArr = (arr) => {
  return (dispatch) => {
    dispatch({ type: CONTAINERS_ARRAY, payload: arr });
  };
};
