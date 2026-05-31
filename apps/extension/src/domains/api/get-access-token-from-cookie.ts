const ACCESS_TOKEN_COOKIE = "access_token";

export function getAccessTokenFromCookie(
  url: string,
): Promise<string | undefined> {
  return new Promise((resolve) => {
    chrome.cookies.get({ url, name: ACCESS_TOKEN_COOKIE }, (cookie) => {
      if (chrome.runtime.lastError) {
        resolve(undefined);
        return;
      }

      resolve(cookie?.value);
    });
  });
}
