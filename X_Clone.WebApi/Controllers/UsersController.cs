using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;
using XClone.Application.Helpers;
using XClone.Application.Interfaces.Services;
using XClone.Application.Models.Requets.User;
using XClone.Domain.Exceptions;
using XClone.Shared.Constants;
using XClone.WebApi.Attributes;

namespace XClone.WebApi.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [DeveloperAuthor(Name = "Bryan M.", Description = "Esto lo cree para la información de la APP")]
    public class UsersController(IUserService userService) : ControllerBase
    {
        //Crear
        [HttpPost]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> Create([FromBody] CreateUserRequest model)
        {
            var rsp = await userService.Create(model, UserClaim());
            return Ok(ResponseHelper.Create(rsp));

        }

        //obtener todos los post
        [HttpGet]
        [Authorize]
        //[Authorize(Roles = "Administrator")]
        public async Task<IActionResult> GetAll([FromQuery] FilterUserRequest model, [FromHeader] string authorization)
        {
            //var userId = User.FindFirst("id")?.Value;
            var rsp = userService.Get(model);


            return Ok(ResponseHelper.Create(rsp));
        }

        //obtener un post
        [HttpGet("{id:guid}")]
        [Authorize]
        public async Task<IActionResult> GetById(Guid id)
        {
            var rsp = await userService.Get(id);

            return Ok(ResponseHelper.Create(rsp));
        }

        //Actualizar
        [HttpPut("{id:guid}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> Update([FromBody] UpdateUserRequest model, Guid id)
        {
            var rsp = userService.Update(id, model, UserClaim());

            return Ok(ResponseHelper.Create(rsp, null, null, "Usuario actualizado"));
        }

        //eliminar un usuario
        [HttpDelete("{id:guid}")]
        public async Task<IActionResult> Delete(Guid id)
        {
            var rsp = await userService.Delete(id);
            return Ok(ResponseHelper.Create(rsp, null, null, "usuario eliminado"));
        }


        private Claim UserClaim()
        {
            return User.FindFirst(ClaimsConstants.USER_ID)
                ?? throw new BadRequestException(ResponseConstants.AUTH_CLAIM_USER_NOT_FOUND);
        }


    }
}
