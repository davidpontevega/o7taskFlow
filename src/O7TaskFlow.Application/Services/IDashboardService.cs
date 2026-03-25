using O7TaskFlow.Application.DTOs.Dashboard;

namespace O7TaskFlow.Application.Services;

public interface IDashboardService
{
    Task<DashboardDto> GetAsync(string company, string branch, string user);
}