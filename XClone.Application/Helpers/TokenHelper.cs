using Microsoft.Extensions.Configuration;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using XClone.Application.Interfaces.Services;
using XClone.Application.Models.Helpers;
using XClone.Shared;
using XClone.Shared.Constants;
using XClone.Shared.Helpers;

namespace XClone.Application.Helpers
{
    public static class TokenHelper
    {
        public static readonly Random rnd = new();
        public static string Create(Guid UserId, List<string> roles, IConfiguration configuration, ICacheService cache)
        {
            //var issuer = Environment.GetEnvironmentVariable(ConfigurationConstants.JWT_ISSUER) //produccion y desarrollo
            //    ?? configuration[ConfigurationConstants.JWT_ISSUER]
            //    ?? throw new Exception(ResponseConstans.ConfigurationPropertyNotFound(ConfigurationConstants.JWT_ISSUER));

            //var audience = Environment.GetEnvironmentVariable(ConfigurationConstants.JWT_AUDIENCE) //produccion y desarrollo
            //    ?? configuration[ConfigurationConstants.JWT_AUDIENCE]
            //    ?? throw new Exception(ResponseConstans.ConfigurationPropertyNotFound(ConfigurationConstants.JWT_AUDIENCE));

            //var privateKey = Environment.GetEnvironmentVariable(ConfigurationConstants.JWT_PRIVATE_KEY) //produccion y desarrollo
            //    ?? configuration[ConfigurationConstants.JWT_PRIVATE_KEY]
            //    ?? throw new Exception(ResponseConstans.ConfigurationPropertyNotFound(ConfigurationConstants.JWT_PRIVATE_KEY));

            //var expirationInMinutes = Environment.GetEnvironmentVariable(ConfigurationConstants.JWT_EXPIRATION_IN_MINUTES_MIN) //produccion y desarrollo
            //    ?? configuration[ConfigurationConstants.JWT_EXPIRATION_IN_MINUTES_MIN]
            //    ?? "10";

            var tokenConfiguration = Configuration(configuration);
            var signingCredentials = new SigningCredentials(tokenConfiguration.SecurityKey, SecurityAlgorithms.HmacSha256);

            //var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(privateKey));
            //var signingCredentials = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

            //var now = DateTimeHelper.UtcNow();
            //var expiration = now.AddMinutes(Convert.ToDouble(expirationInMinutes));

            var claims = new[]
            {
                //new Claim(ClaimTypes.Role, "Administrador"),
                //new Claim(ClaimTypes.Email, user.Email),
                //new Claim("UserId", user.Id.ToString())

                new Claim(ClaimsConstants.USER_ID, UserId.ToString())
            };

            var securityToken = new JwtSecurityToken(
                audience: tokenConfiguration.Audience,
                issuer: tokenConfiguration.Issuer,
                expires: tokenConfiguration.Expiration,
                signingCredentials: signingCredentials,
                claims: claims
                );

            var token = new JwtSecurityTokenHandler().WriteToken(securityToken);

            var cacheKey = CacheHelper.AuthTokenCreation(token, tokenConfiguration.ExpirationTimeSpan);
            cache.Create(cacheKey.Key, cacheKey.Expiration, token);

            return token;
        }

        public static string CreateRefresh(Guid userId, IConfiguration configuration, ICacheService cacheService)
        {
            var token = Generate.RandomText(100);
            var cacheKey = CacheHelper.AuthRefreshTokenCreation(token, configuration);

            RefreshToken refreshToken = cacheService.Create(cacheKey.Key, cacheKey.Expiration, new RefreshToken
            {
                UserId = userId,
                ExpirationInDays = cacheKey.Expiration
            });

            return token;
        }

        public static TokenConfiguration Configuration(IConfiguration configuration)
        {
            var issuer = Environment.GetEnvironmentVariable(ConfigurationConstants.JWT_ISSUER)
                ?? configuration[ConfigurationConstants.JWT_ISSUER]
                ?? throw new Exception(ResponseConstants.ConfigurationPropertyNotFound(ConfigurationConstants.JWT_ISSUER));

            var audience = Environment.GetEnvironmentVariable(ConfigurationConstants.JWT_AUDIENCE)
                ?? configuration[ConfigurationConstants.JWT_AUDIENCE]
                ?? throw new Exception(ResponseConstants.ConfigurationPropertyNotFound(ConfigurationConstants.JWT_AUDIENCE));

            var privateKey = Environment.GetEnvironmentVariable(ConfigurationConstants.JWT_PRIVATE_KEY)
                ?? configuration[ConfigurationConstants.JWT_PRIVATE_KEY]
                ?? throw new Exception(ResponseConstants.ConfigurationPropertyNotFound(ConfigurationConstants.JWT_PRIVATE_KEY));

            var securityKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(privateKey));

            var now = DateTimeHelper.UtcNow();
            var randomExpiration = rnd.Next(Convert.ToInt32(configuration[ConfigurationConstants.JWT_EXPIRATION_IN_MINUTES_MIN] ?? "1"), Convert.ToInt32(configuration[ConfigurationConstants.JWT_EXPIRATION_IN_MINUTES_MAX] ?? "5"));
            var timespanExpiration = TimeSpan.FromMinutes(randomExpiration);
            var datetimeExpiration = now.Add(TimeSpan.FromMinutes(randomExpiration));

            return new TokenConfiguration
            {
                Issuer = issuer,
                Audience = audience,
                SecurityKey = securityKey,
                Expiration = datetimeExpiration,
                ExpirationTimeSpan = timespanExpiration
            };
        }
    }
}
