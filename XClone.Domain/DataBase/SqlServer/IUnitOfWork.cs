using XClone.Domain.Interfaces.Repositories;

namespace XClone.Domain.DataBase.SqlServer
{
    public interface IUnitOfWork
    {
        IUserRepository userRepository { get; set; }
        IEmailTemplateRepository emailTemplateRepository { get; set; }
        IRoleRepository roleRepository { get; set; }
        Task SaveChangesAsync();
    }
}
