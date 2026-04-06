using XClone.WebApi.Extensions;
using XClone.WebApi.Middlewares;

var builder = WebApplication.CreateBuilder(args);

//builder.Host.UseSerilog();

builder.Services.AddCore(builder.Configuration);

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
builder.Services.AddServices();
builder.Services.AddRepositories();


//

var app = builder.Build();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
}

app.UseMiddleware<ErrorHandlerMiddleware>();

app.UseHttpsRedirection();
app.UseAuthorization();

app.MapControllers();

app.Run();
