namespace XClone.Application.Models.Responses
{
    public class GenericResponse<T>
    {

        public string Message { get; set; }

        public DateTime TimeStamp { get; set; } = DateTimeOffset.UtcNow.DateTime;

        public T Data { get; set; }


    }
}
