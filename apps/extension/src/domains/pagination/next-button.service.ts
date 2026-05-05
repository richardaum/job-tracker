import type { ContentActionMessage } from "@/domains/message/types";

export class NextButtonService {
  async execute(message: ContentActionMessage) {
    const nextButton = this.getNextButton(message);
    if (!nextButton) {
      return {
        clicked: false,
        reason: "next button not found",
        beforeUrl: window.location.href,
      };
    }

    const beforeUrl = window.location.href;
    const buttonText = nextButton.textContent?.trim() ?? null;
    const buttonTag = nextButton.tagName;
    const buttonHref = nextButton.getAttribute("href");
    nextButton.click();
    const afterUrl = window.location.href;

    return {
      clicked: true,
      beforeUrl,
      afterUrl,
      buttonText,
      buttonTag,
      buttonHref,
      urlChangedSynchronously: beforeUrl !== afterUrl,
    };
  }

  async canNavigateToNextPage(message: ContentActionMessage) {
    const nextButton = this.getNextButton(message);
    if (!nextButton) return false;
    return true;
  }

  private getNextButton(message: ContentActionMessage) {
    const pagination = message.action.input.pagination;
    if (!pagination) return;

    // is next button visible?
    const container = document.querySelector<HTMLDivElement>(
      pagination.containerSelector,
    );
    if (!container) return;

    const htmlChildren = Array.from(container.children) as HTMLElement[];
    const nextButton = htmlChildren.find((child) => {
      return child.textContent?.includes(pagination.nextButtonPartialMatch);
    });
    return nextButton;
  }
}
