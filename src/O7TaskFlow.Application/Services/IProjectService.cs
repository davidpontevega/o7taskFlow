using O7TaskFlow.Application.DTOs.Projects;

namespace O7TaskFlow.Application.Services;

public interface IProjectService
{
    Task<IEnumerable<ProjectDto>> GetAllAsync(string company, string branch);
    Task<ProjectDto?> GetByIdAsync(int id);
    Task<int> CreateAsync(CreateProjectDto dto, string company,
                           string branch, string owner);
    Task UpdateAsync(int id, CreateProjectDto dto);
    Task DeleteAsync(int id);
}