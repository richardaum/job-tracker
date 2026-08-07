import { useReducer } from "react";

type NewJobWelcomeTourStep = "title" | "company" | "create" | null;

interface NewJobWelcomeTourState {
  activeStep: NewJobWelcomeTourStep;
  titleFilled: boolean;
  companyFilled: boolean;
}

type NewJobWelcomeTourAction =
  | { type: "form-opened" }
  | { type: "step-changed"; step: NewJobWelcomeTourStep }
  | { type: "field-changed"; name: string; value: string };

const initialNewJobWelcomeTourState: NewJobWelcomeTourState = {
  activeStep: null,
  titleFilled: false,
  companyFilled: false,
};

export function useNewJobWelcomeTour() {
  return useReducer(newJobWelcomeTourReducer, initialNewJobWelcomeTourState);
}

function newJobWelcomeTourReducer(
  state: NewJobWelcomeTourState,
  action: NewJobWelcomeTourAction,
): NewJobWelcomeTourState {
  switch (action.type) {
    case "form-opened":
      return initialNewJobWelcomeTourState;
    case "step-changed":
      return { ...state, activeStep: action.step };
    case "field-changed":
      if (action.name === "title") return { ...state, titleFilled: Boolean(action.value.trim()) };
      if (action.name === "company") return { ...state, companyFilled: Boolean(action.value.trim()) };
      return state;
  }
}
