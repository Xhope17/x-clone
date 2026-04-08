namespace XClone.Application.Models.Helpers
{
    public class CacheKey
    {
        public required string Key { get; set; }
        public required TimeSpan Expiration { get; set; }
    }
}
