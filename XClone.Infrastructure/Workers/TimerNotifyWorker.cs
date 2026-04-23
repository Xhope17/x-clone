using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using XClone.Domain.Interfaces.Repositories;
using XClone.Shared;

namespace XClone.Infrastructure.Workers
{
    public class TimerNotifyWorker(IServiceScopeFactory serviceScopeFactory, SMTP smpt) : BackgroundService
    {
        protected override async Task ExecuteAsync(CancellationToken stoppingToken)
        {
            //var timer = new PeriodicTimer(TimeSpan.FromSeconds(3));
            var timer = new PeriodicTimer(TimeSpan.FromHours(48));

            while (!stoppingToken.IsCancellationRequested)
            {
                var scope = serviceScopeFactory.CreateScope(); // Create a new scope for each iteration
                var userRepository = scope.ServiceProvider.GetRequiredService<IUserRepository>(); // Resolve the IUserRepository from the scope

                var users = userRepository.Queryable().ToList() //trae todos los usuarios de la base de datos
                       .Where(user => user.IsVerified == false)
                       .ToList();

                foreach (var user in users)
                {
                    if (user.IsVerified is false)
                    {
                        //envia una notificacion al usuario para que se convierta en un usuario verificado
                        Console.WriteLine($"{user.Email},Conviertete en un usuario verificado para obtener beneficios exclusivos!");
                        //await smpt.Send(user.Email, "Suscribete", "Suscribete ya!!"); //envia correos
                    }
                }

                //se ejecuta cada 3 segundos
                Console.WriteLine($"Current time: {DateTime.Now}");
                await timer.WaitForNextTickAsync(stoppingToken);
            }
        }
    }
}
