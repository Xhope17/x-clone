using Microsoft.Extensions.Caching.Memory;
using XClone.Application.Interfaces.Services;

namespace XClone.Application.Services
{
    public class CacheService(IMemoryCache memoryCache) : ICacheService
    {
        public T Create<T>(string key, TimeSpan expiration, T value)
        {
            try
            {
                var create = memoryCache.GetOrCreate(key, (factory) =>
                {
                    factory.SlidingExpiration = expiration;
                    return value;
                });

                return create is null ? throw new Exception("No se pudo establecer el cache") : create;
            }
            catch
            {
                throw;
            }
        }

        public bool Delete<T>(string key)
        {
            try
            {
                memoryCache.Remove(key);
                return true;
            }
            catch
            {
                throw;
            }
        }

        public T? Get<T>(string key)
        {
            try
            {
                return memoryCache.Get<T>(key);
            }
            catch
            {
                throw;
            }
        }
    }
}
