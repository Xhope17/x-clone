using XClone.Application.Interfaces.Services;
using XClone.Application.Services;
using XClone.Domain.Interfaces.Repositories;
using XClone.Infrastructure.Persistence.SqlServer.Repositories;

namespace XClone.WebApi.Extensions
{
    public static class ServiceCollectionExtension
    {
        /// <summary>
        /// Metodo que sirve para añadir todos los servicios de la aplicacion, 
        /// como el servicio de post, el servicio de usuario, etc. 
        /// Este metodo se llama en el Program.cs para registrar los servicios en el contenedor de dependencias.
        /// </summary>
        /// <param name="services"></param>
        public static void AddServices(this IServiceCollection services)
        {
            services.AddScoped<IPostService, PostService>();


        }

        /// <summary>
        /// metodo que sirve para añadir
        ///
        /// </summary>
        /// <param name="services"></param>
        public static void AddRepositories(this IServiceCollection services)
        {
            services.AddTransient<IPostRepository, PostRepository>();
        }

        public static void AddCore(this IServiceCollection services)
        {
            services.AddControllers();
            services.AddOpenApi();
            //services.AddSqlServer<XcloneContext>(configuration.GetConnectionString("Database"));

            AddServices(services);
            AddRepositories(services);


        }

        public static void AddMiddlleWares(this WebApplication services)
        {

        }
    }
}
