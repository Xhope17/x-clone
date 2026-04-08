using System.ComponentModel;
using System.ComponentModel.DataAnnotations;
using XClone.Shared.Constants;

namespace XClone.Application.Models.Requets.Auth
{
    public class LoginAuthRequest
    {
        [Required(ErrorMessage = ValidationConstants.REQUIRED)]
        [EmailAddress(ErrorMessage = ValidationConstants.EMAIL_ADDRESS)]
        [Description("Correo del usuario")]
        public string Email { get; set; } = null!;

        [Required(ErrorMessage = ValidationConstants.REQUIRED)]
        [MaxLength(255, ErrorMessage = ValidationConstants.MAX_LENGTH)]
        [MinLength(3, ErrorMessage = ValidationConstants.MIN_LENGTH)]
        [Description("Contraseña del usuario")]
        public string Password { get; set; } = null!;

    }
}
