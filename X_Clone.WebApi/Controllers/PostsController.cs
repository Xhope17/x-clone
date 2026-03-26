using Microsoft.AspNetCore.Mvc;
using XClone.Application.Helpers;
using XClone.Application.Interfaces.Services;
using XClone.Application.Models.Requets.Post;

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

            //return Ok($"Post subido: autor: {model.AutorId}, contenido: {model.Texto}");
            var rsp = postService.Create(model);
            return Ok(rsp);

        }

        //obtener todos los post
        [HttpGet]
        public async Task<IActionResult> GetAll([FromQuery] GetAllPostRequest model)
        {
            //return Ok($"Todos los usuarios: limit: {model.Limit}, outset: {model.Offset}, gitlabprofile: {model.GitlabProfile}");
            var rsp = postService.Get(model.Limit ?? 0, model.Offset ?? 0);


            return Ok(rsp);
        }

        //obtener un post
        [HttpGet("{id:guid}")]
        public async Task<IActionResult> GetById(Guid id)
        {
            //return Ok($"{id}");
            var rsp = postService.Get(id);


            return Ok(ResponseHelper.Create(id));

        }

        //Actualizar falta
        [HttpPut("{id:guid}")]
        public async Task<IActionResult> Update([FromBody] UpdatePostRequest model)
        {
            return Ok($"usuario actualizado: Contenido: {model.Texto}");
        }


        [HttpDelete("{id:guid}")]
        public async Task<IActionResult> Delete(Guid postId)
        {
            var rsp = postService.Delete(postId);

            return Ok("usuario eliminado");
        }
    }
}
