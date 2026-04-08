using XClone.Application.Helpers;
using XClone.Application.Models.Responses;
using XClone.Domain.Exceptions;
using XClone.Shared.Constants;

namespace XClone.WebApi.Middlewares
{
    public class ErrorHandlerMiddleware(ILogger<ErrorHandlerMiddleware> logger) : IMiddleware
    {
        public async Task InvokeAsync(HttpContext context, RequestDelegate next)
        {
            try
            {
                await next(context);


            }
            catch (NotFoundException exception)
            {
                /*var response = ResponseHelper.Create(exception.Message);
                context.Response.StatusCode = StatusCodes.Status404NotFound;
                */
                await context.Response.WriteAsJsonAsync(ManageException(context, exception, StatusCodes.Status404NotFound));
            }
            catch (BadHttpRequestException exception)
            {
                await context.Response.WriteAsJsonAsync(ManageException(context, exception, StatusCodes.Status400BadRequest));
            }
            catch (UnauthorizedException exception)
            {
                await context.Response.WriteAsJsonAsync(ManageException(context, exception, StatusCodes.Status401Unauthorized));
            }
            catch (Exception exception)
            {
                //var response = ResponseHelper.Create(exception.Message);

                //context.Response.StatusCode = StatusCodes.Status500InternalServerError;
                var traceId = Guid.NewGuid();
                var message = ResponseConstans.ErrorUnexpected(traceId.ToString());

                logger.LogCritical("Se generó una excepcion no controlada: con el traceId: {traceId}. Excepción: {exception}", traceId, exception);
                await context.Response.WriteAsJsonAsync(ManageException(context, exception, StatusCodes.Status500InternalServerError, message));
            }
        }

        public GenericResponse<string> ManageException(HttpContext context, Exception exception, int statusCode, string? message = null)
        {
            var response = ResponseHelper.Create(
                data: message ?? exception.Message,
                message: message ?? exception.Message,
                errors: [message ?? exception.Message]
                );

            context.Response.StatusCode = statusCode;
            return response;
        }
    }
}
