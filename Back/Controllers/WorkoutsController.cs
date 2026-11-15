using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using MiProyectoApi.Dtos;
using MiProyectoApi.Services.Commands;
using MiProyectoApi.Services.Queries;

namespace MiProyectoApi.Controllers;

[ApiController]
[Authorize]
[Route("api/workouts")]
public class WorkoutsController : ControllerBase
{
    private readonly IEntrenamientoQueryService _queryService;
    private readonly IEntrenamientoCommandService _commandService;

    public WorkoutsController(IEntrenamientoQueryService queryService, IEntrenamientoCommandService commandService)
    {
        _queryService = queryService;
        _commandService = commandService;
    }

    private int UserId => int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);

    // GET api/workouts (Operación de Lectura)
    [HttpGet]
    public async Task<IActionResult> GetAll()
    {
        var resultado = await _queryService.GetAllByUserAsync(UserId);
        return Ok(resultado);
    }

    // GET api/workouts/5 (Operación de Lectura)
    [HttpGet("{id}")]
    public async Task<IActionResult> Get(int id)
    {
        var workout = await _queryService.GetByIdAsync(id, UserId);
        if (workout is null) return NotFound();
        return Ok(workout);
    }

    // POST api/workouts (Operación de Escritura)
    [HttpPost]
    public async Task<IActionResult> Create(WorkoutCreateDto dto)
    {
        var (success, result, error) = await _commandService.CreateAsync(UserId, dto);
        if (!success)
            return BadRequest(new { mensaje = error });

        return CreatedAtAction(nameof(Get), new { id = result!.IdEntrenamiento }, result);
    }

    // DELETE api/workouts/5 (Operación de Escritura)
    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(int id)
    {
        var success = await _commandService.DeleteAsync(id, UserId);
        if (!success) return NotFound();
        return NoContent();
    }
}
