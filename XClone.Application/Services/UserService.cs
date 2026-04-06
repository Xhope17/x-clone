using XClone.Application.Helpers;
using XClone.Application.Interfaces.Services;
using XClone.Application.Models.DTOs;
using XClone.Application.Models.Requets.User;
using XClone.Application.Models.Responses;
using XClone.Domain.Database.SqlServer.Entities;
using XClone.Domain.Exceptions;
using XClone.Domain.Interfaces.Repositories;
using XClone.Shared.Constants;
using XClone.Shared.Helpers;

namespace XClone.Application.Services
{
    public class UserService(IUserRepository repository) : IUserService
    {

        //crear un usuario
        public async Task<GenericResponse<UserDto>> Create(CreateUserRequest model)
        {
            /*
            //si es mayor de edad, se puede crear el usuario
            if (model.Edad < 18)
            {
                return ResponseHelper.Create<UserDto>(null, ValidationConstants.INVALID_AGE);
            }
            var user = new UserDto
            {
                UserId = Guid.NewGuid(),
                UserName = model.UserName,
                DisplayName = model.DisplayName,
                Edad = model.Edad,
                Email = model.Email,
                PhoneNumber = model.PhoneNumber,
                CreatedAt = DateTimeHelper.UtcNow(),
                JoinedAt = DateTimeHelper.UtcNow(),
                IsActive = true
            };

            cache.Add(user.UserId.ToString(), user);
            return ResponseHelper.Create(user, "Usuario creado");
            */

            //throw new Exception("La base de datos, no e pudo conectar con el servicio");

            var userExist = await repository.GetUserName(model.UserName, model.Email);

            if (userExist != null)
            {
                return ResponseHelper.Create<UserDto>(null!, null, ValidationConstants.DUPLICATE);
            }

            if (model.Edad < 18)
            {
                // Asegúrate de que el método devuelva el tipo correcto en caso de error
                return ResponseHelper.Create<UserDto>(null!, null, ValidationConstants.INVALID_AGE);
            }


            var create = await repository.Create(new User
            {
                UserName = model.UserName,
                DisplayName = model.DisplayName,
                Email = model.Email,
                Age = model.Edad,
                PhoneNumber = model.PhoneNumber,

                // encriptar luego la contraseña antes de guardarla en la base de datos
                PasswordHash = model.Password
            });

            return ResponseHelper.Create(Map(create));
        }

        //borrar
        public async Task<GenericResponse<bool>> Delete(Guid userId)
        {
            /*cache
             * 
            var isDeleted = cache.Get(userId.ToString());

            if (isDeleted is null)
            {
                return ResponseHelper.Create(false);
            }
            cache.Delete(userId.ToString());

            return ResponseHelper.Create(true, "Usuario eliminado");
            */

            var user = await GetUser(userId);

            user.DeletedAt = DateTimeHelper.UtcNow();
            user.IsActive = false;

            await repository.Update(user);

            return ResponseHelper.Create(true);
        }

        //Get all users
        public GenericResponse<List<UserDto>> Get(FilterUserRequest model)
        {
            var queryable = repository.Queryable();

            // Solo traer usuarios que NO estén eliminados
            queryable = queryable.Where(x => x.IsActive == true);

            // Filtrado por UserName (ejemplo de búsqueda)
            if (!string.IsNullOrWhiteSpace(model.UserName))
            {
                queryable = queryable.Where(x => x.UserName.Contains(model.UserName ?? ""));
            }

            if (!string.IsNullOrWhiteSpace(model.DisplayName))
            {
                queryable = queryable.Where(x => x.DisplayName.Contains(model.DisplayName ?? ""));
            }

            // Realizar paginación y consulta
            var users = queryable.Skip(model.Offset).Take(model.Limit).ToList();

            // Mapear a DTOs
            List<UserDto> mapped = [];
            foreach (var user in users)
            {
                mapped.Add(Map(user));
            }

            return ResponseHelper.Create(mapped);
        }

        //get user por id
        public async Task<GenericResponse<UserDto>> Get(Guid userId)
        {
            /* cache
             * 
            var user = cache.Get(userId.ToString());

            return ResponseHelper.Create(user, "Usuario encontrado");
            */
            var user = await GetUser(userId);

            return ResponseHelper.Create(Map(user));
        }


        public async Task<GenericResponse<UserDto>> Update(Guid userId, UpdateUserRequest model)
        {
            /* cache
             * 
            var exist = cache.Get(userId.ToString());

            if (exist is null)
            {
                return ResponseHelper.Create<UserDto>(null!, ValidationConstants.USER_NOT_FOUND);
            }

            exist.UserName = model.UserName;
            exist.DisplayName = model.UserName;
            exist.Edad = model.Edad;
            exist.Email = model.Email;
            exist.PhoneNumber = model.PhoneNumber;

            cache.Update(userId.ToString(), exist);

            return ResponseHelper.Create(exist, "Usuario actualizado");
            */
            var user = await GetUser(userId);

            // Solo actualizamos los campos que el request envía. 
            // Si viene null, conservamos el valor actual de la BD.
            user.UserName = model.UserName ?? user.UserName;
            user.DisplayName = model.DisplayName ?? user.DisplayName;
            user.Age = model.Age ?? user.Age;
            user.Email = model.Email ?? user.Email;
            user.PhoneNumber = model.PhoneNumber ?? user.PhoneNumber;

            user.UpdatedAt = DateTimeHelper.UtcNow();

            var update = await repository.Update(user);

            return ResponseHelper.Create(Map(update));
        }

        //peticiones internas
        private async Task<User> GetUser(Guid userId)
        {
            return await repository.Get(userId)
                ?? throw new NotFoundException(ResponseConstans.USER_NOT_EXIST); // Asegúrate de tener esta constante
        }

        //obtener por username
        //private async Task<User> GetUser(string userName)
        //{
        //    //var user = repository.Queryable().FirstOrDefault(x => x.UserName == userName);
        //    //if (user is null)
        //    //{
        //    //    throw new NotFoundException(ResponseConstans.USER_NOT_EXIST);
        //    //}
        //    //return user;

        //    return await repository.GetUserName(userName)
        //        ?? throw new NotFoundException(ResponseConstans.USER_NOT_EXIST); // Asegúrate de tener esta constante   
        //}


        //map
        private UserDto Map(User user)
        {
            return new UserDto
            {
                Id = user.Id,
                UserName = user.UserName,
                DisplayName = user.DisplayName,
                Email = user.Email,
                Age = user.Age,
                PhoneNumber = user.PhoneNumber,
                IsVerified = user.IsVerified,
                PinnedPostId = user.PinnedPostId,
                TimezoneId = user.TimezoneId,
                CityId = user.CityId,
                JoinedAt = user.JoinedAt,
                IsActive = user.IsActive,
                CreateAt = user.CreateAt,
                UpdatedAt = user.UpdatedAt,
                DeletedAt = user.DeletedAt
            };
        }
    }
}
