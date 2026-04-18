using Microsoft.Extensions.Configuration;
using XClone.Application.Helpers;
using XClone.Application.Interfaces.Services;
using XClone.Application.Models.DTOs;
using XClone.Application.Models.Responses;
using XClone.Domain.Database.SqlServer.Entities;
using XClone.Domain.DataBase.SqlServer;
using XClone.Shared.Constants;

namespace XClone.Application.Services
{
    public class AppService(IConfiguration configuration, IUnitOfWork uow) : IAppService
    {
        public async Task<GenericResponse<AppInfoDto>> Info()
        {
            return ResponseHelper.Create(new AppInfoDto
            {
                Version = configuration[ConfigurationConstants.VERSION] ?? "0.0.0",
                Roles = [.. uow.roleRepository.Queryable().Where(x => x.IsActive).ToList().Select(r => MapRole(r))]
            });
        }

        private RoleDto MapRole(Role role)
        {
            return new RoleDto
            {
                Id = role.Id,
                Name = role.Name,
                Description = role.Description,
            };
        }
    }
}
