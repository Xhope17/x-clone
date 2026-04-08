using Microsoft.Extensions.Configuration;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using XClone.Domain.Database.SqlServer.Entities;
using XClone.Shared.Constants;

namespace XClone.Shared.Helpers
{
    public static class TokenHelper
    {
        public static string Create(User user, IConfiguration configuration)
        {
            var issuer = Environment.GetEnvironmentVariable(ConfigurationConstants.JWT_ISSUER) //produccion y desarrollo
                ?? configuration[ConfigurationConstants.JWT_ISSUER]
                ?? throw new Exception(ResponseConstans.ConfigurationPropertyNotFound(ConfigurationConstants.JWT_ISSUER));

            var audience = Environment.GetEnvironmentVariable(ConfigurationConstants.JWT_AUDIENCE) //produccion y desarrollo
                ?? configuration[ConfigurationConstants.JWT_AUDIENCE]
                ?? throw new Exception(ResponseConstans.ConfigurationPropertyNotFound(ConfigurationConstants.JWT_AUDIENCE));

            var privateKey = Environment.GetEnvironmentVariable(ConfigurationConstants.JWT_PRIVATE_KEY) //produccion y desarrollo
                ?? configuration[ConfigurationConstants.JWT_PRIVATE_KEY]
                ?? throw new Exception(ResponseConstans.ConfigurationPropertyNotFound(ConfigurationConstants.JWT_PRIVATE_KEY));

            var expirationInMinutes = Environment.GetEnvironmentVariable(ConfigurationConstants.JWT_EXPIRATION_IN_MINUTES_MIN) //produccion y desarrollo
                ?? configuration[ConfigurationConstants.JWT_EXPIRATION_IN_MINUTES_MIN]
                ?? "10";

            var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(privateKey));
            var signingCredentials = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

            var now = DateTimeHelper.UtcNow();
            var expiration = now.AddMinutes(Convert.ToDouble(expirationInMinutes));

            var claims = new[]
            {
                //new Claim(ClaimTypes.Role, "Administrador"),
                //new Claim(ClaimTypes.Email, user.Email),
                //new Claim("UserId", user.Id.ToString())

                new Claim(ClaimsConstants.USER_ID, user.Id.ToString())
            };

            var token = new JwtSecurityToken(
                issuer: issuer,
                audience: audience,
                expires: expiration,
                signingCredentials: signingCredentials,
                claims: claims
                );

            return new JwtSecurityTokenHandler().WriteToken(token);
        }
    }
}
