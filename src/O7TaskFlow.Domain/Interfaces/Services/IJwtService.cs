using System.Security.Claims;
using O7TaskFlow.Domain.Entities;

namespace O7TaskFlow.Domain.Interfaces.Services;

public interface IJwtService
{
    string GenerateToken(UserSessionInfo session);
    ClaimsPrincipal? ValidateToken(string token);
}