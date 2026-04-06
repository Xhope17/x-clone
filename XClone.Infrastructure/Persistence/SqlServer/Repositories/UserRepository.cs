using Microsoft.EntityFrameworkCore;
using XClone.Domain.Database.SqlServer.Context;
using XClone.Domain.Database.SqlServer.Entities;
using XClone.Domain.Interfaces.Repositories;

namespace XClone.Infrastructure.Persistence.SqlServer.Repositories
{
    // Hacemos la clase pública y heredamos de IUserRepository
    public class UserRepository(XcloneContext context) : IUserRepository
    {
        public async Task<User> Create(User user)
        {
            try
            {
                // insert
                await context.Users.AddAsync(user);

                // execution // commit
                await context.SaveChangesAsync();

                return user;
            }
            catch (Exception)
            {
                throw;
            }
        }

        public async Task<User?> Get(Guid userId)
        {
            try
            {
                // Solo traemos el usuario si existe y NO está eliminado (IsActive == true)
                return await context.Users.FirstOrDefaultAsync(x => x.Id == userId && x.IsActive == true);
            }
            catch (Exception)
            {
                throw;
            }
        }


        public async Task<User?> GetUserName(string userName, string email)
        {
            try
            {
                // Solo traemos el usuario si existe y NO está eliminado (IsActive == true)
                return await context.Users.FirstOrDefaultAsync(x => x.UserName == userName && x.Email == email && x.IsActive == true);
            }
            catch (Exception)
            {
                throw;
            }
        }

        public async Task<bool> IfExists(Guid userId)
        {
            try
            {
                return await context.Users.AnyAsync(x => x.Id == userId);
            }
            catch (Exception)
            {
                throw;
            }
        }

        public IQueryable<User> Queryable()
        {
            try
            {
                // Retornamos un Queryable que por defecto excluya a los usuarios borrados
                return context.Users.Where(x => x.IsActive == true).AsQueryable();
            }
            catch (Exception)
            {
                throw;
            }
        }

        public async Task<User> Update(User user)
        {
            try
            {
                context.Users.Update(user);
                await context.SaveChangesAsync();

                return user;
            }
            catch (Exception)
            {
                throw;
            }
        }
    }
}