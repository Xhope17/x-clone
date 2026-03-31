using XClone.Application.Helpers;
using XClone.Application.Interfaces.Services;
using XClone.Application.Models.DTOs;
using XClone.Application.Models.Requets.Post;
using XClone.Application.Models.Responses;
using XClone.Domain.Database.SqlServer.Entities;
using XClone.Domain.Exceptions;
using XClone.Domain.Interfaces.Repositories;

namespace XClone.Application.Services
{
    //Guardado en cache
    //public class PostService(Cache<PostDto> cache, XcloneContext xcloneContext) : IPostService
    public class PostService(IPostRepository repository) : IPostService

    {
        //Crear post
        public Task<GenericResponse<PostDto>> Create(CreatePostRequest model)
        {
            //var post = new PostDto
            //{
            //    PostId = Guid.NewGuid(),
            //    AutorId = model.AutorId,
            //    Comunidad = model.Comunidad,
            //    Texto = model.Texto,
            //    CreatedAt = DateTimeHelper.UtcNow(),
            //    JoinedAt = DateTimeHelper.UtcNow()
            //};
            //cache.Add(post.PostId.ToString(), post);

            var create = repository.Create(new Post
            {
                //PostId = Guid.NewGuid(),
                //AuthorId = Guid.Parse(model.AutorId),
                //Community = model.Comunidad.ToString(),
                Texto = model.Texto,
                //FechaCreacion = DateTimeHelper.UtcNow()

                //CommunityId = post.CommunityId,

            });



            return ResponseHelper.Create(Map(create));
        }

        //borrar post
        public async Task<GenericResponse<bool>> Delete(Guid postId)
        {
            /*por cache
            //var isDeleted = cache.Get(postId.ToString());

            //if (isDeleted is null)
            //{
            //    return ResponseHelper.Create(false);
            //}

            //cache.Delete(postId.ToString());

            //return ResponseHelper.Create(true, "Post eliminado");
            */

            //var fPost = repository.Get(post) ?? throw new Exception("Post no encontrado");
            var post = await GetPost(postId);

            post.IsDeleted = true;

            await repository.Update(post);

            return ResponseHelper.Create(true);
        }

        //obtener todos los post
        //public GenericResponse<List<PostDto>> Get(int limit, int offset)
        public Task<GenericResponse<List<PostDto>>> Get(FilterPostRequest model)
        {
            //var posts = cache.Get();
            //return ResponseHelper.Create(posts);

            var queryble = repository.Queryable();

            if (string.IsNullOrWhiteSpace(model.Texto))
            {
                //queryble = queryble.Where(x => x.Author == model.Author);
                queryble = queryble.Where(x => x.Texto != null && x.Texto.Contains(model.Texto ?? ""));

            }

            //realizar paginacion y consulta
            var posts = queryble.Take(model.Limit).Skip(model.Offset).ToList();

            //Mapper psot
            List<PostDto> mapped = [];
            foreach (var post in posts)
            {
                mapped.Add(Map(post));
            }

            return ResponseHelper.Create(mapped);
        }

        //obtener un post por id
        public async Task<GenericResponse<PostDto>> Get(Guid postId)
        {
            //var post = cache.Get(postId.ToString());
            //return ResponseHelper.Create(post, "Usuario encontrado");
            var post = await GetPost(postId);

            return ResponseHelper.Create(Map(post));

        }

        //editar un post
        public async Task<GenericResponse<PostDto>> Update(Guid postId, UpdatePostRequest model)
        {
            //var exist = cache.Get(postId.ToString());

            //if (exist is null)
            //{
            //    return ResponseHelper.Create<PostDto>(null!, ValidationConstants.POST_NOT_FOUND);
            //}

            //exist.AutorId = model.AutorId;
            //exist.Comunidad = model.Comunidad;
            //exist.Texto = model.Texto;

            //cache.Update(postId.ToString(), exist);

            //return ResponseHelper.Create(exist, "Post actualizado");

            var post = await GetPost(postId);

            post.Texto = model.Texto ?? post.Texto;
            post.AuthorId = model.AutorId != null ? Guid.Parse(model.AutorId) : post.AuthorId;
            post.Community = model.Comunidad != null ? new Community { Id = Guid.Parse(model.Comunidad) } : post.Community;
            var update = await repository.Update(post);

            return ResponseHelper.Create(Map(update));

        }

        private async Task<Post> GetPost(Guid postId)
        {
            return await repository.Get(postId)
                //?? throw new Exception("Post no encontrado");
                ?? throw new NotFoundException("Post no encontrado");


        }

        private PostDto Map(Post post)
        {
            return new PostDto
            {

                Texto = post.Texto,

            };
        }
    }
}
