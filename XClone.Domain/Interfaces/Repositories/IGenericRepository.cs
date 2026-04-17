namespace XClone.Domain.Interfaces.Repositories
{
    public interface IGenericRepository<T> where T : class
    {
        Task<T> Create(T entity);
        Task<T> Update(T entity);
        IQueryable<T> Queryable();
        Task<bool> Delete(T entity);
    }
}
