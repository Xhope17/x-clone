using Microsoft.EntityFrameworkCore;
using XClone.Domain.Database.SqlServer.Context;
using XClone.Domain.Database.SqlServer.Entities;
using XClone.Domain.Interfaces.Repositories;

namespace XClone.Infrastructure.Persistence.SqlServer.Repositories
{
    public class PostRepository(XcloneContext context) : IPostRepository
    {
        public async Task<Post> Create(Post post)
        {
            try
            {
                //insert
                await context.Posts.AddAsync(post);

                return post;
            }
            catch (Exception ex)
            {
                throw;
            }
        }

        public async Task<bool> Delete(Post post)
        {
            try
            {
                context.Posts.Remove(post);
                //await context.SaveChangesAsync();

                var result = await context.SaveChangesAsync();

                return result > 0;

            }
            catch (Exception)
            {
                return false;
            }
        }

        public async Task<Post?> Get(Guid postId)
        {
            try
            {
                //return await context.Posts.FirstOrDefaultAsync(x => x.Id == postId);
                return await context.Posts.FirstOrDefaultAsync(x => x.Id == postId);


            }
            catch (Exception ex)
            {
                throw;
            }
        }
        public async Task<bool> IfExists(Guid postId)
        {
            try
            {
                return await context.Posts.AnyAsync(x => x.Id == postId);
            }
            catch (Exception ex)
            {
                throw;
            }
        }

        public IQueryable<Post> Queryable()
        {
            try
            {
                return context.Posts.AsQueryable();
            }
            catch (Exception)
            {
                throw;
            }

        }

        public async Task<Post> Update(Post post)
        {
            try
            {
                context.Posts.Update(post);
                await context.SaveChangesAsync();

                return post;
            }
            catch (Exception ex)
            {
                return null;
            }
        }
    }
}
