namespace XClone.Application.Models.DTOs
{
    public class AppInfoDto
    {
        public string Version { get; set; } = null!;
        public List<RoleDto> Roles { get; set; } = [];
    }
}
