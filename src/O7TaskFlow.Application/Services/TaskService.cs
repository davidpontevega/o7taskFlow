using O7TaskFlow.Application.DTOs.Tasks;
using O7TaskFlow.Domain.Entities;
using O7TaskFlow.Domain.Interfaces.Repositories;

namespace O7TaskFlow.Application.Services;

public class TaskService : ITaskService
{
    private readonly ITaskRepository _repo;
    private readonly IBoardRepository _boardRepo;
    public TaskService(
        ITaskRepository repo,
        IBoardRepository boardRepo) 
    {
        _repo = repo;
        _boardRepo = boardRepo;
    }
    public async Task<IEnumerable<TaskDto>> GetByBoardAsync(int boardId)
    {
        var tasks = await _repo.GetByBoardAsync(boardId);
        return tasks.Select(MapToDto);
    }

    public async Task<TaskDto?> GetByIdAsync(int id)
    {
        var t = await _repo.GetByIdAsync(id);
        return t is null ? null : MapToDto(t);
    }

    public async Task<int> CreateAsync(CreateTaskDto dto, string reporter)
    {
        var task = new TaskItem
        {
            ColumnId = dto.ColumnId,
            BoardId = dto.BoardId,
            Title = dto.Title,
            Description = dto.Description,
            Priority = dto.Priority,
            Status = "PENDING",
            AssignedTo = dto.AssignedTo,
            Reporter = reporter,
            SortOrder = 0,
            DueDate = dto.DueDate,
            StartDate = dto.StartDate
        };
        return await _repo.CreateAsync(task);
    }

    public async Task UpdateAsync(int id, UpdateTaskDto dto)
    {
        var task = await _repo.GetByIdAsync(id)
            ?? throw new KeyNotFoundException($"Tarea {id} no encontrada");

        task.Title = dto.Title;
        task.Description = dto.Description;
        task.Priority = dto.Priority;
        task.Status = dto.Status;
        task.AssignedTo = dto.AssignedTo;
        task.DueDate = dto.DueDate;
        task.StartDate = dto.StartDate;

        await _repo.UpdateAsync(task);
    }

    public async Task DeleteAsync(int id)
        => await _repo.DeleteAsync(id);

    public async Task MoveAsync(int taskId, int columnId, int order)
        => await _repo.MoveAsync(taskId, columnId, order);

    public async Task<IEnumerable<TaskComment>> GetCommentsAsync(int taskId)
        => await _repo.GetCommentsAsync(taskId);

    public async Task<int> AddCommentAsync(
        int taskId, string text, string userCode)
    {
        var comment = new TaskComment
        {
            TaskId = taskId,
            UserCode = userCode,
            Text = text
        };
        return await _repo.AddCommentAsync(comment);
    }

    private static TaskDto MapToDto(TaskItem t) => new()
    {
        Id = t.Id,
        ColumnId = t.ColumnId,
        BoardId = t.BoardId,
        Title = t.Title,
        Description = t.Description,
        Priority = t.Priority,
        Status = t.Status,
        AssignedTo = t.AssignedTo,
        AssignedName = t.AssignedName,
        Reporter = t.Reporter,
        SortOrder = t.SortOrder,
        DueDate = t.DueDate,
        StartDate = t.StartDate,
        CreatedAt = t.CreatedAt
    };
    public async Task MoveToStatusColumnAsync(int taskId, string status, int boardId)
    {
        // Mapa de status → nombre de columna
        var statusToColumn = new Dictionary<string, string[]>
    {
        { "PENDING",     new[] { "pendiente", "pending", "backlog" } },
        { "IN_PROGRESS", new[] { "progreso", "progress", "proceso" } },
        { "IN_REVIEW",   new[] { "revisión", "revision", "review" } },
        { "DONE",        new[] { "completado", "done", "complete", "terminado" } },
    };

        // Obtener columnas del tablero
        var board = await _boardRepo.GetByIdWithColumnsAsync(boardId);
        if (board is null) return;

        if (!statusToColumn.TryGetValue(status, out var keywords)) return;

        // Buscar columna que coincida con el status
        var targetColumn = board.Columns.FirstOrDefault(c =>
            keywords.Any(k =>
                c.Name.ToLower().Contains(k)));

        if (targetColumn is null) return;

        // Obtener el orden al final de la columna destino
        var tasks = await _repo.GetByBoardAsync(boardId);
        var newOrder = tasks.Count(t => t.ColumnId == targetColumn.Id);

        await _repo.MoveAsync(taskId, targetColumn.Id, newOrder);
    }
}