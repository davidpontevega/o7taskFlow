namespace O7TaskFlow.Domain.Entities;

public class Project
{
    public int Id { get; set; }
    public string CompanyCode { get; set; } = string.Empty;
    public string BranchCode { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }
    public string Status { get; set; } = "ACTIVE";
    public string Owner { get; set; } = string.Empty;
    public string Color { get; set; } = "#2E75B6";
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }
}