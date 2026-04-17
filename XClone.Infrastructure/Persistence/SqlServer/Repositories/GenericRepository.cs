using XClone.Domain.Database.SqlServer.Context;

namespace XClone.Infrastructure.Persistence.SqlServer.Repositories
{
    public class GenericRepository<T>(XcloneContext context) where T : class
    {
        public async Task<T> Create(T entity)
        {
            context.Set<T>().Add(entity);
            return entity;
        }

        public async Task<bool> Delete(T entity)
        {
            context.Set<T>().Remove(entity);
            return true;
        }

        public IQueryable<T> Queryable()
        {
            return context.Set<T>().AsQueryable();
        }

        public async Task<T> Update(T entity)
        {
            context.Set<T>().Update(entity);
            return entity;
        }
    }
}
