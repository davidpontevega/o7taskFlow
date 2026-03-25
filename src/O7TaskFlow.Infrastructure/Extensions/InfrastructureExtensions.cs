using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using O7TaskFlow.Domain.Interfaces.Services;
using O7TaskFlow.Infrastructure.Security;

namespace O7TaskFlow.Infrastructure.Extensions;

public static class InfrastructureExtensions
{
    public static IServiceCollection AddInfrastructure(
        this IServiceCollection services,
        IConfiguration config)
    {
        services.AddScoped<ISecurityService, OracleSecurityService>();
        services.AddScoped<IJwtService, JwtService>();

        return services;
    }
}