using Microsoft.AspNetCore.Mvc;
using XClone.Application.Interfaces.Services;
using XClone.Application.Models.Requets.Auth;
using XClone.Application.Models.Responses;

namespace XClone.WebApi.Controllers
{
    [Route("api/[controller]")]

    [ApiController]
    public class AuthController(IAuthService authService) : ControllerBase
    {
        [HttpPost("login")]
        [EndpointSummary("Iniciar sesión como usuario")]
        [EndpointDescription("Esto permite iniciar sesión en el aplicativo. Genera dos tokens, uno que es el JWT para la autenticación y el otro, que permite realizar la renovación")]
        [ProducesResponseType<GenericResponse<string>>(StatusCodes.Status400BadRequest)]
        //[]
        [Tags("auth", "user", "JWT")]
        public async Task<IActionResult> Login([FromBody] LoginAuthRequest model)
        {
            var rsp = await authService.Login(model);
            return Ok(rsp);
        }
    }
}
