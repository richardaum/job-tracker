import { LoginPageClient } from "@/app/login/LoginPageClient";
import { getPostHogDistinctId, getServerFeatureFlag } from "@/lib/posthog-server";
import { LOGIN_V2_FEATURE_FLAG } from "@/modules/auth/login/loginV2Flag";

export default async function LoginPage() {
  const distinctId = await getPostHogDistinctId();
  const loginV2Enabled = await getServerFeatureFlag(LOGIN_V2_FEATURE_FLAG, distinctId);

  return <LoginPageClient loginV2Enabled={loginV2Enabled} />;
}
