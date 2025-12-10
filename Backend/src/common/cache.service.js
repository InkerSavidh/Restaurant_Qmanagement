// Backend/src/common/cache.service.js
// Simple in-memory cache for frequently accessed data

class CacheService {
  constructor() {
    this.cache = new Map();
    this.ttl = new Map(); // Time to live for each key
  }

  set(key, value, ttlSeconds = 300) { // Default 5 minutes TTL
    this.cache.set(key, value);
    this.ttl.set(key, Date.now() + (ttlSeconds * 1000));
  }

  get(key) {
    const expiry = this.ttl.get(key);
    if (!expiry || Date.now() > expiry) {
      // Expired or doesn't exist
      this.cache.delete(key);
      this.ttl.delete(key);
      return null;
    }
    return this.cache.get(key);
  }

  delete(key) {
    this.cache.delete(key);
    this.ttl.delete(key);
  }

  clear() {
    this.cache.clear();
    this.ttl.clear();
  }

  // Get or set pattern
  async getOrSet(key, fetchFunction, ttlSeconds = 300) {
    let value = this.get(key);
    if (value === null) {
      value = await fetchFunction();
      this.set(key, value, ttlSeconds);
    }
    return value;
  }

  // Invalidate cache keys by pattern
  invalidatePattern(pattern) {
    const regex = new RegExp(pattern);
    for (const key of this.cache.keys()) {
      if (regex.test(key)) {
        this.delete(key);
      }
    }
  }
}

// Export singleton instance
export const cache = new CacheService();

// Cache keys constants
export const CACHE_KEYS = {
  DASHBOARD_STATS: 'dashboard:stats',
  HOURLY_CHART: 'chart:hourly',
  QUEUE_LIST: 'queue:list',
  TABLES_BY_FLOOR: (floorId) => `tables:floor:${floorId}`,
  ALL_TABLES: 'tables:all',
};