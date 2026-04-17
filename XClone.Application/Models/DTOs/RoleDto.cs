namespace XClone.Application.Models.DTOs
{
    public class RoleDto
    {
        public Guid Id { get; set; }

        public string Name { get; set; } = null!;

        public string? Description { get; set; }
    }
}
