import { useReducer } from "react";

export type NewJobOnboardingStep = "title" | "company" | "create" | null;

interface NewJobOnboardingState {
  activeStep: NewJobOnboardingStep;
  titleFilled: boolean;
  companyFilled: boolean;
}

type NewJobOnboardingAction =
  | { type: "form-opened" }
  | { type: "step-changed"; step: NewJobOnboardingStep }
  | { type: "field-changed"; name: string; value: string };

const initialNewJobOnboardingState: NewJobOnboardingState = {
  activeStep: null,
  titleFilled: false,
  companyFilled: false,
};

export function useNewJobOnboarding() {
  return useReducer(newJobOnboardingReducer, initialNewJobOnboardingState);
}

function newJobOnboardingReducer(state: NewJobOnboardingState, action: NewJobOnboardingAction): NewJobOnboardingState {
  switch (action.type) {
    case "form-opened":
      return initialNewJobOnboardingState;
    case "step-changed":
      return { ...state, activeStep: action.step };
    case "field-changed":
      if (action.name === "title") return { ...state, titleFilled: Boolean(action.value.trim()) };
      if (action.name === "company") return { ...state, companyFilled: Boolean(action.value.trim()) };
      return state;
  }
}
