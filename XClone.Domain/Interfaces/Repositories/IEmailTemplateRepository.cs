using XClone.Domain.Database.SqlServer.Entities;

namespace XClone.Domain.Interfaces.Repositories
{
    public interface IEmailTemplateRepository
    {
        Task<List<EmailTemplate>> Get();
    }
}
