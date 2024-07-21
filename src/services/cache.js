const apicache = require('apicache');

/**
 * Configuration API Cache.
 * Use Redis to store cache.
 */
const cache = apicache.options({
  debug: process.env.DEBUG == 'true',
  enabled: process.env.CACHE_ENABLE == 'true',
  headers: {
    'cache-control': 'no-cache, no-store,private, max-age=0',
  },
  respectCacheControl: true 
}).middleware(
  // Cache exprired Time
  process.env.CACHE_EXPIRES_IN
);

/**
 * Clear all cached.
 */
const clearCache = () => {
  apicache.clear();
  console.log("Clear All cache!");
}

module.exports = {
  cache,
  clearCache,
};