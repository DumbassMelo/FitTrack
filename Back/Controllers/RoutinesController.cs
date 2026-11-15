using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using MiProyectoApi.Dtos;
using MiProyectoApi.Services.Commands;
using MiProyectoApi.Services.Queries;

namespace MiProyectoApi.Controllers;

[ApiController]
[Authorize]
[Route("api/routines")]
public class RoutinesController : ControllerBase
{
    private readonly IRutinaQueryService _queryService;
    private readonly IRutinaCommandService _commandService;

    public RoutinesController(IRutinaQueryService queryService, IRutinaCommandService commandService)
    {
        _queryService = queryService;
        _commandService = commandService;
    }

    private int UserId => int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);

    // GET api/routines (Operación de Lectura)
    [HttpGet]
    public async Task<IActionResult> GetAll()
    {
        var rutinas = await _queryService.GetAllByUserAsync(UserId);
        return Ok(rutinas);
    }

    // GET api/routines/recent (Operación de Lectura)
    [HttpGet("recent")]
    public async Task<IActionResult> GetRecent()
    {
        var rutina = await _queryService.GetRecentByUserAsync(UserId);
        if (rutina == null) return NotFound(new { mensaje = "No hay rutinas recientes registradas" });
        return Ok(rutina);
    }

    // GET api/routines/5 (Operación de Lectura)
    [HttpGet("{id}")]
    public async Task<IActionResult> Get(int id)
    {
        var r = await _queryService.GetByIdAsync(id, UserId);
        if (r is null) return NotFound();
        return Ok(r);
    }

    // POST api/routines (Operación de Escritura)
    [HttpPost]
    public async Task<IActionResult> Create(RutinaCreateDto dto)
    {
        var (success, result, error) = await _commandService.CreateAsync(UserId, dto);
        if (!success)
            return BadRequest(new { mensaje = error });

        return CreatedAtAction(nameof(Get), new { id = result!.IdRutina }, result);
    }

    // PUT api/routines/5 (Operación de Escritura)
    [HttpPut("{id}")]
    public async Task<IActionResult> Update(int id, RutinaCreateDto dto)
    {
        var (success, result, error) = await _commandService.UpdateAsync(id, UserId, dto);
        if (!success)
        {
            if (error == "Rutina no encontrada") return NotFound();
            return BadRequest(new { mensaje = error });
        }

        return Ok(result);
    }

    // DELETE api/routines/5 (Operación de Escritura)
    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(int id)
    {
        var success = await _commandService.DeleteAsync(id, UserId);
        if (!success) return NotFound();
        return NoContent();
    }
}
