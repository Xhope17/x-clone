namespace XClone.Shared.Constants
{
    public static class ResponseConstants
    {
        //Pots
        public const string POST_NOT_EXIST = "El post no existe";
        public const string POST_NOT_FOUND = "El post no se encontró";


        //Users
        public const string USER_NOT_EXIST = "El usuario no existe";
        public const string USER_EMAIL_TAKED = "Ya existe un usuario con el correo que está argumentando";


        // Projects
        public const string PROJECT_NOT_EXISTS = "El proyecto no existe";

        //Auth
        public const string AUTH_TOKEN_NOT_FOUND = "El token no es correcto, expiró o no se argumentó";
        public const string AUTH_USER_OR_PASSWORD_NOT_FOUND = "El usuario o la contraseña son incorrectos";
        public const string AUTH_REFRESH_TOKEN_NOT_FOUND = "El token para refrescar la sesión expiró, no existe o es incorrecto";

        // Roles
        public static string RoleNotFound(string name) => $"El rol {name} no existe";
        public static string RoleNotFound(Guid id) => $"El rol con ID: {id} no existe";

        public static string ErrorUnexpected(string traceId)
        {
            return $"Ha ocurrido un error inesperado: contacte con soporte, mencionando el siguiente código: {traceId}";
        }

        public static string ConfigurationPropertyNotFound(string property)
        {
            return $"La propiedad de configuración '{property}' no se encontró. Por favor, revise su configuración.";
        }
    }
}
