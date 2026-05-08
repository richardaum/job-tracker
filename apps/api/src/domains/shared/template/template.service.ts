import { Injectable } from "@nestjs/common";
import Mustache from "mustache";

@Injectable()
export class TemplateService {
  render(
    templateSource: string,
    view: Readonly<Record<string, unknown>>,
  ): string {
    return Mustache.render(templateSource, view);
  }
}
