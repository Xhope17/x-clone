using Microsoft.AspNetCore.Mvc;
using XClone.Application.Interfaces.Services;
using XClone.Application.Models.DTOs;
using XClone.Application.Models.Responses;

namespace XClone.WebApi.Controllers
{
    [Route("api/[controller]")]
    public class AppController(IAppService appService) : ControllerBase
    {
        [HttpGet("info")]
        [EndpointSummary("Información de la aplicación")]
        [EndpointDescription("Los roles, permisos, versión y mas detalles de la aplicación")]
        [ProducesResponseType<GenericResponse<AppInfoDto>>(StatusCodes.Status200OK)]
        public async Task<IActionResult> Info()
        {
            var srv = await appService.Info();
            return Ok(srv);
        }
    }
}
