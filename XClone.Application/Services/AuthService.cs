using Microsoft.Extensions.Configuration;
using XClone.Application.Helpers;
using XClone.Application.Interfaces.Services;
using XClone.Application.Models.Helpers;
using XClone.Application.Models.Requets.Auth;
using XClone.Application.Models.Responses;
using XClone.Application.Models.Responses.Auth;
using XClone.Domain.DataBase.SqlServer;
using XClone.Domain.Exceptions;
using XClone.Shared;
using XClone.Shared.Constants;
using XClone.Shared.Helpers;

namespace XClone.Application.Services
{
    //public class AuthService(IUserRepository userRepository, IConfiguration configuration, ICacheService cacheService) : IAuthService
    public class AuthService(IUnitOfWork uow, IConfiguration configuration, ICacheService cacheService, IEmailTemplateService emailTemplateService, SMTP smtp) : IAuthService
    {
        public async Task<GenericResponse<LoginAuthResponse>> Login(LoginAuthRequest model)
        {
            var user = await uow.userRepository.Get(model.Email)
                ?? throw new BadRequestException(ResponseConstants.AUTH_USER_OR_PASSWORD_NOT_FOUND);

            var validatePassword = Hasher.ComparePassword(model.Password, user.Password);
            if (!validatePassword)
            {
                var templateFailed = await emailTemplateService.Get(EmailTemplateNameConstants.AUTH_LOGIN_FAILED, []);
                await smtp.Send(model.Email, templateFailed.Subject, templateFailed.Body);
                throw new BadRequestException(ResponseConstants.AUTH_USER_OR_PASSWORD_NOT_FOUND);
            }

            //var token = TokenHelper.Create(user.Id, configuration, cacheService);
            var token = TokenHelper.Create(user.Id, [.. user.UserRoleUsers.Select(x => x.Role.Name)], configuration, cacheService);
            var refreshToken = TokenHelper.CreateRefresh(user.Id, configuration, cacheService);

            var templateSuccess = await emailTemplateService.Get(EmailTemplateNameConstants.AUTH_LOGIN_SUCCESS, new Dictionary<string, string>
            {
                { "datetime", DateTimeHelper.UtcNow().ToString() }
            });
            await smtp.Send(model.Email, templateSuccess.Subject, templateSuccess.Body);

            return ResponseHelper.Create(new LoginAuthResponse
            {
                Token = token,
                RefreshToken = refreshToken
            });
        }

        public async Task<GenericResponse<LoginAuthResponse>> Renew(RenewAuthRequest model)
        {
            var findRefreshToken = cacheService.Get<RefreshToken>(CacheHelper.AuthRefreshTokenKey(model.RefreshToken))
                ?? throw new NotFoundException(ResponseConstants.AUTH_REFRESH_TOKEN_NOT_FOUND);

            //var token = TokenHelper.Create(findRefreshToken.UserId, configuration, cacheService);
            var user = await uow.userRepository.Get(findRefreshToken.UserId)
                ?? throw new NotFoundException(ResponseConstants.USER_NOT_EXIST);

            var token = TokenHelper.Create(findRefreshToken.UserId, [.. user.UserRoleUsers.Select(x => x.Role.Name)], configuration, cacheService);
            var refreshToken = TokenHelper.CreateRefresh(findRefreshToken.UserId, configuration, cacheService);

            cacheService.Delete(CacheHelper.AuthRefreshTokenKey(model.RefreshToken));

            return ResponseHelper.Create(new LoginAuthResponse
            {
                Token = token,
                RefreshToken = refreshToken
            });
        }
    }
}
