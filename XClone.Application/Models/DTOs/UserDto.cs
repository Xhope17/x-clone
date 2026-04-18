namespace XClone.Application.Models.DTOs
{
    public class UserDto
    {
        public Guid Id { get; set; }

        // Datos de perfil
        public string UserName { get; set; } = null!;
        public string DisplayName { get; set; } = null!;
        public string Email { get; set; } = null!;
        public int Age { get; set; }

        // El número de teléfono permite nulos en tu BD (INT NULL)
        public string? PhoneNumber { get; set; }

        public bool IsVerified { get; set; }


        // Relaciones (Opcionales, permiten nulos en tu BD)
        public Guid? PinnedPostId { get; set; }
        public Guid? TimezoneId { get; set; }
        public Guid? CityId { get; set; }

        // Datos administrativos y de estado
        public DateTime JoinedAt { get; set; }
        public bool IsActive { get; set; }

        // Mantengo el nombre exacto de tu BD (CreateAT), 
        // aunque en C# la convención suele ser CreatedAt
        public DateTime CreateAt { get; set; }
        public DateTime UpdatedAt { get; set; }
        public DateTime? DeletedAt { get; set; }

        public RoleDto Role { get; set; } = null!;
    }
}
