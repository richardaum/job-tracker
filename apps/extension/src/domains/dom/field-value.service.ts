import { createDefaultFieldFormatStrategyPicker } from "@/domains/dom/field-format.strategy";
import type { PlanStepCollectJobsDetailsField, PlanStepCollectJobsSurfaceField } from "@/domains/plan/model/types";

type CollectField = PlanStepCollectJobsSurfaceField | PlanStepCollectJobsDetailsField;

type CollectFieldElement = {
  value?: string;
  innerText: string;
  textContent: string | null;
  innerHTML: string;
  getAttribute(name: string): string | null;
};

export class FieldValueService {
  constructor(private readonly formatStrategies = createDefaultFieldFormatStrategyPicker()) {}

  getFieldValue(element: CollectFieldElement, field: CollectField) {
    // regex-type fields are resolved in CollectJobsService, not via DOM
    if (field.type === "regex") return null;

    const value = this.getRawFieldValue(element, field);
    this.assertValidationRegex(value, field);

    const strategy = this.formatStrategies.pick(field);
    return strategy.apply(value, field);
  }

  private getRawFieldValue(element: CollectFieldElement, field: CollectField) {
    switch (field.type) {
      case "attribute":
        return element.getAttribute(field.value);
      case "property":
        return this.getElementProperty(element, field.value);
      default:
        throw new Error("Invalid field type");
    }
  }

  private assertValidationRegex(value: string | null | undefined, field: CollectField) {
    if (!("validationRegex" in field) || !field.validationRegex) {
      return;
    }

    if (typeof value !== "string") {
      throw new Error(
        `Field '${field.key}' expected a string value for validationRegex but got ${value === null ? "null" : "undefined"}`,
      );
    }

    const { pattern, flags } = field.validationRegex;
    const regex = new RegExp(pattern, flags);
    if (!regex.test(value)) {
      throw new Error(`Field '${field.key}' failed validationRegex: /${pattern}/${flags ?? ""}`);
    }
  }

  private getElementProperty(
    element: CollectFieldElement,
    property: "value" | "innerText" | "textContent" | "innerHTML",
  ) {
    return element[property];
  }
}
