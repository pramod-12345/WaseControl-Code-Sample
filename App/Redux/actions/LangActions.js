import { Languages, setI18nConfig } from "../../Common";

import { SWITCH_LANGUAGE } from "../types";

export const switchLanguage = (lang) => {
  // Languages.setLocale(lang)
  setI18nConfig(lang);
  return (dispatch) => dispatch({ type: SWITCH_LANGUAGE, lang });
};
