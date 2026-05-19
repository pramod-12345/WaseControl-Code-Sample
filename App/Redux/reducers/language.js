import { Config } from "../../../App/Common";
import { SWITCH_LANGUAGE } from "../../../App/Redux/types";

const initialState = {
  lang: Config.Language,
};

export default (state = initialState, action) => {
  const { lang } = action;
  switch (action.type) {
    case SWITCH_LANGUAGE:
      return {
        ...state,
        lang,
      };
    default:
      return state;
  }
};
