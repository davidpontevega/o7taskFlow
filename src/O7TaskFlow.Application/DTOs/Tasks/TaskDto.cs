namespace O7TaskFlow.Application.DTOs.Tasks;

public class TaskDto
{
    public int Id { get; set; }
    public int ColumnId { get; set; }
    public int BoardId { get; set; }
    public string Title { get; set; } = string.Empty;
    public string? Description { get; set; }
    public string Priority { get; set; } = string.Empty;
    public string Status { get; set; } = string.Empty;
    public string? AssignedTo { get; set; }
    public string? AssignedName { get; set; }
    public string Reporter { get; set; } = string.Empty;
    public int SortOrder { get; set; }
    public DateTime? DueDate { get; set; }
    public DateTime? StartDate { get; set; }
    public DateTime CreatedAt { get; set; }
}