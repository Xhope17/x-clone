using XClone.Domain.Database.SqlServer.Entities;

namespace XClone.Domain.Interfaces.Repositories
{
    public interface IRoleRepository : IGenericRepository<Role>
    {
        Task<Role?> Get(Guid id);
    }
}
