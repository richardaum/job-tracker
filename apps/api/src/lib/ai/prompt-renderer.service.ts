import { TemplateService } from "@api/domains/shared/template/template.service";
import { Injectable } from "@nestjs/common";

@Injectable()
export class PromptRendererService {
  constructor(private readonly templateService: TemplateService) {}

  render(
    templateSource: string,
    view: Readonly<Record<string, unknown>>,
  ): string {
    return this.templateService.render(templateSource, view);
  }
}
