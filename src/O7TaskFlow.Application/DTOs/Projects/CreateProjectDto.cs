namespace O7TaskFlow.Application.DTOs.Projects;

public record CreateProjectDto(
    string Name,
    string? Description,
    string Color
);