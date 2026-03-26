using XClone.Application.Models.DTOs;
using XClone.Application.Models.Requets.Post;
using XClone.Application.Models.Responses;

namespace XClone.Application.Interfaces.Services
{
    public interface IPostService
    {
        public GenericResponse<PostDto> Create(CreatePostRequest model);
        public GenericResponse<PostDto> Update(Guid postId, UpdatePostRequest model);

        public GenericResponse<List<PostDto>> Get(int limit, int offset);

        public GenericResponse<PostDto?> Get(Guid postId);

        public GenericResponse<bool> Delete(Guid postId);
    }
}
