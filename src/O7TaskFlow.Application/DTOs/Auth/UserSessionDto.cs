namespace O7TaskFlow.Application.DTOs.Auth;

// DTO de respuesta al frontend (no expone DbUser/DbPassword)
public class UserSessionDto
{
    public string Token { get; set; } = string.Empty;
    public string UserCode { get; set; } = string.Empty;
    public string FullName { get; set; } = string.Empty;
    public string? Email { get; set; }
    public string? PhotoUrl { get; set; }
    public string Company { get; set; } = string.Empty;
    public string Branch { get; set; } = string.Empty;
    public string BranchName { get; set; } = string.Empty;
    public DateTime ExpiresAt { get; set; }
}