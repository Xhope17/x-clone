using Microsoft.AspNetCore.Mvc;
using XClone.Application.Helpers;
using XClone.Application.Interfaces.Services;
using XClone.Application.Models.Requets.Post;
using XClone.Shared.Constants;

namespace XClone.WebApi.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class PostsController(IPostService postService) : ControllerBase
    {

        //Crear
        [HttpPost]
        public async Task<IActionResult> Create([FromBody] CreatePostRequest model)
        {
            var rsp = postService.Create(model);

            return Ok(rsp);
        }

        //obtener todos los post
        [HttpGet]
        public async Task<IActionResult> GetAll([FromQuery] FilterPostRequest model)
        {
            var rsp = postService.Get(model);

            return Ok(rsp);
        }

        //obtener un post por id
        [HttpGet("{id:guid}")]
        public async Task<IActionResult> GetById(Guid id)
        {
            var rsp = postService.Get(id);
            //valida si el post existe
            if (rsp is null)
            {
                return NotFound(ResponseHelper.Create<string>(null, ValidationConstants.POST_NOT_FOUND));
            }
            return Ok(ResponseHelper.Create(rsp));
        }

        //Actualizar falta
        [HttpPut("{id:guid}")]
        public async Task<IActionResult> Update(Guid id, [FromBody] UpdatePostRequest model)
        {
            var rsp = postService.Update(id, model);

            return Ok(ResponseHelper.Create(rsp, "Post actualizado"));
        }


        [HttpDelete("{id:guid}")]
        public async Task<IActionResult> Delete(Guid id)
        {
            var rsp = postService.Delete(id);
            if (rsp is null)
            {
                return NotFound(ResponseHelper.Create<string>(null, ValidationConstants.POST_NOT_FOUND));
            }

            return Ok("usuario eliminado");
        }
    }
}
