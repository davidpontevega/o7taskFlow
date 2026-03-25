namespace O7TaskFlow.Domain.Entities;

public class TaskComment
{
    public int Id { get; set; }
    public int TaskId { get; set; }
    public string UserCode { get; set; } = string.Empty;
    public string UserName { get; set; } = string.Empty;
    public string Text { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; }
}