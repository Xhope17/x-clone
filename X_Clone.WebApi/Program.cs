using XClone.Application.Interfaces.Services;
using XClone.Application.Models.DTOs;
using XClone.Application.Services;
using XClone.Domain.Database.SqlServer.Context;
using XClone.Shared;
using XClone.WebApi.Extensions;
using XClone.WebApi.Middlewares;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.

builder.Services.AddControllers();
// Learn more about configuring OpenAPI at https://aka.ms/aspnet/openapi
builder.Services.AddOpenApi();


//services
//builder.Services.AddScoped<IPostService, PostService>();
builder.Services.AddScoped<IUserService, UserService>();

builder.Services.AddSingleton<Cache<PostDto>>();
builder.Services.AddSingleton<Cache<UserDto>>();

//Database
builder.Services.AddSqlServer<XcloneContext>(builder.Configuration.GetConnectionString("Database"));

//Database - Repositories
//builder.Services.AddTransient<IPostRepository, PostRepository>();

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
