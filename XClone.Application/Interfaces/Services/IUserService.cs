using System.Security.Claims;
using XClone.Application.Models.DTOs;
using XClone.Application.Models.Requets.User;
using XClone.Application.Models.Responses;

namespace XClone.Application.Interfaces.Services
{
    public interface IUserService
    {

        public Task<GenericResponse<UserDto>> Create(CreateUserRequest model, Claim claim);
        public Task<GenericResponse<UserDto>> Update(Guid userId, UpdateUserRequest model, Claim claim);

        //public Task<GenericResponse<List<PostDto>>> Get(int limit, int offset);
        public GenericResponse<List<UserDto>> Get(FilterUserRequest model);


        public Task<GenericResponse<UserDto>> Get(Guid userId);

        public Task<GenericResponse<bool>> Delete(Guid userId);

        //CreateFristUser
        public Task CreateFristUser();
    }
}
