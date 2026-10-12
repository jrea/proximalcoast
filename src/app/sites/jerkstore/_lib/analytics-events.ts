import { CREDIT_PACKAGES_MAP } from "../constants";

// These fields describe actions and selected options, never entered/generated text.
const safeFields = new Set(["language", "heatLevel", "isEmail", "plan", "resultCount", "provider", "type", "location", "reason", "feature", "enabled", "weight", "category", "packageId", "credits", "value", "currency", "transactionId"]);

export function safeAnalyticsProperties(properties: Record<string, unknown> = {}) {
  const safe: Record<string, string | number | boolean> = { site: "jerkstore" };
  for (const [key, value] of Object.entries(properties)) {
    if (!safeFields.has(key)) continue;
    if (typeof value === "boolean" || (typeof value === "number" && Number.isFinite(value))) safe[key] = value;
    else if (typeof value === "string" && value.length <= 100) safe[key] = value;
  }
  return safe;
}

const googleEvents: Record<string, string> = {
  jerkstore_landing_viewed: "jerkstore_landing_view",
  insult_generation_started: "roast_started",
  insult_generation_completed: "roast_generated",
  insult_generation_failed: "roast_failed",
  roast_copied_text: "roast_copy",
  roast_copied_image: "roast_copy",
  roast_shared_native: "share",
  roast_image_downloaded: "roast_download",
  login_clicked: "signup_intent",
  auth_attempt: "auth_attempt",
  auth_completed: "login",
  checkout_started: "begin_checkout",
  checkout_payment_completed: "purchase",
};

export function googleAnalyticsEvent(event: string, properties: Record<string, unknown> = {}) {
  const name = event === "auth_completed" && properties.type === "signup" ? "sign_up" : googleEvents[event];
  if (!name) return null;
  const safe = safeAnalyticsProperties(properties);
  const params: Record<string, unknown> = { ...safe };
  if (event === "auth_completed") params.method = safe.provider;
  if (event === "roast_shared_native") { params.method = "native"; params.content_type = "roast"; }
  if (event === "roast_copied_text" || event === "roast_copied_image") params.method = event === "roast_copied_text" ? "text" : "image";
  if (name === "purchase" || name === "begin_checkout") {
    const packageId = String(safe.packageId);
    const pack = Object.hasOwn(CREDIT_PACKAGES_MAP, packageId) ? CREDIT_PACKAGES_MAP[packageId as keyof typeof CREDIT_PACKAGES_MAP] : undefined;
    if (!pack || (name === "purchase" && !String(safe.transactionId ?? "").startsWith("pi_"))) return null;
    params.value = pack.amount / 100;
    params.currency = "USD";
    params.items = [{ item_id: pack.id, item_name: "Jerkstore credits", price: pack.amount / 100, quantity: 1 }];
    if (name === "purchase") params.transaction_id = safe.transactionId;
    delete params.transactionId;
  }
  return { name, params };
}

export function analyticsUrl(raw: string) {
  try {
    const url = new URL(raw);
    const campaign = new URLSearchParams();
    for (const key of ["utm_source", "utm_medium", "utm_campaign", "utm_content", "utm_term"]) {
      const value = url.searchParams.get(key);
      if (value) campaign.set(key, value.slice(0, 100));
    }
    url.search = campaign.toString();
    url.hash = "";
    return url.toString();
  } catch { return ""; }
}
