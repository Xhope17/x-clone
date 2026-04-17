namespace XClone.Shared.Constants
{
    public class ValidationConstants
    {
        public const string MAX_LENGTH = "El máximo de caracteres es de {0}";
        public const string MIN_LENGTH = "El mínimo de caracteres es de {0}";
        public const string REQUIRED = "El campo {0} es requerido";

        public const string EMAIL_ADDRESS = "La dirección de correo electrónico, no es correcta {0}";

        public const string VALIDATION_MESSAGE = "Una o más validaciones necesitan atención";

        public static string IsEmpty(string property) => $"El valor de la propiedad '{property}' es vacio. En casos de UUID, no está admitido '00000000-0000-0000-0000-000000000000'";


        //ADICIONAL
        public const string USER_NOT_FOUND = "Usuario no encontrado";
        public const string POST_NOT_FOUND = "Post no encontrado";
        public const string COMMENT_NOT_FOUND = "Comentario no encontrado";
        public const string INVALID_AGE = "El usuario debe ser mayor de edad";

        public const string INVALID_NUMBER = "El valor debe ser un número válido";
        public const string DUPLICATE = "El recurso ya existe";

        public const string AUTHOR_ID_REQUIRED = "El campo AuthorId es requerido";


    }
}
