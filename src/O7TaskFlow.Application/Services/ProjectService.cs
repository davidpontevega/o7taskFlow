using O7TaskFlow.Application.DTOs.Projects;
using O7TaskFlow.Domain.Entities;
using O7TaskFlow.Domain.Interfaces.Repositories;

namespace O7TaskFlow.Application.Services;

public class ProjectService : IProjectService
{
    private readonly IProjectRepository _repo;

    public ProjectService(IProjectRepository repo) => _repo = repo;

    public async Task<IEnumerable<ProjectDto>> GetAllAsync(
        string company, string branch)
    {
        var projects = await _repo.GetAllAsync(company, branch);
        return projects.Select(p => new ProjectDto
        {
            Id = p.Id,
            Name = p.Name,
            Description = p.Description,
            Status = p.Status,
            Color = p.Color,
            Owner = p.Owner,
            CreatedAt = p.CreatedAt
        });
    }

    public async Task<ProjectDto?> GetByIdAsync(int id)
    {
        var p = await _repo.GetByIdAsync(id);
        if (p is null) return null;
        return new ProjectDto
        {
            Id = p.Id,
            Name = p.Name,
            Description = p.Description,
            Status = p.Status,
            Color = p.Color,
            Owner = p.Owner,
            CreatedAt = p.CreatedAt
        };
    }

    public async Task<int> CreateAsync(CreateProjectDto dto,
        string company, string branch, string owner)
    {
        var project = new Project
        {
            Name = dto.Name,
            Description = dto.Description,
            Color = dto.Color,
            CompanyCode = company,
            BranchCode = branch,
            Owner = owner
        };
        return await _repo.CreateAsync(project);
    }

    public async Task UpdateAsync(int id, CreateProjectDto dto)
    {
        var project = await _repo.GetByIdAsync(id)
            ?? throw new KeyNotFoundException($"Proyecto {id} no encontrado");

        project.Name = dto.Name;
        project.Description = dto.Description;
        project.Color = dto.Color;

        await _repo.UpdateAsync(project);
    }

    public async Task DeleteAsync(int id)
        => await _repo.DeleteAsync(id);
}