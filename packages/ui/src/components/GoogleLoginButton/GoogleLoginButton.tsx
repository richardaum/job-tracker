import React from "react";

export interface GoogleLoginButtonProps {
  onClick?: () => void;
}

export function GoogleLoginButton({ onClick }: GoogleLoginButtonProps) {
  return (
    <button type="button" onClick={onClick}>
      Continue with Google
    </button>
  );
}
