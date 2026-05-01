import { describe, expect, it } from "vitest";

import { AppController } from "./app.controller";

describe("AppController", () => {
  it('getHealth returns { status: "ok" }', () => {
    const controller = new AppController();
    expect(controller.getHealth()).toEqual({ status: "ok" });
  });
});
