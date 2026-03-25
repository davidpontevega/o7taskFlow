using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using O7TaskFlow.Domain.Interfaces.Repositories;

namespace O7TaskFlow.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class UsersController : ControllerBase
{
    private readonly IUserRepository _repo;
    public UsersController(IUserRepository repo) => _repo = repo;

    [HttpGet]
    public async Task<IActionResult> GetUsers()
    {
        var company = User.FindFirst("company")?.Value!;
        var branch = User.FindFirst("branch")?.Value!;
        return Ok(await _repo.GetByCompanyAsync(company, branch));
    }
}