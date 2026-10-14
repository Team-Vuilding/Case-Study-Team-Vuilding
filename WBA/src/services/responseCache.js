const TTL = 15000;
const MAX_ENTRIES = 50;

export function createResponseCache(now = Date.now) {
  const entries = new Map();
  const peek = key => {
    const entry = entries.get(key);
    return entry?.expiresAt > now() ? entry.data : undefined;
  };
  const load = (key, request, force = false) => {
    const existing = entries.get(key);
    if (!force && existing) {
      if (existing.promise) return existing.promise;
      if (existing.expiresAt > now()) return Promise.resolve(existing.data);
    }
    entries.delete(key);
    if (entries.size >= MAX_ENTRIES) entries.delete(entries.keys().next().value);
    const entry = {};
    entry.promise = Promise.resolve().then(request).then(data => {
      if (entries.get(key) === entry) {
        entry.data = data;
        entry.expiresAt = now() + TTL;
        entry.promise = null;
      }
      return data;
    }, error => {
      if (entries.get(key) === entry) entries.delete(key);
      throw error;
    });
    entries.set(key, entry);
    return entry.promise;
  };
  return { peek, load, clear: () => entries.clear() };
}
