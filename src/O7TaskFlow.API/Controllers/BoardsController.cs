using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using O7TaskFlow.Application.Services;

namespace O7TaskFlow.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class BoardsController : ControllerBase
{
    private readonly IBoardService _service;
    public BoardsController(IBoardService service) => _service = service;

    [HttpGet("{projectId}")]
    public async Task<IActionResult> GetByProject(int projectId)
        => Ok(await _service.GetByProjectAsync(projectId));

    [HttpGet("detail/{boardId}")]
    public async Task<IActionResult> GetWithColumns(int boardId)
    {
        var board = await _service.GetWithColumnsAsync(boardId);
        return board is null ? NotFound() : Ok(board);
    }

    [HttpPost]
    public async Task<IActionResult> Create(
        [FromBody] CreateBoardDto dto)
    {
        var id = await _service.CreateAsync(
            dto.ProjectId, dto.Name, dto.Description);
        return Ok(new { id });
    }
}

public record CreateBoardDto(int ProjectId, string Name, string? Description);