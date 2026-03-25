using O7TaskFlow.Application.DTOs.Auth;
using O7TaskFlow.Domain.Interfaces.Services;

namespace O7TaskFlow.Application.Services;

public class AuthService : IAuthService
{
    private readonly ISecurityService _security;
    private readonly IJwtService _jwt;

    public AuthService(ISecurityService security, IJwtService jwt)
    {
        _security = security;
        _jwt = jwt;
    }

    public async Task<List<CompanyDto>> GetCompaniesAsync(
        string user, string password)
    {
        var companies = await _security.GetCompaniesAsync(user, password);
        return companies
            .Select(c => new CompanyDto(c.Code, c.Name))
            .ToList();
    }

    public async Task<List<BranchDto>> GetBranchesAsync(
        string user, string password)
    {
        var branches = await _security.GetBranchesAsync(user, password);
        return branches
            .Select(b => new BranchDto(b.Code, b.Name))
            .ToList();
    }

    public async Task<UserSessionDto?> LoginAsync(LoginRequestDto dto)
    {
        var companyCode = dto.Company.Trim();
        var branchCode = dto.Branch.Trim();

        // Branchesbd retorna 6 chars (ej: "007001")
        // Getuserandpassword necesita solo los últimos 3 (ej: "001")
        if (branchCode.Length == 6)
            branchCode = branchCode.Substring(3, 3);

        var session = await _security.LoginAsync(
            dto.User, dto.Password, companyCode, branchCode);

        if (session is null) return null;

        var token = _jwt.GenerateToken(session);

        return new UserSessionDto
        {
            Token = token,
            UserCode = session.UserCode,
            FullName = session.FullName,
            Email = session.Email,
            PhotoUrl = session.PhotoUrl,
            Company = companyCode,
            Branch = branchCode,
            BranchName = session.BranchName,
            ExpiresAt = DateTime.UtcNow.AddHours(8)
        };
    }

    public async Task<bool> ChangePasswordAsync(
        string company, string branch,
        string user, ChangePasswordDto dto)
    {
        var result = await _security.ChangePasswordAsync(
            company, branch, user,
            dto.OldPassword, dto.NewPassword);
        return result == 1;
    }
}