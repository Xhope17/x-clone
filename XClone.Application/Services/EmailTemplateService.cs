using XClone.Application.Interfaces.Services;
using XClone.Application.Models.DTOs;
using XClone.Application.Models.Services;
using XClone.Domain.Interfaces.Repositories;

namespace XClone.Application.Services
{
    public class EmailTemplateService(EmailTemplateData data, IEmailTemplateRepository repository) : IEmailTemplateService
    {
        public async Task<EmailTemplateDto> Get(string name, Dictionary<string, string> variables)
        {
            var template = data.Data.First(x => x.Name == name);

            foreach (var variable in variables)
            {
                template.Body = template.Body.Replace("{{" + variable.Key + "}}", variable.Value);
            }

            return new EmailTemplateDto
            {
                Body = template.Body,
                Subject = template.Subject,
            };
        }

        public async Task Init()
        {
            var templates = await repository.Get();
            data.Data = templates;
        }
    }
}
