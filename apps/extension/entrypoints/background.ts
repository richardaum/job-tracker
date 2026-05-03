import { defineBackground } from "wxt/utils/define-background";

export default defineBackground(() => {
  chrome.runtime.onInstalled.addListener((details) => {
    console.info(
      "[job-tracker] extension installed:",
      details.reason,
      "v" + chrome.runtime.getManifest().version,
    );
  });
});
