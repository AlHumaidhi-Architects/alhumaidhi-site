"use client";

import { createContext, useContext } from "react";

type IntroState = { introDone: boolean };

export const IntroContext = createContext<IntroState>({ introDone: true });

export function useIntro() {
  return useContext(IntroContext);
}
