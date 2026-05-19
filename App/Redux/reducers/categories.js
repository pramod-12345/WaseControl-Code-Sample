import { CONTAINERS_ARRAY, CATEGORY_ON_SELECT } from "../types";

const initialState = {
  isFetching: false,
  list: [],
  selectedCategory: null,
  selectedLayout: true,
  containersArray: "",
};

export default (state = initialState, action) => {
  const { payload, type } = action;

  switch (type) {
    case CATEGORY_ON_SELECT:
      return {
        ...state,
        isFetching: false,
        selectedCategory: payload || null,
      };
    case CONTAINERS_ARRAY:
      return {
        ...state,
        containersArray: payload,
      };
    default:
      return state;
  }
};
