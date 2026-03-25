using O7TaskFlow.Application.DTOs.Projects;
using O7TaskFlow.Domain.Entities;

namespace O7TaskFlow.Application.Services;

public interface IBoardService
{
    Task<IEnumerable<Board>> GetByProjectAsync(int projectId);
    Task<Board?> GetWithColumnsAsync(int boardId);
    Task<int> CreateAsync(int projectId, string name,
                                 string? description);
}