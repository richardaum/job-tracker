import { describe, it, expect } from "vitest";
import { AppController } from "./app.controller";

describe("AppController", () => {
  it('getHealth returns { status: "ok" }', () => {
    const controller = new AppController();
    expect(controller.getHealth()).toEqual({ status: "ok" });
  });
});
