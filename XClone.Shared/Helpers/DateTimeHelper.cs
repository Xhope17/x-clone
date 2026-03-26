namespace XClone.Shared.Helpers
{
    public class DateTimeHelper
    {


        public static DateTime UtcNow()
        {
            return DateTimeOffset.UtcNow.DateTime;
        }
    }
}
