namespace XClone.Shared.Constants
{
    public static class ResponseConstans
    {
        public const string POST_NOT_EXIST = "Post no existe";

        public const string POST_NOT_FOUND = "Post no encontrado";

        public const string USER_NOT_EXIST = "Usuario no encontrado";

        // Projects
        public const string PROJECT_NOT_EXISTS = "El proyecto no existe";

        //Token not found
        public const string AUTH_TOKEN_NOT_FOUND = "El token no es correcto, expiró o no se argumentó";

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
