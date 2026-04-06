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
                var response = ResponseHelper.Create(exception.Message);
                context.Response.StatusCode = StatusCodes.Status404NotFound;
                await context.Response.WriteAsJsonAsync(response);
            }
            catch (BadHttpRequestException exception)
            {
                var response = ResponseHelper.Create(exception.Message);
                context.Response.StatusCode = StatusCodes.Status400BadRequest;
                await context.Response.WriteAsJsonAsync(response);
            }
            catch (Exception exception)
            {
                //var response = ResponseHelper.Create(exception.Message);

                //context.Response.StatusCode = StatusCodes.Status500InternalServerError;
                var traceId = Guid.NewGuid();
                var message = ResponseConstans.ERROR_UNEXPECTED(traceId.ToString());

                logger.LogCritical("Se generó una excepcion no controlada: {traceId}. Excepción: {exception}", traceId, exception);
                await context.Response.WriteAsJsonAsync(ManageException(context, exception, StatusCodes.Status500InternalServerError));
            }
        }

        public GenericResponse<string> ManageException(HttpContext context, Exception exception, int statusCode)
        {
            var response = ResponseHelper.Create(
                data: exception.Message,
                message: exception.Message,
                errors: [exception.Message]
                );
            context.Response.StatusCode = statusCode;

            return response;
        }
    }
}
