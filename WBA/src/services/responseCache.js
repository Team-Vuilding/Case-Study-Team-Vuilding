const TTL = 15000;
const SNAPSHOT_TTL = 60000;
const MAX_ENTRIES = 50;

export function createResponseCache(now = Date.now) {
  const entries = new Map();
  const touch = (key, entry) => { entries.delete(key); entries.set(key, entry); };
  const peek = key => {
    const entry = entries.get(key);
    if (entry?.usableUntil > now()) {
      touch(key, entry);
      return entry.data;
    }
    if (entry && !entry.promise) entries.delete(key);
    return undefined;
  };
  const load = (key, request, force = false) => {
    const existing = entries.get(key);
    if (existing?.promise) { touch(key, existing); return existing.promise; }
    if (!force && existing?.expiresAt > now()) {
      touch(key, existing);
      return Promise.resolve(existing.data);
    }
    entries.delete(key);
    if (entries.size >= MAX_ENTRIES) entries.delete(entries.keys().next().value);
    const entry = { data: existing?.data, usableUntil: existing?.usableUntil };
    entry.promise = Promise.resolve().then(request).then(data => {
      if (entries.get(key) === entry) {
        entry.data = data;
        entry.expiresAt = now() + TTL;
        entry.usableUntil = now() + SNAPSHOT_TTL;
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
