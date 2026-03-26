namespace XClone.Application.Models.Requets.User
{
    public class GetAllUserRequest
    {
        public int? Limit { get; set; }

        public int? Offset { get; set; }

        public string? GitlabProfile { get; set; }
    }
}
