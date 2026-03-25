namespace O7TaskFlow.Domain.Entities;

public class TaskLabel
{
    public int Id { get; set; }
    public int ProjectId { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Color { get; set; } = "#43D9AD";
}