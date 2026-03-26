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
        public async Task<IActionResult> Create([FromBody] CreateUserRequest model)
        {

            //return Ok($"Post subido: autor: {model.AutorId}, contenido: {model.Texto}");
            var rsp = userService.Create(model);
            return Ok(rsp);

        }


        //obtener todos los post
        [HttpGet]
        public async Task<IActionResult> GetAll([FromQuery] GetAllUserRequest model)
        {
            var rsp = userService.Get(model.Limit ?? 0, model.Offset ?? 0);


            return Ok(rsp);
        }

        //obtener un post
        [HttpGet("{id:guid}")]
        public async Task<IActionResult> GetById(Guid id)
        {
            var rsp = userService.Get(id);


            return Ok(ResponseHelper.Create(id));

        }

        //Actualizar falta
        [HttpPut("{id:guid}")]
        public async Task<IActionResult> Update([FromBody] UpdateUserRequest model)
        {
            return Ok($"usuario actualizado: {model.UserName}");
        }


        [HttpDelete("{id:guid}")]
        public async Task<IActionResult> Delete(Guid id)
        {
            var rsp = userService.Delete(id);
            return Ok("usuario eliminado");
        }
    }
}
