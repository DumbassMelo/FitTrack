using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using MiProyectoApi.Dtos;
using MiProyectoApi.Services.Commands;
using MiProyectoApi.Services.Queries;

namespace MiProyectoApi.Controllers;

[ApiController]
[Authorize]
[Route("api/users")]
public class UsersController : ControllerBase
{
    private readonly IUsuarioQueryService _queryService;
    private readonly IUsuarioCommandService _commandService;

    public UsersController(IUsuarioQueryService queryService, IUsuarioCommandService commandService)
    {
        _queryService = queryService;
        _commandService = commandService;
    }

    private int UserId => int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);

    // GET api/users/profile (Operación de Lectura)
    [HttpGet("profile")]
    public async Task<IActionResult> GetProfile()
    {
        var perfil = await _queryService.GetProfileAsync(UserId);
        if (perfil is null) return NotFound();
        return Ok(perfil);
    }

    // PUT api/users/profile (Operación de Escritura)
    [HttpPut("profile")]
    public async Task<IActionResult> UpdateProfile(PerfilUpdateDto dto)
    {
        var (success, result, error) = await _commandService.UpdateProfileAsync(UserId, dto);
        if (!success)
        {
            if (error == "Usuario no encontrado") return NotFound();
            return Conflict(new { mensaje = error });
        }

        return Ok(result);
    }
}
