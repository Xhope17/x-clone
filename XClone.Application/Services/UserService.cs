using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using System.Security.Claims;
using XClone.Application.Helpers;
using XClone.Application.Interfaces.Services;
using XClone.Application.Models.DTOs;
using XClone.Application.Models.Requets.User;
using XClone.Application.Models.Responses;
using XClone.Application.Queries;
using XClone.Domain.Database.SqlServer.Entities;
using XClone.Domain.DataBase.SqlServer;
using XClone.Domain.Exceptions;
using XClone.Shared;
using XClone.Shared.Constants;
using XClone.Shared.Helpers;

namespace XClone.Application.Services
{
    //public class UserService(IUserRepository repository, IConfiguration configuration, SMTP smtp) : IUserService
    public class UserService(IUnitOfWork uow, IConfiguration configuration, SMTP smtp, IEmailTemplateService emailTemplateService) : IUserService
    {

        //crear un usuario
        public async Task<GenericResponse<UserDto>> Create(CreateUserRequest model, Claim claim)
        {
            /*
            //si es mayor de edad, se puede crear el usuario
            if (model.Edad < 18)
            {
                return ResponseHelper.Create<UserDto>(null, ValidationConstants.INVALID_AGE);
            }

            cache.Add(user.UserId.ToString(), user);
            return ResponseHelper.Create(user, "Usuario creado");
            */

            //throw new Exception("La base de datos, no e pudo conectar con el servicio");

            var executor = await GetExecutor(claim.Value);

            var userExist = await uow.userRepository.GetUserName(model.UserName, model.Email);

            if (userExist != null)
            {
                return ResponseHelper.Create<UserDto>(null!, null, null, ValidationConstants.DUPLICATE);
            }

            //
            if (model.RoleId == Guid.Empty)
            {
                throw new NotFoundException(ValidationConstants.IsEmpty("RoleId"));
            }

            /*Para validar
             * if (await uow.userRepository.IfExists(model.Email))
            //{
            //    throw new BadRequestException(ResponseConstants.USER_EMAIL_TAKED);
            }
            */

            await ValidateEmailIfExists(model.Email); //Validar si el email ya está registrado

            // Asegúrate de que el método devuelva el tipo correcto en caso de error
            //return ResponseHelper.Create<UserDto>(null!, null, ValidationConstants.INVALID_AGE);

            var password = Generate.RandomText(32);

            var roleToAssign = await ValidateRole(executor, model.RoleId); //Validar que el rol existe y que el executor tiene permisos para asignarlo

            var create = await uow.userRepository.Create(new User
            {
                UserName = model.UserName,
                DisplayName = model.DisplayName,
                Email = model.Email,
                Age = model.Edad,
                PhoneNumber = model.PhoneNumber,
                Position = "",
                // encriptar luego la contraseña antes de guardarla en la base de datos
                Password = Hasher.HashPassword(password),
                UserRoleUsers = [
                    new UserRole {
                        RoleId = roleToAssign.Id,
                        AssignedBy = executor.Id
                    }
                ]
            });

            //await smtp.Send(model.Email, "Registro de usuario - TalentInsights", $"Su contraseña es: {password}");
            var template = await emailTemplateService.Get(EmailTemplateNameConstants.USER_REGISTER, new Dictionary<string, string>
            {
                { "password", password }
            });
            await smtp.Send(model.Email, template.Subject, template.Body);

            await uow.SaveChangesAsync();
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

            await uow.userRepository.Update(user);
            await uow.SaveChangesAsync();

            return ResponseHelper.Create(true);
        }

        //Get all users
        public GenericResponse<List<UserDto>> Get(FilterUserRequest model)
        {
            var queryable = uow.userRepository.Queryable();

            //// Solo traer usuarios que NO estén eliminados
            //queryable = queryable.Where(x => x.IsActive == true);

            //// Filtrado por UserName (ejemplo de búsqueda)
            //if (!string.IsNullOrWhiteSpace(model.UserName))
            //{
            //    queryable = queryable.Where(x => x.UserName.Contains(model.UserName ?? ""));
            //}

            //if (!string.IsNullOrWhiteSpace(model.DisplayName))
            //{
            //    queryable = queryable.Where(x => x.DisplayName.Contains(model.DisplayName ?? ""));
            //}

            //// Realizar paginación y consulta
            //var users = queryable.Skip(model.Offset).Take(model.Limit).ToList();

            //// Mapear a DTOs
            //List<UserDto> mapped = [];
            //foreach (var user in users)
            //{
            //    mapped.Add(Map(user));
            //}

            //return ResponseHelper.Create(mapped);

            var users = queryable
                .Include(user => user.UserRoleUsers)
                .ThenInclude(userRole => userRole.Role)
                .ApplyQuery(model)
                .AsQueryable()
                .Skip(model.Offset)
                .Take(model.Limit)
                .Select(user => Map(user))
                .ToList();

            return ResponseHelper.Create(users, count: queryable.Count());
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


        public async Task<GenericResponse<UserDto>> Update(Guid userId, UpdateUserRequest model, Claim claim)
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
            var executor = await GetExecutor(claim.Value);

            // Solo actualizamos los campos que el request envía. 
            // Si viene null, conservamos el valor actual de la BD.
            user.UserName = model.UserName ?? user.UserName;
            user.DisplayName = model.DisplayName ?? user.DisplayName;
            user.Age = model.Age ?? user.Age;
            user.PhoneNumber = model.PhoneNumber ?? user.PhoneNumber;

            user.UpdatedAt = DateTimeHelper.UtcNow();

            //user.Email = model.Email ?? user.Email;
            if (!string.IsNullOrWhiteSpace(model.Email) && user.Email != model.Email)
            {
                await ValidateEmailIfExists(model.Email);
                user.Email = model.Email;
            }

            if (model.RoleId.HasValue)
            {
                var roleToAssign = await ValidateRole(executor, model.RoleId.Value);

                await uow.userRepository.ClearRoles([.. user.UserRoleUsers]);

                user.UserRoleUsers.Add(new UserRole
                {
                    RoleId = roleToAssign.Id,
                    AssignedBy = executor.Id
                });
            }

            var update = await uow.userRepository.Update(user);
            await uow.SaveChangesAsync();
            return ResponseHelper.Create(Map(update));
        }

        //peticiones internas
        private async Task<User> GetUser(Guid userId)
        {
            return await uow.userRepository.Get(userId)
                ?? throw new NotFoundException(ResponseConstants.USER_NOT_EXIST); // Asegúrate de tener esta constante
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
        private static UserDto Map(User user)
        {
            var role = user.UserRoleUsers.FirstOrDefault()?.Role;
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
                DeletedAt = user.DeletedAt,
                Role = role != null ? new RoleDto
                {
                    Id = role.Id,
                    Name = role.Name,
                    Description = role.Description
                } : null
            };
        }


        public async Task CreateFristUser()
        {
            var hasCreated = await uow.userRepository.HasCreated();
            if (hasCreated) return;

            var userName = configuration[ConfigurationConstants.FIRST_APP_TIME_USER_USERNAME]
                ?? throw new Exception(ResponseConstants.ConfigurationPropertyNotFound(ConfigurationConstants.FIRST_APP_TIME_USER_USERNAME));

            var position = configuration[ConfigurationConstants.FIRST_APP_TIME_USER_POSITION]
                ?? throw new Exception(ResponseConstants.ConfigurationPropertyNotFound(ConfigurationConstants.FIRST_APP_TIME_USER_POSITION));

            var displayName = configuration[ConfigurationConstants.FIRST_APP_TIME_USER_DISPLAYNAME]
                ?? throw new Exception(ResponseConstants.ConfigurationPropertyNotFound(ConfigurationConstants.FIRST_APP_TIME_USER_POSITION));


            var email = configuration[ConfigurationConstants.FIRST_APP_TIME_USER_EMAIL]
                ?? throw new Exception(ResponseConstants.ConfigurationPropertyNotFound(ConfigurationConstants.FIRST_APP_TIME_USER_EMAIL));

            var password = configuration[ConfigurationConstants.FIRST_APP_TIME_USER_PASSWORD]
                ?? throw new Exception(ResponseConstants.ConfigurationPropertyNotFound(ConfigurationConstants.FIRST_APP_TIME_USER_PASSWORD));

            //var user = new User
            //{
            //    UserName = userName,
            //    Email = email,
            //    Position = position,
            //    Password = Hasher.HashPassword(password),
            //};

            //var adminRole = await uow.userRepository.GetRole(RoleConstants.Admin)
            var adminRole = await uow.roleRepository.Get(x => x.Name == RoleConstants.Admin)
                ?? throw new Exception(ResponseConstants.RoleNotFound(RoleConstants.Admin));

            await uow.userRepository.Create(new User
            {
                UserName = userName,
                DisplayName = displayName,
                Email = email,
                Position = position,
                Password = Hasher.HashPassword(password),
                UserRoleUsers = [
                    new UserRole
                    {
                        RoleId = adminRole.Id,
                    }
                ]
            });
            await uow.SaveChangesAsync();
        }

        private async Task<User> GetExecutor(string value)
        {
            var uuid = Guid.Parse(value);
            return await uow.userRepository.Get(uuid)
                ?? throw new NotFoundException(ResponseConstants.USER_NOT_EXIST);
        }

        private async Task ValidateEmailIfExists(string email)
        {
            if (await uow.userRepository.IfExists(x => x.Email == email))
            {
                throw new BadRequestException(ResponseConstants.USER_EMAIL_TAKED);
            }
        }

        private async Task<Role> ValidateRole(User executor, Guid roleId)
        {
            var roleToAssign = await uow.roleRepository.Get(roleId)
                ?? throw new NotFoundException(ResponseConstants.RoleNotFound(roleId));

            if (executor.UserRoleUsers.First().Role.Name == RoleConstants.HR && roleToAssign.Name == RoleConstants.Admin)
            {
                throw new BadRequestException(ResponseConstants.CANNOT_ASSIGN_THE_ROLE);
            }

            return roleToAssign;
        }
    }
}
