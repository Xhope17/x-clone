using XClone.Application.Models.DTOs;
using XClone.Application.Models.Requets.Post;
using XClone.Application.Models.Responses;

namespace XClone.Application.Interfaces.Services
{
    public interface IPostService
    {
        public Task<GenericResponse<PostDto>> Create(CreatePostRequest model);
        public Task<GenericResponse<PostDto>> Update(Guid postId, UpdatePostRequest model);

        //public Task<GenericResponse<List<PostDto>>> Get(int limit, int offset);
        public Task<GenericResponse<List<PostDto>>> Get(FilterPostRequest model);


        public Task<GenericResponse<PostDto>> Get(Guid postId);

        public Task<GenericResponse<bool>> Delete(Guid postId);
    }
}
