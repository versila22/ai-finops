const PROVIDER_BILLING_URLS: Record<string, string> = {
  openai: "https://platform.openai.com/settings/organization/billing",
  anthropic: "https://console.anthropic.com/settings/billing",
  google: "https://console.cloud.google.com/billing",
  elevenlabs: "https://elevenlabs.io/subscription",
  lovable: "https://lovable.dev/settings/billing",
};

export function getProviderBillingUrl(providerId: string): string | null {
  return PROVIDER_BILLING_URLS[providerId] ?? null;
}

export { PROVIDER_BILLING_URLS };
