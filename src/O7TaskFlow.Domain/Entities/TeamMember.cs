namespace O7TaskFlow.Domain.Entities;

public class TeamMember
{
    public int Id { get; set; }
    public int ProjectId { get; set; }
    public string Leader { get; set; } = string.Empty;
    public string Worker { get; set; } = string.Empty;
    public string Role { get; set; } = "MEMBER";
    public DateTime CreatedAt { get; set; }
}