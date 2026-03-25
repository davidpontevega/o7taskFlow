namespace O7TaskFlow.Domain.Entities;

public class UserSessionInfo
{
    public string DbUser { get; set; } = string.Empty;
    public string DbPassword { get; set; } = string.Empty;
    public string UserCode { get; set; } = string.Empty;
    public string FullName { get; set; } = string.Empty;
    public string? Email { get; set; }
    public string? Phone { get; set; }
    public string? PhotoUrl { get; set; }
    public string Company { get; set; } = string.Empty;
    public string Branch { get; set; } = string.Empty;
    public string BranchName { get; set; } = string.Empty;
}