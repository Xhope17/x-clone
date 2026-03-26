using System.ComponentModel.DataAnnotations;
using XClone.Shared.Constants;

namespace XClone.Application.Models.Requets.Post
{
    public class CreatePostRequest
    {
        [Required(ErrorMessage = ValidationConstants.REQUIRED)]
        [MaxLength(250, ErrorMessage = ValidationConstants.MAX_LENGTH)]
        [MinLength(1, ErrorMessage = ValidationConstants.MIN_LENGTH)]

        public string AutorId { get; set; } = null!;

        [MaxLength(255, ErrorMessage = ValidationConstants.MAX_LENGTH)]
        //[MinLength(10, ErrorMessage = ValidationConstants.MIN_LENGTH)]
        public string? Comunidad { get; set; }

        [Required(ErrorMessage = ValidationConstants.REQUIRED)]
        [MaxLength(250, ErrorMessage = ValidationConstants.MAX_LENGTH)]
        [MinLength(1, ErrorMessage = ValidationConstants.MIN_LENGTH)]
        public required string Texto { get; set; } = null!;
    }
}
