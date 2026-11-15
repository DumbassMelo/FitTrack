using Microsoft.AspNetCore.Mvc;
using MiProyectoApi.Dtos;
using MiProyectoApi.Services.Commands;

namespace MiProyectoApi.Controllers;

[ApiController]
[Route("api/auth")]
public class AuthController : ControllerBase
{
    private readonly IUsuarioCommandService _commandService;

    public AuthController(IUsuarioCommandService commandService)
    {
        _commandService = commandService;
    }

    [HttpPost("register")]
    public async Task<IActionResult> Register(RegisterDto dto)
    {
        var (success, result, error) = await _commandService.RegisterAsync(dto);
        if (!success)
            return Conflict(new { mensaje = error });

        return Created("", result);
    }

    [HttpPost("login")]
    public async Task<IActionResult> Login(LoginDto dto)
    {
        var (success, token, error) = await _commandService.LoginAsync(dto);
        if (!success)
            return Unauthorized(new { mensaje = error });

        return Ok(new { token });
    }
}
