using XClone.Domain.Database.SqlServer.Entities;

namespace XClone.Domain.Interfaces.Repositories
{
    public interface IUserRepository : IGenericRepository<User>
    {
        //Task<User> Create(User user);
        Task<User?> Get(Guid userId);
        Task<User?> Get(string email);
        //IQueryable<User> Queryable();
        Task<User?> GetUserName(string? userName, string? email);
        //Task<bool> IfExists(Guid userId);
        //Task<bool> IfExists(string email);

        //Task<User> Update(User user);
        Task<bool> HasCreated();

        // Roles
        //Task<Role?> GetRole(string name);
        //Task<Role?> GetRole(Guid id);
        Task<bool> ClearRoles(List<UserRole> roles);
    }
}
