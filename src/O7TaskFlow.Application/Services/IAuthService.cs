using O7TaskFlow.Application.DTOs.Auth;
using O7TaskFlow.Domain.Entities;

namespace O7TaskFlow.Application.Services;

public interface IAuthService
{
    Task<List<CompanyDto>> GetCompaniesAsync(string user, string password);
    Task<List<BranchDto>> GetBranchesAsync(string user, string password);
    Task<UserSessionDto?> LoginAsync(LoginRequestDto dto);
    Task<bool> ChangePasswordAsync(string company, string branch,
        string user, ChangePasswordDto dto);
}