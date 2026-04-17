using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Mvc;
using Microsoft.IdentityModel.Tokens;
using Serilog;
using Serilog.Sinks.MSSqlServer;
using XClone.Application.Helpers;
using XClone.Application.Interfaces.Services;
using XClone.Application.Models.Services;
using XClone.Application.Services;
using XClone.Domain.Database.SqlServer.Context;
using XClone.Domain.DataBase.SqlServer;
using XClone.Domain.Exceptions;
using XClone.Domain.Interfaces.Repositories;
using XClone.Infrastructure.Persistence.SqlServer;
using XClone.Infrastructure.Persistence.SqlServer.Repositories;
using XClone.Shared;
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
            services.AddScoped<IAuthService, AuthService>();
            services.AddScoped<ICacheService, CacheService>();
            services.AddScoped<IEmailTemplateService, EmailTemplateService>();
            services.AddScoped<IAppService, AppService>();

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
            services.AddScoped<IUnitOfWork, UnitOfWork>();
            services.AddScoped<IEmailTemplateRepository, EmailTemplateRepository>();
        }

        public async static Task AddSMTP(this IServiceCollection services, IConfiguration configuration)
        {
            var host = configuration[ConfigurationConstants.SMTP_HOST]
                ?? throw new Exception(ResponseConstants.ConfigurationPropertyNotFound(ConfigurationConstants.SMTP_HOST));

            var from = configuration[ConfigurationConstants.SMTP_FROM]
                ?? throw new Exception(ResponseConstants.ConfigurationPropertyNotFound(ConfigurationConstants.SMTP_FROM));

            var port = Convert.ToInt32(configuration[ConfigurationConstants.SMTP_PORT] ?? "587");

            var user = configuration[ConfigurationConstants.SMTP_USER]
                ?? throw new Exception(ResponseConstants.ConfigurationPropertyNotFound(ConfigurationConstants.SMTP_USER));

            var password = configuration[ConfigurationConstants.SMTP_PASSWORD]
                ?? throw new Exception(ResponseConstants.ConfigurationPropertyNotFound(ConfigurationConstants.SMTP_PASSWORD));

            var smtp = new SMTP(host, from, port, user, password);
            services.AddSingleton(smtp);
        }

        /// <summary>
		/// Método que añade lo esencial que necesita nuestra aplicación para funcionar
		/// </summary>
		/// <param name="services"></param>
        public async static Task AddCore(this IServiceCollection services, IConfiguration configuration)
        {
            await services.AddSMTP(configuration);
            //ConfigureApiBehaviorOptions sirve para configurar el comportamiento de la API, como por ejemplo, el formato de los errores, etc.
            services.AddControllers().ConfigureApiBehaviorOptions(options =>
            {
                options.InvalidModelStateResponseFactory = (errorContext) =>
                {
                    var errors = errorContext.ModelState.Values.SelectMany(value => value.Errors.Select(error => error.ErrorMessage).ToList()).ToList();
                    var response = ResponseHelper.Create(

                        data: ValidationConstants.VALIDATION_MESSAGE,
                        errors: errors,
                        message: ValidationConstants.VALIDATION_MESSAGE
                        );
                    return new BadRequestObjectResult(response);
                };
            });

            services.AddOpenApi();

            //services.AddSqlServer<XcloneContext>(configuration.GetConnectionString("Database"));
            var databaseConnetingString = Environment.GetEnvironmentVariable(ConfigurationConstants.CONNECTION_STRING_DATABASE)
                ?? configuration[ConfigurationConstants.CONNECTION_STRING_DATABASE];

            services.AddSqlServer<XcloneContext>(databaseConnetingString);

            services.AddServices();

            services.AddRepositories();

            services.AddMiddlleWares();

            services.AddLogging();

            services.AddAuth(configuration);

            services.AddCache();

            await Initialize(services);

        }


        /// <summary>
		/// Método que añade los middlewares de la aplicación
		/// </summary>
		/// <param name="services"></param>
        public static void AddMiddlleWares(this IServiceCollection services)
        {
            services.AddScoped<ErrorHandlerMiddleware>();
        }

        /// <summary>
        /// Método para añadir todo lo relacionado con log
        /// </summary>
        /// <param name="services"></param>
        public static void AddLogging(this IServiceCollection services)
        {
            // Aquí puedes configurar el logging, por ejemplo, usando Serilog, NLog, etc.
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



        public async static Task Initialize(this IServiceCollection services)
        {
            var templatesData = new EmailTemplateData();
            services.AddSingleton(templatesData);

            var provider = services.BuildServiceProvider();
            var scope = provider.CreateAsyncScope();

            var userService = scope.ServiceProvider.GetRequiredService<IUserService>();
            await userService.CreateFristUser();

            var emailTemplateService = scope.ServiceProvider.GetRequiredService<IEmailTemplateService>();
            await emailTemplateService.Init();
        }


        public static void AddAuth(this IServiceCollection services, IConfiguration configuration)
        {
            services.AddAuthentication(builder =>
            {
                builder.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
                builder.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;


            }).AddJwtBearer(builder =>
            {
                //var issuer = Environment.GetEnvironmentVariable(ConfigurationConstants.JWT_ISSUER) //produccion y desarrollo
                //    ?? configuration[ConfigurationConstants.JWT_ISSUER]
                //    ?? throw new Exception(ResponseConstants.ConfigurationPropertyNotFound(ConfigurationConstants.JWT_ISSUER));

                //var audience = Environment.GetEnvironmentVariable(ConfigurationConstants.JWT_AUDIENCE) //produccion y desarrollo
                //    ?? configuration[ConfigurationConstants.JWT_AUDIENCE]
                //    ?? throw new Exception(ResponseConstants.ConfigurationPropertyNotFound(ConfigurationConstants.JWT_AUDIENCE));

                //var privateKey = Environment.GetEnvironmentVariable(ConfigurationConstants.JWT_PRIVATE_KEY) //produccion y desarrollo
                //    ?? configuration[ConfigurationConstants.JWT_PRIVATE_KEY]
                //    ?? throw new Exception(ResponseConstants.ConfigurationPropertyNotFound(ConfigurationConstants.JWT_PRIVATE_KEY));

                //var expirationInMutes = Environment.GetEnvironmentVariable(ConfigurationConstants.JWT_EXPIRATION_MIN) //produccion y desarrollo
                //    ?? configuration[ConfigurationConstants.JWT_EXPIRATION_MIN]
                //    ?? "10";

                var tokenConfiguration = TokenHelper.Configuration(configuration);

                builder.TokenValidationParameters = new TokenValidationParameters
                {

                    ValidateIssuer = true,
                    ValidIssuer = tokenConfiguration.Issuer,
                    ValidateAudience = true,
                    ValidAudience = tokenConfiguration.Audience,
                    ValidateLifetime = true,
                    ValidateIssuerSigningKey = true,
                    IssuerSigningKey = tokenConfiguration.SecurityKey,
                    ClockSkew = TimeSpan.Zero
                };

                builder.Events = new JwtBearerEvents
                {
                    OnChallenge = async context =>
                    {
                        var response = ResponseHelper.Create(ResponseConstants.AUTH_TOKEN_NOT_FOUND);
                        throw new UnauthorizedException(ResponseConstants.AUTH_TOKEN_NOT_FOUND);
                    }
                };
            });
            services.AddAuthorization();

        }

        public static void AddCache(this IServiceCollection services)
        {
            services.AddMemoryCache();
        }
    }
}