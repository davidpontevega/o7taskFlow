using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using O7TaskFlow.Application.DTOs.Tasks;
using O7TaskFlow.Application.Services;

namespace O7TaskFlow.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class TasksController : ControllerBase
{
    private readonly ITaskService _service;

    public TasksController(ITaskService service)
        => _service = service;

    [HttpGet("board/{boardId}")]
    public async Task<IActionResult> GetByBoard(int boardId)
        => Ok(await _service.GetByBoardAsync(boardId));

    [HttpGet("{id}")]
    public async Task<IActionResult> GetById(int id)
    {
        var task = await _service.GetByIdAsync(id);
        return task is null ? NotFound() : Ok(task);
    }

    [HttpPost]
    public async Task<IActionResult> Create(
        [FromBody] CreateTaskDto dto)
    {
        var reporter = User.FindFirst("user")?.Value!;
        var id = await _service.CreateAsync(dto, reporter);
        return CreatedAtAction(nameof(GetById), new { id }, new { id });
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> Update(
        int id, [FromBody] UpdateTaskDto dto)
    {
        var existing = await _service.GetByIdAsync(id);
        if (existing is null) return NotFound();

        await _service.UpdateAsync(id, dto);

        return NoContent();
    }

    [HttpPatch("{id}/move")]
    public async Task<IActionResult> Move(
        int id, [FromBody] MoveTaskDto dto)
    {
        await _service.MoveAsync(id, dto.ColumnId, dto.Order);
        return NoContent();
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(int id)
    {
        await _service.DeleteAsync(id);
        return NoContent();
    }

    [HttpGet("{id}/comments")]
    public async Task<IActionResult> GetComments(int id)
        => Ok(await _service.GetCommentsAsync(id));

    [HttpPost("{id}/comments")]
    public async Task<IActionResult> AddComment(
        int id, [FromBody] CreateCommentDto dto)
    {
        var user = User.FindFirst("user")?.Value!;
        var commentId = await _service.AddCommentAsync(id, dto.Text, user);
        return Ok(new { id = commentId });
    }
}