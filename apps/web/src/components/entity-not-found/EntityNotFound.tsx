"use client";

import { Button, cn, Heading } from "@job-tracker/ui";
import type { Route } from "next";
import Link from "next/link";

type EntityNotFoundProps = {
  resource: string;
  backHref: Route;
  backLabel: string;
};

function sentenceCaseEntity(resource: string) {
  if (resource.length === 0) return resource;
  return resource.charAt(0).toUpperCase() + resource.slice(1);
}

export function EntityNotFound({ resource, backHref, backLabel }: EntityNotFoundProps) {
  const resourceLabel = sentenceCaseEntity(resource);
  const resourceSentence = resource.toLowerCase();
  const notice = `The ${resourceSentence} was not found or you don't have access to it. Please try again or contact support.`;

  return (
    <div className={cn("flex flex-col items-center justify-center gap-4 py-12")}>
      <Heading as="h2">{resourceLabel} not found</Heading>
      <p className={cn("max-w-md text-center text-sm text-text-secondary")}>{notice}</p>
      <Button asChild intent="primary" size="sm">
        <Link href={backHref}>{backLabel}</Link>
      </Button>
    </div>
  );
}
