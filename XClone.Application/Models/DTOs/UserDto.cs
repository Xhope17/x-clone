namespace XClone.Application.Models.DTOs
{
    public class UserDto
    {
        public Guid UserId { get; set; }
        public string UserName { get; set; } = null!;

        public string Edad { get; set; } = null!;

        public string Email { get; set; } = null!;

        public string PhoneNumber { get; set; }
        public DateTime JoinedAt { get; set; }
        public bool IsActive { get; set; }
        public DateTime CreatedAt { get; set; }
    }
}
