using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using XClone.Application.Helpers;
using XClone.Application.Interfaces.Services;
using XClone.Application.Models.Requets.User;

namespace XClone.WebApi.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class UsersController(IUserService userService) : ControllerBase
    {
        //Crear
        [HttpPost]
        [Authorize(Roles = "Administrador")]
        public async Task<IActionResult> Create([FromBody] CreateUserRequest model)
        {
            var rsp = await userService.Create(model);
            return Ok(rsp);

        }

        //obtener todos los post
        [HttpGet]
        public async Task<IActionResult> GetAll([FromQuery] FilterUserRequest model)
        {
            var userId = User.FindFirst("id")?.Value;
            var rsp = userService.Get(model);


            return Ok(rsp);
        }

        //obtener un post
        [HttpGet("{id:guid}")]
        public async Task<IActionResult> GetById(Guid id)
        {
            var rsp = await userService.Get(id);

            return Ok(ResponseHelper.Create(rsp));
        }

        //Actualizar
        [HttpPut("{id:guid}")]
        public async Task<IActionResult> Update([FromBody] UpdateUserRequest model, Guid id)
        {
            var rsp = userService.Update(id, model);

            return Ok(ResponseHelper.Create(rsp, null, "Usuario actualizado"));
        }

        //eliminar un usuario
        [HttpDelete("{id:guid}")]
        public async Task<IActionResult> Delete(Guid id)
        {
            var rsp = await userService.Delete(id);
            return Ok(ResponseHelper.Create(rsp, null, "usuario eliminado"));
        }
    }
}
