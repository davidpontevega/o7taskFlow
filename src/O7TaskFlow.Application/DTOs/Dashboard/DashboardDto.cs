namespace O7TaskFlow.Application.DTOs.Dashboard;

public class DashboardDto
{
    public int TotalTasks { get; set; }
    public int PendingTasks { get; set; }
    public int InProgressTasks { get; set; }
    public int OverdueTasks { get; set; }
    public int CompletedTasks { get; set; }
    public List<UserProductivity> ProductivityByUser { get; set; } = new();
}

public class UserProductivity
{
    public string UserCode { get; set; } = string.Empty;
    public string FullName { get; set; } = string.Empty;
    public int Total { get; set; }
    public int Completed { get; set; }
    public int Overdue { get; set; }
}