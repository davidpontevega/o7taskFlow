using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using O7TaskFlow.Application.DTOs.Auth;
using O7TaskFlow.Application.Services;
using System.Security.Claims;

namespace O7TaskFlow.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AuthController : ControllerBase
{
    private readonly IAuthService _auth;
    public AuthController(IAuthService auth) => _auth = auth;

    [HttpPost("companies")]
    public async Task<IActionResult> GetCompanies(
        [FromBody] CredentialsDto dto)
        => Ok(await _auth.GetCompaniesAsync(dto.User, dto.Password));

    [HttpPost("branches")]
    public async Task<IActionResult> GetBranches(
        [FromBody] CredentialsDto dto)
        => Ok(await _auth.GetBranchesAsync(dto.User, dto.Password));

    [HttpPost("login")]
    public async Task<IActionResult> Login(
        [FromBody] LoginRequestDto dto)
    {
        var result = await _auth.LoginAsync(dto);
        if (result is null)
            return Unauthorized(new { message = "Credenciales inválidas" });
        return Ok(result);
    }

    [HttpPost("change-password")]
    [Authorize]
    public async Task<IActionResult> ChangePassword(
        [FromBody] ChangePasswordDto dto)
    {
        var user = User.FindFirst("user")?.Value!;
        var company = User.FindFirst("company")?.Value!;
        var branch = User.FindFirst("branch")?.Value!;

        var ok = await _auth.ChangePasswordAsync(
            company, branch, user, dto);
        return ok ? Ok(new { message = "Contraseña actualizada" })
                  : BadRequest(new { message = "Contraseña anterior incorrecta" });
    }
}