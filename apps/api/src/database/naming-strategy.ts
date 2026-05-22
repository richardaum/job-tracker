import { DefaultNamingStrategy } from "typeorm";

function toSnakeCase(input: string): string {
  return input
    .replace(/[A-Z]/g, (match, offset) =>
      offset > 0 ? "_" + match.toLowerCase() : match.toLowerCase(),
    )
    .replace(/__+/g, "_");
}

export class SnakeCaseNamingStrategy extends DefaultNamingStrategy {
  columnName(
    propertyName: string,
    customName: string | undefined,
    embeddedPrefixes: string[],
  ): string {
    if (embeddedPrefixes.length > 0) {
      const raw = embeddedPrefixes.join("_") + "_" + propertyName;
      return toSnakeCase(raw);
    }
    return customName ?? toSnakeCase(propertyName);
  }
}
