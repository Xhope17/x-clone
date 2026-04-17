using Microsoft.Extensions.Configuration;
using XClone.Application.Helpers;
using XClone.Application.Interfaces.Services;
using XClone.Application.Models.DTOs;
using XClone.Application.Models.Responses;
using XClone.Shared.Constants;

namespace XClone.Application.Services
{
    public class AppService(IConfiguration configuration) : IAppService
    {
        public async Task<GenericResponse<AppInfoDto>> Info()
        {
            return ResponseHelper.Create(new AppInfoDto
            {
                Version = configuration[ConfigurationConstants.VERSION] ?? "0.0.0"
            });
        }
    }
}
