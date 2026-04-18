namespace XClone.WebApi.Attributes
{
    [AttributeUsage(AttributeTargets.Class)]
    public class DeveloperAuthor : Attribute
    {
        public required string Name { get; set; }
        public string? Description { get; set; }
    }
}
