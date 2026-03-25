using Microsoft.Extensions.DependencyInjection;
using O7TaskFlow.Domain.Interfaces.Repositories;
using O7TaskFlow.Persistence.Context;
using O7TaskFlow.Persistence.Repositories;

namespace O7TaskFlow.Persistence.Extensions;

public static class PersistenceExtensions
{
    public static IServiceCollection AddPersistence(
        this IServiceCollection services,
        Microsoft.Extensions.Configuration.IConfiguration config)
    {
        services.AddSingleton<OracleDbContext>();

        services.AddScoped<IProjectRepository, ProjectRepository>();
        services.AddScoped<IBoardRepository, BoardRepository>();
        services.AddScoped<ITaskRepository, TaskRepository>();
        services.AddScoped<IUserRepository, UserRepository>();

        return services;
    }
}