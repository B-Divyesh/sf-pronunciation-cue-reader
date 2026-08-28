import type { LicenseCache } from './types';

export const PRODUCT_SLUG = 'pronunciation-cue-reader';
export const BILLING_BASE = 'https://api.sociobot.in/api/v1';
export const LICENSE_KEY = `sb_license:${PRODUCT_SLUG}`;
export const LICENSE_CACHE_KEY = `${LICENSE_KEY}:verdict`;
export const CHECKOUT_URL = `${BILLING_BASE}/products/${PRODUCT_SLUG}/checkout`;
const DAY = 86_400_000;

export function recentValidLicense(cache: LicenseCache | null, now = Date.now()): boolean {
  return Boolean(cache?.valid && cache.token && now - cache.checkedAt < DAY);
}

export async function verifyLicense(token: string, signal?: AbortSignal): Promise<LicenseCache> {
  const response = await fetch(`${BILLING_BASE}/products/${PRODUCT_SLUG}/verify?license=${encodeURIComponent(token)}`, { signal });
  if (!response.ok) throw new Error('License verification is temporarily unavailable.');
  const data = await response.json() as { valid: boolean; reason?: string };
  return { token, valid: data.valid, reason: data.reason, checkedAt: Date.now() };
}
