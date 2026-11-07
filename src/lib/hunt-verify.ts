export type LiveOffer = {
  id: string;
  title: string;
  price: string;
  meta: string;
  url: string;
  host: string;
};

const JUNK = ["ebaydesc.com", "google.", "webcache.", "schema.org", "gstatic."];

export function normalizeUrl(value: unknown): string | null {
  if (typeof value !== "string") return null;
  try {
    const url = new URL(value.trim());
    if (url.protocol !== "https:") return null;
    if (JUNK.some((bit) => url.hostname.includes(bit))) return null;
    url.hash = "";
    return url.toString().replace(/\/$/, "");
  } catch {
    return null;
  }
}

export function collectSourceUrls(output: unknown): string[] {
  const found = new Set<string>();
  if (!Array.isArray(output)) return [];
  for (const item of output) {
    if (!item || typeof item !== "object") continue;
    const rec = item as {
      action?: { sources?: { url?: string }[] };
      content?: { annotations?: { url?: string }[] }[];
    };
    for (const source of rec.action?.sources ?? []) {
      const url = normalizeUrl(source.url);
      if (url) found.add(url);
    }
    for (const block of rec.content ?? []) {
      for (const note of block.annotations ?? []) {
        const url = normalizeUrl(note.url);
        if (url) found.add(url);
      }
    }
  }
  return [...found];
}

function offerId(url: string) {
  let hash = 0;
  for (let i = 0; i < url.length; i++) hash = (hash * 31 + url.charCodeAt(i)) >>> 0;
  return `p${hash.toString(36)}`;
}

function clean(value: unknown, max: number, fallback: string) {
  if (typeof value !== "string") return fallback;
  const text = value.replace(/\s+/g, " ").trim();
  if (!text || text.length > max) return text ? text.slice(0, max) : fallback;
  return text;
}

export function verifiedOffers(raw: unknown, sources: string[]): LiveOffer[] {
  const allowed = new Set(sources);
  if (!Array.isArray(raw)) return [];
  const seen = new Set<string>();
  const offers: LiveOffer[] = [];
  for (const item of raw) {
    if (!item || typeof item !== "object") continue;
    const row = item as { title?: unknown; price?: unknown; meta?: unknown; url?: unknown };
    const url = normalizeUrl(row.url);
    if (!url || !allowed.has(url) || seen.has(url)) continue;
    const title = clean(row.title, 110, "");
    if (title.length < 3 || title.startsWith("http")) continue;
    seen.add(url);
    offers.push({
      id: offerId(url),
      title,
      price: clean(row.price, 32, "Prix sur la page"),
      meta: clean(row.meta, 140, new URL(url).hostname.replace(/^www\./, "")),
      url,
      host: new URL(url).hostname.replace(/^www\./, ""),
    });
    if (offers.length === 6) break;
  }
  return offers;
}

export function offersFromSources(sources: string[]): LiveOffer[] {
  const clean = sources.map((url) => normalizeUrl(url)).filter((url): url is string => !!url);
  return clean.slice(0, 6).map((url) => {
    const parsed = new URL(url);
    const bit = decodeURIComponent(parsed.pathname.split("/").filter(Boolean).pop() ?? parsed.hostname);
    const title = bit.replace(/[-_]+/g, " ").replace(/\.(html|php|aspx)$/i, "").slice(0, 90);
    return {
      id: offerId(url),
      title: title.length > 2 ? title : parsed.hostname,
      price: "Prix sur la page",
      meta: "Page lue",
      url,
      host: parsed.hostname.replace(/^www\./, ""),
    };
  });
}
