using XClone.Application.Models.DTOs;
using XClone.Application.Models.Requets.User;
using XClone.Application.Models.Responses;

namespace XClone.Application.Interfaces.Services
{
    public interface IUserService
    {

        public GenericResponse<UserDto> Create(CreateUserRequest model);
        public GenericResponse<UserDto> Update(Guid postId, UpdateUserRequest model);

        public GenericResponse<List<UserDto>> Get(int limit, int offset);

        public GenericResponse<UserDto?> Get(Guid userId);

        public GenericResponse<bool> Delete(Guid userId);
    }
}
