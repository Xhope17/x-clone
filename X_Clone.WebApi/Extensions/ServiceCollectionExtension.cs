using Microsoft.AspNetCore.Mvc;
using Serilog;
using Serilog.Sinks.MSSqlServer;
using XClone.Application.Helpers;
using XClone.Application.Interfaces.Services;
using XClone.Application.Services;
using XClone.Domain.Database.SqlServer.Context;
using XClone.Domain.Interfaces.Repositories;
using XClone.Infrastructure.Persistence.SqlServer.Repositories;
using XClone.Shared.Constants;
using XClone.WebApi.Middlewares;

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
            services.AddScoped<IUserService, UserService>();



        }

        /// <summary>
        /// Método que sirve para añadir todos los repositorios de la aplicación
        ///
        /// </summary>
        /// <param name="services"></param>
        public static void AddRepositories(this IServiceCollection services)
        {
            services.AddTransient<IPostRepository, PostRepository>();
            services.AddTransient<IUserRepository, UserRepository>();

        }

        /// <summary>
		/// Método que añade lo esencial que necesita nuestra aplicación para funcionar
		/// </summary>
		/// <param name="services"></param>
        public static void AddCore(this IServiceCollection services, IConfiguration configuration)
        {
            //ConfigureApiBehaviorOptions sirve para configurar el comportamiento de la API, como por ejemplo, el formato de los errores, etc.
            services.AddControllers().ConfigureApiBehaviorOptions(options =>
            {
                options.InvalidModelStateResponseFactory = (errorContext) =>
                {
                    //var response = ResponseHelper.Create(string.Join(", ", errorContext.ModelState.Values.SelectMany(x => x.Errors.Select(x => x.ErrorMessage))));
                    var errors = errorContext.ModelState.Values.SelectMany(value => value.Errors.Select(error => error.ErrorMessage).ToList()).ToList();
                    var response = ResponseHelper.Create(
                        data: ValidationConstants.VALIDATION_MESSAGE, errors);
                    //falta


                    return new BadRequestObjectResult(response);
                };
            });
            services.AddOpenApi();

            services.AddSqlServer<XcloneContext>(configuration.GetConnectionString("Database")); AddRepositories(services);

            services.AddRepositories();

            services.AddServices();

            services.AddMiddlleWares();

            services.AddLogging();

        }

        /// <summary>
		/// Método que añade los middlewares de la aplicación
		/// </summary>
		/// <param name="services"></param>
        public static void AddMiddlleWares(this IServiceCollection services)
        {
            services.AddScoped<ErrorHandlerMiddleware>();
        }

        public static void AddLogging(this IServiceCollection services)
        {
            // Aquí puedes configurar el logging, por ejemplo, usando Serilog, NLog, etc.
            // services.AddLogging(loggingBuilder => loggingBuilder.AddSerilog());

            services.AddSerilog();

            Log.Logger = new LoggerConfiguration()
                //.MinimumLevel.Debug()
                //.WriteTo.Console()
                //"/logs/log.txt"
                .WriteTo.File(Path.Combine(Directory.GetCurrentDirectory(), "logs", "log.txt"), rollingInterval: RollingInterval.Day)

                .WriteTo.Console()
                .WriteTo
                .MSSqlServer(
                //"DataBase=XClone;TrustServerCertificate=True"
                connectionString: "Server=localhost,1433;User=sa,Password=Admin1234@;Database=XClone;TrustServerCertificate=True;",
                sinkOptions: new MSSqlServerSinkOptions { TableName = "LogEvents" })
                .CreateLogger();
        }
    }
}