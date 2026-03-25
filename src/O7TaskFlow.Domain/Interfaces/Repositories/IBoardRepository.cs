using O7TaskFlow.Domain.Entities;

namespace O7TaskFlow.Domain.Interfaces.Repositories;

public interface IBoardRepository
{
    Task<IEnumerable<Board>> GetByProjectAsync(int projectId);
    Task<Board?> GetByIdWithColumnsAsync(int boardId);
    Task<int> CreateAsync(Board board);
    Task<int> CreateColumnAsync(BoardColumn column);
    Task UpdateColumnAsync(BoardColumn column);
    Task DeleteColumnAsync(int columnId);
}