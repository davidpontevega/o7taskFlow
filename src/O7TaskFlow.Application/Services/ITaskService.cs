using O7TaskFlow.Application.DTOs.Tasks;
using O7TaskFlow.Domain.Entities;

namespace O7TaskFlow.Application.Services;

public interface ITaskService
{
    Task<IEnumerable<TaskDto>> GetByBoardAsync(int boardId);
    Task<TaskDto?> GetByIdAsync(int id);
    Task<int> CreateAsync(CreateTaskDto dto, string reporter);
    Task UpdateAsync(int id, UpdateTaskDto dto);
    Task DeleteAsync(int id);
    Task MoveAsync(int taskId, int columnId, int order);
    Task<IEnumerable<TaskComment>> GetCommentsAsync(int taskId);
    Task<int> AddCommentAsync(int taskId,
                                   string text, string userCode);
    Task MoveToStatusColumnAsync(int taskId, string status, int boardId);

}