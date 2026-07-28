import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "./Tabs";

describe("Tabs", () => {
  it("renders triggers and shows active content", () => {
    render(
      <Tabs defaultValue="tab1">
        <TabsList>
          <TabsTrigger value="tab1">First</TabsTrigger>
          <TabsTrigger value="tab2">Second</TabsTrigger>
        </TabsList>
        <TabsContent value="tab1">Content 1</TabsContent>
        <TabsContent value="tab2">Content 2</TabsContent>
      </Tabs>,
    );

    expect(screen.getByText("First")).toBeInTheDocument();
    expect(screen.getByText("Second")).toBeInTheDocument();
    expect(screen.getByText("Content 1")).toBeInTheDocument();
  });

  it("renders trigger with leading icon", () => {
    render(
      <Tabs defaultValue="a">
        <TabsList>
          <TabsTrigger value="a" leadingIcon={<span data-testid="icon">*</span>}>
            With Icon
          </TabsTrigger>
        </TabsList>
      </Tabs>,
    );

    expect(screen.getByTestId("icon")).toBeInTheDocument();
  });

  it("renders asChild trigger without leading icon wrapper", () => {
    render(
      <Tabs defaultValue="a">
        <TabsList>
          <TabsTrigger value="a" asChild leadingIcon={<span data-testid="icon">*</span>}>
            <a href="#test">Link tab</a>
          </TabsTrigger>
        </TabsList>
      </Tabs>,
    );

    expect(screen.getByText("Link tab")).toBeInTheDocument();
    expect(screen.queryByTestId("icon")).not.toBeInTheDocument();
  });
});
