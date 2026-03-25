using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using O7TaskFlow.Application.DTOs.Projects;
using O7TaskFlow.Application.Services;

namespace O7TaskFlow.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class ProjectsController : ControllerBase
{
    private readonly IProjectService _service;
    public ProjectsController(IProjectService service) => _service = service;

    [HttpGet]
    public async Task<IActionResult> GetAll()
    {
        var company = User.FindFirst("company")?.Value!;
        var branch = User.FindFirst("branch")?.Value!;
        return Ok(await _service.GetAllAsync(company, branch));
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> GetById(int id)
    {
        var project = await _service.GetByIdAsync(id);
        return project is null ? NotFound() : Ok(project);
    }

    [HttpPost]
    public async Task<IActionResult> Create(
        [FromBody] CreateProjectDto dto)
    {
        var company = User.FindFirst("company")?.Value!;
        var branch = User.FindFirst("branch")?.Value!;
        var user = User.FindFirst("user")?.Value!;
        var id = await _service.CreateAsync(dto, company, branch, user);
        return CreatedAtAction(nameof(GetById), new { id }, new { id });
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> Update(
        int id, [FromBody] CreateProjectDto dto)
    {
        await _service.UpdateAsync(id, dto);
        return NoContent();
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(int id)
    {
        await _service.DeleteAsync(id);
        return NoContent();
    }
}