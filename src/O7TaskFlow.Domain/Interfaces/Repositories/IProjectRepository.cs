using O7TaskFlow.Domain.Entities;

namespace O7TaskFlow.Domain.Interfaces.Repositories;

public interface IProjectRepository
{
    Task<IEnumerable<Project>> GetAllAsync(string company, string branch);
    Task<Project?> GetByIdAsync(int id);
    Task<int> CreateAsync(Project project);
    Task UpdateAsync(Project project);
    Task DeleteAsync(int id);
}