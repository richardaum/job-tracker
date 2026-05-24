import { apiEnv } from "@api/env/server";
import { Injectable } from "@nestjs/common";

type Bucket = { count: number; resetAt: number };

// TODO(infra): Temporary in-app IP rate limit until WAF/CloudFront rules are live.
// Remove this service once edge rate limiting covers SSE (and /graphql if added here).
@Injectable()
export class IpRateLimitService {
  private readonly buckets = new Map<string, Bucket>();

  /** Returns true when the request is allowed, false when rate limit is exceeded. */
  consume(key: string, limit: number, ttlMs: number): boolean {
    if (apiEnv.RATE_LIMIT_DISABLED) {
      return true;
    }

    const now = Date.now();
    this.pruneExpiredBuckets(now);

    const bucket = this.buckets.get(key);

    if (!bucket || bucket.resetAt <= now) {
      this.buckets.set(key, { count: 1, resetAt: now + ttlMs });
      return true;
    }

    if (bucket.count >= limit) {
      return false;
    }

    bucket.count += 1;
    return true;
  }

  private pruneExpiredBuckets(now: number): void {
    for (const [key, bucket] of this.buckets) {
      if (bucket.resetAt <= now) {
        this.buckets.delete(key);
      }
    }
  }
}
