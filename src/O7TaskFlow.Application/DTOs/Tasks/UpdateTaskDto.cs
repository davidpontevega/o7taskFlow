namespace O7TaskFlow.Application.DTOs.Tasks;

public record UpdateTaskDto(
    string Title,
    string? Description,
    string Priority,
    string Status,
    string? AssignedTo,
    DateTime? DueDate,
    DateTime? StartDate
);