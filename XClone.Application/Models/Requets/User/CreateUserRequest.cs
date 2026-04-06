using System.ComponentModel.DataAnnotations;
using XClone.Shared.Constants;

namespace XClone.Application.Models.Requets.User
{
    public class CreateUserRequest
    {
        [Required(ErrorMessage = ValidationConstants.REQUIRED)]
        [MaxLength(100, ErrorMessage = ValidationConstants.MAX_LENGTH)]
        [MinLength(6, ErrorMessage = ValidationConstants.MIN_LENGTH)]
        public string UserName { get; set; } = null!;

        [Required(ErrorMessage = ValidationConstants.REQUIRED)]
        [MaxLength(100, ErrorMessage = ValidationConstants.MAX_LENGTH)]
        public string DisplayName { get; set; } = null!;

        [Required(ErrorMessage = ValidationConstants.REQUIRED)]
        [Range(18, 120, ErrorMessage = ValidationConstants.INVALID_AGE)]
        public int Edad { get; set; }

        [Required(ErrorMessage = ValidationConstants.REQUIRED)]
        [MaxLength(250, ErrorMessage = ValidationConstants.MAX_LENGTH)]
        [EmailAddress]
        public string Email { get; set; } = null!;

        [Required(ErrorMessage = ValidationConstants.REQUIRED)]
        [MaxLength(255, ErrorMessage = ValidationConstants.MAX_LENGTH)]
        [MinLength(6, ErrorMessage = ValidationConstants.MIN_LENGTH)]
        public string Password { get; set; } = null!;

        [MaxLength(20, ErrorMessage = ValidationConstants.MAX_LENGTH)]
        public string? PhoneNumber { get; set; }
    }
}
