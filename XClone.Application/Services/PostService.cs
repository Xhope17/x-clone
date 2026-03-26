using XClone.Application.Helpers;
using XClone.Application.Interfaces.Services;
using XClone.Application.Models.DTOs;
using XClone.Application.Models.Requets.Post;
using XClone.Application.Models.Responses;
using XClone.Shared;
using XClone.Shared.Helpers;

namespace XClone.Application.Services
{
    public class PostService(Cache<PostDto> cache) : IPostService
    {
        public GenericResponse<PostDto> Create(CreatePostRequest model)
        {
            var post = new PostDto
            {
                PostId = Guid.NewGuid(),
                AutorId = model.AutorId,
                Comunidad = model.Comunidad,
                Texto = model.Texto,
                CreatedAt = DateTimeHelper.UtcNow(),
                JoinedAt = DateTimeHelper.UtcNow()
            };
            cache.Add(post.PostId.ToString(), post);

            return ResponseHelper.Create(post, "Post subido correctamente");
        }

        public GenericResponse<bool> Delete(Guid postId)
        {
            var isDeleted = cache.Get(postId.ToString());

            if (isDeleted is null)
            {
                return ResponseHelper.Create(false);
            }

            cache.Delete(postId.ToString());

            return ResponseHelper.Create(true, "Post eliminado");
        }

        public GenericResponse<List<PostDto>> Get(int limit, int offset)
        {
            var posts = cache.Get();
            return ResponseHelper.Create(posts);
        }

        public GenericResponse<PostDto?> Get(Guid postId)
        {
            var post = cache.Get(postId.ToString());

            return ResponseHelper.Create(post);
        }

        public GenericResponse<PostDto> Update(Guid postId, UpdatePostRequest model)
        {
            var exist = cache.Get(postId.ToString());

            if (exist is null)
            {
                return ResponseHelper.Create<PostDto>(null!, "");
            }

            return ResponseHelper.Create(exist, "Post actualizado");
        }

    }
}
