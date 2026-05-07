import { SetContextLink } from "@apollo/client/link/context";

const ACCESS_TOKEN_COOKIE = "access_token";

export function createExtensionAuthLink(graphqlUrl: string): SetContextLink {
  const cookieUrl = new URL(graphqlUrl).origin;

  return new SetContextLink(async (context) => {
    const accessToken = await getAccessTokenFromCookie(cookieUrl);
    if (!accessToken) {
      return context;
    }

    return {
      ...context,
      headers: { ...context.headers, Authorization: `Bearer ${accessToken}` },
    };
  });
}

function getAccessTokenFromCookie(url: string): Promise<string | undefined> {
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
