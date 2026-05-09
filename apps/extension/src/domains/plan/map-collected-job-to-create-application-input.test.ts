import { describe, expect, it } from "vitest";

import { mapCollectedJobToCreateApplicationInput } from "./map-collected-job-to-create-application-input";

describe("mapCollectedJobToCreateApplicationInput", () => {
  it("splits remoteyeah locationRequirements on newlines into tags", () => {
    const input = mapCollectedJobToCreateApplicationInput({
      title: "Senior Frontend Engineer",
      company: "Toptal",
      detailUrl: "https://remoteyeah.com/jobs/example",
      locationRequirements: "🌍 Europe\n🌍 Latin America",
    });
    expect(input.tags).toEqual(["🌍 Europe", "🌍 Latin America"]);
  });

  it("splits region and country when stacked on separate lines", () => {
    const input = mapCollectedJobToCreateApplicationInput({
      title: "Engineer",
      company: "Lifted",
      detailUrl: "https://remoteyeah.com/jobs/example",
      locationRequirements: "🌍 Latin America\nMexico",
    });
    expect(input.tags).toEqual(["🌍 Latin America", "Mexico"]);
  });

  it("still splits comma/middot/pipe/semicolon separated locations", () => {
    const input = mapCollectedJobToCreateApplicationInput({
      title: "Engineer",
      company: "X",
      detailUrl: "https://remoteyeah.com/jobs/example",
      locationRequirements: "Brazil, Argentina · Canada | US; UK",
    });
    expect(input.tags).toEqual(["Brazil", "Argentina", "Canada", "US", "UK"]);
  });

  it("keeps single-line locations as one tag", () => {
    const input = mapCollectedJobToCreateApplicationInput({
      title: "Dev",
      company: "CI&T",
      detailUrl: "https://remoteyeah.com/jobs/example",
      locationRequirements: "Brazil",
    });
    expect(input.tags).toEqual(["Brazil"]);
  });
});
