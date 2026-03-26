using System.ComponentModel.DataAnnotations;
using XClone.Shared.Constants;

namespace XClone.Application.Models.Requets.User
{
    public class UpdateUserRequest
    {
        [Required(ErrorMessage = ValidationConstants.REQUIRED)]
        [MaxLength(250, ErrorMessage = ValidationConstants.MAX_LENGTH)]
        [MinLength(1, ErrorMessage = ValidationConstants.MIN_LENGTH)]
        public required string UserName { get; set; } = null!;

        [Required(ErrorMessage = ValidationConstants.REQUIRED)]
        [MaxLength(3, ErrorMessage = ValidationConstants.MAX_LENGTH)]
        [MinLength(1, ErrorMessage = ValidationConstants.MIN_LENGTH)]
        public string Edad { get; set; } = null!;

        [Required(ErrorMessage = ValidationConstants.REQUIRED)]
        [MaxLength(250, ErrorMessage = ValidationConstants.MAX_LENGTH)]
        [MinLength(1, ErrorMessage = ValidationConstants.MIN_LENGTH)]
        public string Email { get; set; } = null!;

        //[Required(ErrorMessage = ValidationConstants.REQUIRED)]
        [MaxLength(15, ErrorMessage = ValidationConstants.MAX_LENGTH)]
        [MinLength(0, ErrorMessage = ValidationConstants.MIN_LENGTH)]
        public string PhoneNumber { get; set; }
    }
}
