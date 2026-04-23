using Scalar.AspNetCore;
using Serilog;
using XClone.Infrastructure.Workers;
using XClone.WebApi.Extensions;
using XClone.WebApi.Middlewares;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddHostedService<TimerNotifyWorker>(); //registro del worker para que se ejecute en segundo plano

builder.Host.UseSerilog();

await builder.Services.AddCore(builder.Configuration);

// Add services to the container.

//builder.Services.AddControllers();
//builder.Services.AddOpenApi();


//services
//builder.Services.AddScoped<IPostService, PostService>();
//builder.Services.AddScoped<IUserService, UserService>();

//Cache
//builder.Services.AddSingleton<Cache<PostDto>>();
//builder.Services.AddSingleton<Cache<UserDto>>();

//Database
//builder.Services.AddSqlServer<XcloneContext>(builder.Configuration.GetConnectionString("Database"));

//Database - Repositories
//builder.Services.AddTransient<IPostRepository, PostRepository>();

//Extensiones
//builder.Services.AddServices();
//builder.Services.AddRepositories();


//

var app = builder.Build();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.MapScalarApiReference(options =>
    {
        options.Theme = ScalarTheme.Mars;
        options.WithTitle("X-Clone API");
    });
    app.MapOpenApi();
}

app.UseMiddleware<ErrorHandlerMiddleware>(); //siempre va antes de cualquier otro middleware para capturar errores

app.UseHttpsRedirection();

app.UseAuthentication(); //va antes de authorization para validar el token antes de verificar los roles o permisos
app.UseAuthorization();

app.MapControllers();

app.Run();
