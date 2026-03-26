namespace XClone.Application.Models.Requets.Post
{
    public class GetAllPostRequest
    {
        public int? Limit { get; set; }

        public int? Offset { get; set; }

        public string? GitlabProfile { get; set; }
    }
}
