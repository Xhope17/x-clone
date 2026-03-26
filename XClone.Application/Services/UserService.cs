using XClone.Application.Helpers;
using XClone.Application.Interfaces.Services;
using XClone.Application.Models.DTOs;
using XClone.Application.Models.Requets.User;
using XClone.Application.Models.Responses;
using XClone.Shared;
using XClone.Shared.Helpers;

namespace XClone.Application.Services
{
    public class UserService(Cache<UserDto> cache) : IUserService
    {
        public GenericResponse<UserDto> Create(CreateUserRequest model)
        {
            //si es mayor de edad, se puede crear el usuario

            if (int.TryParse(model.Edad, out int edad))
            {
                if (edad < 18)
                {
                    return ResponseHelper.Create<UserDto>(null, "El usuario debe ser mayor de edad");
                }
            }
            else
            {
                return ResponseHelper.Create<UserDto>(null, "La edad debe ser un número válido");
            }

            var user = new UserDto
            {
                UserId = Guid.NewGuid(),
                UserName = model.UserName,
                Edad = model.Edad,
                Email = model.Email,
                PhoneNumber = model.PhoneNumber,
                CreatedAt = DateTimeHelper.UtcNow(),
                JoinedAt = DateTimeHelper.UtcNow(),
                IsActive = true
            };

            cache.Add(user.UserId.ToString(), user);
            return ResponseHelper.Create(user, "Usuario creado");
        }

        public GenericResponse<bool> Delete(Guid userId)
        {
            var isDeleted = cache.Get(userId.ToString());

            if (isDeleted is null)
            {
                return ResponseHelper.Create(false);
            }
            cache.Delete(userId.ToString());

            return ResponseHelper.Create(true, "Usuario eliminado");
        }

        public GenericResponse<List<UserDto>> Get(int limit, int offset)
        {
            var users = cache.Get();

            return ResponseHelper.Create(users);
        }

        public GenericResponse<UserDto?> Get(Guid userId)
        {
            var user = cache.Get(userId.ToString());

            return ResponseHelper.Create(user);
        }

        public GenericResponse<UserDto> Update(Guid postId, UpdateUserRequest model)
        {
            throw new NotImplementedException();
        }
    }
}
