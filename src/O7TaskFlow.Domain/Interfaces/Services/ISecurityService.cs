using O7TaskFlow.Domain.Entities;

namespace O7TaskFlow.Domain.Interfaces.Services;

public interface ISecurityService
{
    Task<UserSessionInfo?> LoginAsync(
        string user, string password,
        string company, string branch);

    Task<List<CompanyInfo>> GetCompaniesAsync(
        string user, string password);

    Task<List<BranchInfo>> GetBranchesAsync(
        string user, string password);

    Task<bool> CanAccessAsync(
        string company, string branch, string user,
        string module, string controller, string action);

    Task<int> ChangePasswordAsync(
        string company, string branch, string user,
        string oldPassword, string newPassword);
}