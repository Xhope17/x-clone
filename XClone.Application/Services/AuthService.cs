using Microsoft.Extensions.Configuration;
using XClone.Application.Helpers;
using XClone.Application.Interfaces.Services;
using XClone.Application.Models.Requets.Auth;
using XClone.Application.Models.Responses;
using XClone.Domain.Exceptions;
using XClone.Domain.Interfaces.Repositories;
using XClone.Shared;
using XClone.Shared.Helpers;

namespace XClone.Application.Services
{
    public class AuthService(IUserRepository userRepository, IConfiguration configuration, ICacheService cacheService) : IAuthService
    {
        public async Task<GenericResponse<string>> Login(LoginAuthRequest model)
        {
            var user = await userRepository.Get(model.Email)
                ?? throw new BadRequestException("Usuario o contraeeña incorrectos");

            var validatePassword = Hasher.ComparePassword(model.Password, user.Password);

            if (!validatePassword)
            {
                throw new BadRequestException("Usuario o contraeeña incorrectos");
            }

            var token = TokenHelper.Create(user, configuration);

            //var cacheKey = CacheHelper.AuthToken(token);

            //cacheService.Create($"auth:tokens:{token}", TimeSpan.FromMinutes(5), token);

            //cacheService.Create(token);


            return ResponseHelper.Create(token);
        }
    }
}
