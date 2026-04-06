using XClone.Domain.Database.SqlServer.Entities;

namespace XClone.Domain.Interfaces.Repositories
{
    public interface IUserRepository
    {
        Task<User> Create(User user);
        Task<User?> Get(Guid userId);
        Task<User?> GetUserName(string? userName, string? email);
        IQueryable<User> Queryable();
        Task<bool> IfExists(Guid userId);
        Task<User> Update(User user);
    }
}
