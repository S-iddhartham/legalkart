/** Brand, contact and routing configuration. Values here are business facts, not API data. */
export const site = {
  name: "LegalKart",
  tagline: "Your Legal Journey Guide",
  url: (process.env.NEXT_PUBLIC_SITE_URL || "https://www.legalkart.com").replace(/\/$/, ""),
  description:
    "Talk or chat with verified lawyers, get documents reviewed, and explore legal services for property, startups and more — with pricing shown upfront.",
  support: { phone: "+91-8448445049", phoneHref: "tel:+918448445049", hours: "24x7" },
  social: [
    { label: "Twitter", href: "https://twitter.com/legalkart" },
    { label: "Instagram", href: "https://www.instagram.com/legalkart" },
    { label: "LinkedIn", href: "https://www.linkedin.com/company/legalkart" },
  ],
  apps: {
    playStore: process.env.NEXT_PUBLIC_PLAY_STORE_URL || "",
    appStore: process.env.NEXT_PUBLIC_APP_STORE_URL || "",
  },
  routes: {
    home: "/",
    consult: "/consult",
    lawyer: (slug: string) => `/lawyers/${slug}`,
    service: (slug: string) => `/services/${slug}`,
    blogs: "/blogs",
    challans: "/check-challans",
    login: process.env.NEXT_PUBLIC_LOGIN_URL || "/login",
    walletRecharge: process.env.NEXT_PUBLIC_WALLET_RECHARGE_URL || "/wallet/recharge",
    account: "/account",
    privacy: "/privacy-policy",
    terms: "/terms-and-conditions",
    refund: "/refund-policy",
    contact: "/contact-us",
    about: "/about-us",
  },
  languages: [
    { code: "en", label: "English" },
    { code: "hi", label: "हिंदी" },
    { code: "bn", label: "বাংলা" },
    { code: "ta", label: "தமிழ்" },
    { code: "te", label: "తెలుగు" },
    { code: "ml", label: "മലയാളം" },
    { code: "gu", label: "ગુજરાતી" },
    { code: "mr", label: "मराठी" },
    { code: "pa", label: "ਪੰਜਾਬੀ" },
  ],
} as const;

/** Builds a login URL that returns the user to `next` after authentication. */
export function loginUrl(next: string): string {
  const sep = site.routes.login.includes("?") ? "&" : "?";
  return `${site.routes.login}${sep}next=${encodeURIComponent(next)}`;
}

/**
 * Routes implemented in this app. Everything else (blogs, policies, account,
 * challans…) is served by the existing LegalKart site, so links to it are not
 * prefetched.
 */
export function isAppRoute(href: string): boolean {
  return href === "/" || /^\/(consult|lawyers|services)(\/|\?|$)/.test(href);
}
