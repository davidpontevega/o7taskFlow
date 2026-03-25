namespace O7TaskFlow.Application.DTOs.Tasks;

public record CreateTaskDto(
    int ColumnId,
    int BoardId,
    string Title,
    string? Description,
    string Priority,
    string? AssignedTo,
    DateTime? DueDate,
    DateTime? StartDate
);