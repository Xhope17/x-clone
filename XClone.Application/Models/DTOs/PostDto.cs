namespace XClone.Application.Models.DTOs
{
    public class PostDto
    {
        public Guid PostId { get; set; }
        public Guid AutorId { get; set; }
        public Guid? Comnunity { get; set; }
        public string Texto { get; set; } = null!;
        public DateTime JoinedAt { get; set; }
        public bool IsActive { get; set; }
        public DateTime CreatedAt { get; set; }
    }
}
