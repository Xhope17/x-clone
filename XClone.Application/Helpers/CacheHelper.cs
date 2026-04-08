using Microsoft.Extensions.Configuration;
using XClone.Application.Models.Helpers;
using XClone.Shared.Constants;

namespace XClone.Application.Helpers
{
    public static class CacheHelper
    {
        //public static (string key, TimeSpan expiration) AuthToken(string token)
        //{
        //    return ($"auth:tokens:{token}", TimeSpan.FromMinutes(5));
        //}
        //public static readonly rnd = new ()

        public static CacheKey AuthToken(string token, IConfiguration configuration)
        {
            var rnd = new Random();
            var randomExpiration = rnd.Next(Convert.ToInt32(configuration[ConfigurationConstants.JWT_EXPIRATION_IN_MINUTES_MIN]), Convert.ToInt32(configuration[ConfigurationConstants.JWT_EXPIRATION_IN_MINUTES_MIN]));

            return new CacheKey
            {
                Key = $"auth:tokens:{token}",
                Expiration = TimeSpan.FromMinutes(randomExpiration)
            };
        }

        public static CacheKey AuthRefreshRoken(string value, IConfiguration configuration)
        {
            return new CacheKey
            {
                Key = $"auth:refresh_token:{value}",
                //Arreglar
                Expiration = TimeSpan.FromDays(Convert.ToInt32(configuration[ConfigurationConstants.JWT_EXPIRATION_IN_MINUTES_MAX]))
            };
        }
    }
}
