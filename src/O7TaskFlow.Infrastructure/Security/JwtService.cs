using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using Microsoft.Extensions.Configuration;
using Microsoft.IdentityModel.Tokens;
using O7TaskFlow.Domain.Entities;
using O7TaskFlow.Domain.Interfaces.Services;

namespace O7TaskFlow.Infrastructure.Security;

public class JwtService : IJwtService
{
    private readonly IConfiguration _config;

    public JwtService(IConfiguration config) => _config = config;

    public string GenerateToken(UserSessionInfo session)
    {
        var key = new SymmetricSecurityKey(
            Encoding.UTF8.GetBytes(_config["Jwt:Key"]!));
        var creds = new SigningCredentials(
            key, SecurityAlgorithms.HmacSha256);
        var expiry = DateTime.UtcNow.AddHours(
            double.Parse(_config["Jwt:ExpiresInHours"] ?? "8"));

        var claims = new[]
        {
            new Claim("user",      session.UserCode),
            new Claim("company",   session.Company),
            new Claim("branch",    session.Branch),
            new Claim("fullname",  session.FullName),
            new Claim("branchname",session.BranchName),
            new Claim(ClaimTypes.Email, session.Email ?? ""),
        };

        var token = new JwtSecurityToken(
            claims: claims,
            expires: expiry,
            signingCredentials: creds);

        return new JwtSecurityTokenHandler().WriteToken(token);
    }

    public ClaimsPrincipal? ValidateToken(string token)
    {
        try
        {
            var handler = new JwtSecurityTokenHandler();
            return handler.ValidateToken(token,
                new TokenValidationParameters
                {
                    ValidateIssuerSigningKey = true,
                    IssuerSigningKey = new SymmetricSecurityKey(
                        Encoding.UTF8.GetBytes(_config["Jwt:Key"]!)),
                    ValidateIssuer = false,
                    ValidateAudience = false,
                    ClockSkew = TimeSpan.Zero
                }, out _);
        }
        catch { return null; }
    }
}