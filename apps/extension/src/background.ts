/** MV3 service worker — install/startup lifecycle logging; extend for messaging and side panel helpers. */

chrome.runtime.onInstalled.addListener((details) => {
  console.info("[job-tracker] extension installed:", details.reason);
});

chrome.runtime.onStartup.addListener(() => {
  console.info("[job-tracker] browser startup — background resumed");
});

export {};
