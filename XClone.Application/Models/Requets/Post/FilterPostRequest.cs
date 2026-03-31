namespace XClone.Application.Models.Requets.Post
{
    public class FilterPostRequest : BaseRequest
    {
        //public int? Limit { get; set; }

        //public int? Offset { get; set; }

        public string? Author { get; set; }
        public string? Texto { get; set; }



        public string? GitlabProfile { get; set; }
    }
}
