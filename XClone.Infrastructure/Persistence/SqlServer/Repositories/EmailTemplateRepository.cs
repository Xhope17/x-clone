using Microsoft.EntityFrameworkCore;
using XClone.Domain.Database.SqlServer.Context;
using XClone.Domain.Database.SqlServer.Entities;
using XClone.Domain.Interfaces.Repositories;

namespace XClone.Infrastructure.Persistence.SqlServer.Repositories
{
    public class EmailTemplateRepository(XcloneContext xcloneContext) : IEmailTemplateRepository
    {
        public async Task<List<EmailTemplate>> Get()
        {
            return await xcloneContext.EmailTemplates.ToListAsync();
        }
    }
}
