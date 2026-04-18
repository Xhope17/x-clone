using System.ComponentModel.DataAnnotations;
using XClone.Shared.Constants;

namespace XClone.Application.Models.Requets.User
{
    public class UpdateUserRequest
    {
        [MaxLength(250, ErrorMessage = ValidationConstants.MAX_LENGTH)]
        [MinLength(1, ErrorMessage = ValidationConstants.MIN_LENGTH)]
        public string? UserName { get; set; }

        [MaxLength(100, ErrorMessage = ValidationConstants.MAX_LENGTH)]
        public string? DisplayName { get; set; }

        [Range(18, 120, ErrorMessage = ValidationConstants.INVALID_AGE)]
        public int? Age { get; set; }

        [EmailAddress(ErrorMessage = ValidationConstants.EMAIL_ADDRESS)]
        [MaxLength(255, ErrorMessage = ValidationConstants.MAX_LENGTH)]
        [MinLength(10, ErrorMessage = ValidationConstants.MIN_LENGTH)]
        public string? Email { get; set; } = null!;

        [MaxLength(20, ErrorMessage = ValidationConstants.MAX_LENGTH)]
        public string? PhoneNumber { get; set; }

        public Guid? RoleId { get; set; }
    }
}
