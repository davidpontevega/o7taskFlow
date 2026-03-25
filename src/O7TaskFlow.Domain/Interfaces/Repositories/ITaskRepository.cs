using O7TaskFlow.Domain.Entities;

namespace O7TaskFlow.Domain.Interfaces.Repositories;

public interface ITaskRepository
{
    Task<IEnumerable<TaskItem>> GetByBoardAsync(int boardId);
    Task<TaskItem?> GetByIdAsync(int id);
    Task<int> CreateAsync(TaskItem task);
    Task UpdateAsync(TaskItem task);
    Task DeleteAsync(int id);
    Task MoveAsync(int taskId, int newColumnId, int newOrder);
    Task<IEnumerable<TaskComment>> GetCommentsAsync(int taskId);
    Task<int> AddCommentAsync(TaskComment comment);
}