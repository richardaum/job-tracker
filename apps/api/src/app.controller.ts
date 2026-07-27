import { Controller, Get } from "@nestjs/common";

@Controller()
export class AppController {
  @Get()
  getRoot(): { status: string } {
    return { status: "ok" };
  }

  @Get("health")
  getHealth(): { status: string } {
    return { status: "ok" };
  }
}
