using XClone.Shared.Helpers;

namespace XClone.Application.Models.Responses
{
    public class GenericResponse<T>
    {

        public string Message { get; set; }

        public List<string> Erros { get; set; } = [];

        public DateTime TimeStamp { get; set; } = DateTimeHelper.UtcNow();

        public int Count { get; set; } = 0;
        public T Data { get; set; }


    }
}
