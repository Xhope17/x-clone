using XClone.Domain.Database.SqlServer.Entities;

namespace XClone.Domain.Interfaces.Repositories
{
    public interface IPostRepository
    {
        Task<Post> Create(Post post);
        Task<Post> Get(Guid postId);
        IQueryable<Post> Queryable();
        Task<bool> IfExists(Guid postId);
        Task<Post> Update(Post postId);
        Task<bool> Delete(Post post);

    }
}
