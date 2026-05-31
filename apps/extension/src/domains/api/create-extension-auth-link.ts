import { SetContextLink } from "@apollo/client/link/context";

import { getAccessTokenFromCookie } from "@/domains/api/get-access-token-from-cookie";

export function createExtensionAuthLink(graphqlUrl: string): SetContextLink {
  const cookieUrl = new URL(graphqlUrl).origin;

  return new SetContextLink(async (context) => {
    const accessToken = await getAccessTokenFromCookie(cookieUrl);
    if (!accessToken) {
      return context;
    }

    return { ...context, headers: { ...context.headers, Authorization: `Bearer ${accessToken}` } };
  });
}
