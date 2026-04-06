
using XClone.Application.Models.Responses;

namespace XClone.Application.Helpers
{
    public static class ResponseHelper
    {

        public static GenericResponse<T> Create<T>(T data, List<string>? errors = null, string? message = null)
        {
            var response = new GenericResponse<T>
            {
                Data = data,
                Message = message ?? "Solicitud realizada correctamente",
                Erros = errors,


            };

            return response;
        }
    }
}
