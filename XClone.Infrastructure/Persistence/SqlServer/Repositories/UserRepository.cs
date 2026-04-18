using Microsoft.EntityFrameworkCore;
using XClone.Domain.Database.SqlServer.Context;
using XClone.Domain.Database.SqlServer.Entities;
using XClone.Domain.Interfaces.Repositories;

namespace XClone.Infrastructure.Persistence.SqlServer.Repositories
{
    // Hacemos la clase pública y heredamos de IUserRepository
    public class UserRepository(XcloneContext context) : GenericRepository<User>(context), IUserRepository
    {
        //public async Task<User> Create(User user)
        //{
        //    try
        //    {
        //        // insert
        //        await context.Users.AddAsync(user);

        //        // execution // commit
        //        //await context.SaveChangesAsync();

        //        return user;
        //    }
        //    catch (Exception)
        //    {
        //        throw;
        //    }
        //}

        public async Task<bool> ClearRoles(List<UserRole> roles)
        {
            context.UserRoles.RemoveRange(roles);
            return true;
        }

        public async Task<User?> Get(Guid userId)
        {
            try
            {
                // Solo traemos el usuario si existe y NO está eliminado (IsActive == true)
                //return await context.Users.FirstOrDefaultAsync(x => x.Id == userId && x.DeletedAt == null);
                return await context.Users
                    .Include(user => user.UserRoleUsers)
                    .ThenInclude(UserRoles => UserRoles.Role)
                    .FirstOrDefaultAsync(x => x.Id == userId && x.DeletedAt == null);
            }
            catch (Exception)
            {
                throw;
            }
        }

        public async Task<User?> Get(string email)
        {
            try
            {
                // Solo traemos el usuario si existe y NO está eliminado (IsActive == true)
                //return await context.Users.FirstOrDefaultAsync(x => x.Email == email && x.DeletedAt == null);
                return await context.Users
                    .Include(user => user.UserRoleUsers)
                    .ThenInclude(userRoles => userRoles.Role)
                    .FirstOrDefaultAsync(x => x.Email == email && x.DeletedAt == null);
            }
            catch (Exception)
            {
                throw;
            }
        }

        public async Task<Role?> GetRole(string name)
        {
            return await context.Roles.FirstOrDefaultAsync(x => x.Name == name);
        }

        public async Task<Role?> GetRole(Guid id)
        {
            return await context.Roles.FirstOrDefaultAsync(x => x.Id == id);
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

        public async Task<bool> HasCreated()
        {
            try
            {

                return await context.Users.AnyAsync();
            }
            catch (Exception)
            {
                throw;
            }
        }

        //public async Task<bool> IfExists(Guid userId)
        //{
        //    try
        //    {
        //        return await context.Users.AnyAsync(x => x.Id == userId);
        //    }
        //    catch (Exception)
        //    {
        //        throw;
        //    }
        //}

        //public async Task<bool> IfExists(string email)
        //{
        //    return await context.Users.AnyAsync(x => x.Email == email);
        //}

        public IQueryable<User> Queryable()
        {
            try
            {
                // Retornamos un Queryable que por defecto excluya a los usuarios borrados
                return context.Users.Where(x => x.DeletedAt == null).AsQueryable();
            }
            catch (Exception)
            {
                throw;
            }
        }

        //public async Task<User> Update(User user)
        //{
        //    try
        //    {
        //        context.Users.Update(user);
        //        //await context.SaveChangesAsync();

        //        return user;
        //    }
        //    catch (Exception)
        //    {
        //        throw;
        //    }
        //}
    }
}