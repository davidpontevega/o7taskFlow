namespace O7TaskFlow.Domain.Entities;

public class BoardColumn
{
    public int Id { get; set; }
    public int BoardId { get; set; }
    public string Name { get; set; } = string.Empty;
    public int Order { get; set; }
    public string Color { get; set; } = "#6C63FF";
    public int WipLimit { get; set; } = 0;

    public List<TaskItem> Tasks { get; set; } = new();
}