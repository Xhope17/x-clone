namespace XClone.Application.Models.DTOs
{
    public class PostDto
    {
        public Guid PostId { get; set; }
        public string AutorId { get; set; }
        public string? Comunidad { get; set; }
        public string Texto { get; set; } = null!;
        public DateTime JoinedAt { get; set; }
        public bool IsActive { get; set; }
        public DateTime CreatedAt { get; set; }
    }
}
