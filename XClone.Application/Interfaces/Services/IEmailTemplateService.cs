using XClone.Application.Models.DTOs;

namespace XClone.Application.Interfaces.Services
{
    public interface IEmailTemplateService
    {
        Task<EmailTemplateDto> Get(string name, Dictionary<string, string> variables);
        Task Init();
    }
}
