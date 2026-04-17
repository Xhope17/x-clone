namespace XClone.Application.Models.Requets.User
{
    public class FilterUserRequest : BaseRequest
    {
        public string? UserId { get; set; }
        public string? UserName { get; set; }
        public string? DisplayName { get; set; }

        public string? Position { get; set; }
    }
}
