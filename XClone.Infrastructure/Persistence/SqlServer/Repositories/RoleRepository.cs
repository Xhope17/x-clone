using Microsoft.EntityFrameworkCore;
using XClone.Domain.Database.SqlServer.Context;
using XClone.Domain.Database.SqlServer.Entities;
using XClone.Domain.Interfaces.Repositories;

namespace XClone.Infrastructure.Persistence.SqlServer.Repositories
{
    public class RoleRepository(XcloneContext context) : GenericRepository<Role>(context), IRoleRepository
    {
        public async Task<Role?> Get(Guid id)
        {
            return await context.Roles.FirstOrDefaultAsync(r => r.Id == id);
        }
    }
}
