using O7TaskFlow.Application.DTOs.Dashboard;
using O7TaskFlow.Domain.Interfaces.Repositories;

namespace O7TaskFlow.Application.Services;

public class DashboardService : IDashboardService
{
    private readonly ITaskRepository _tasks;
    private readonly IProjectRepository _projects;

    public DashboardService(
        ITaskRepository tasks,
        IProjectRepository projects)
    {
        _tasks = tasks;
        _projects = projects;
    }

    public async Task<DashboardDto> GetAsync(
        string company, string branch, string user)
    {
        var projects = await _projects.GetAllAsync(company, branch);
        var today = DateTime.Today;

        var allTasks = new List<O7TaskFlow.Domain.Entities.TaskItem>();
        foreach (var project in projects)
        {
            // Traer tareas de todos los tableros del proyecto
            // (simplificado — en producción se haría con un JOIN directo)
        }

        return new DashboardDto
        {
            TotalTasks = allTasks.Count,
            PendingTasks = allTasks.Count(t => t.Status == "PENDING"),
            InProgressTasks = allTasks.Count(t => t.Status == "IN_PROGRESS"),
            OverdueTasks = allTasks.Count(t =>
                t.DueDate.HasValue &&
                t.DueDate.Value < today &&
                t.Status != "DONE"),
            CompletedTasks = allTasks.Count(t => t.Status == "DONE"),
        };
    }
}