using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using MiProyectoApi.Dtos;
using MiProyectoApi.Services.Commands;
using MiProyectoApi.Services.Queries;

namespace MiProyectoApi.Controllers;

[ApiController]
[Route("api/exercises")]
public class ExercisesController : ControllerBase
{
    private readonly IEjercicioQueryService _queryService;
    private readonly IEjercicioCommandService _commandService;

    public ExercisesController(IEjercicioQueryService queryService, IEjercicioCommandService commandService)
    {
        _queryService = queryService;
        _commandService = commandService;
    }

    // GET api/exercises (Operación de Lectura)
    [HttpGet]
    public async Task<ActionResult<IEnumerable<EjercicioDto>>> GetAll(
        [FromQuery] string? grupoMuscular = null,
        [FromQuery] string? equipamiento = null,
        [FromQuery] string? buscar = null)
    {
        var list = await _queryService.GetAllAsync(grupoMuscular, equipamiento, buscar);
        return Ok(list);
    }

    // GET api/exercises/5 (Operación de Lectura)
    [HttpGet("{id}")]
    public async Task<ActionResult<EjercicioDto>> GetById(int id)
    {
        var e = await _queryService.GetByIdAsync(id);
        if (e == null) return NotFound();
        return Ok(e);
    }

    // POST api/exercises (Operación de Escritura)
    [Authorize]
    [HttpPost]
    public async Task<ActionResult<EjercicioDto>> Create(EjercicioGuardarDto dto)
    {
        var resultado = await _commandService.CreateAsync(dto);
        return CreatedAtAction(nameof(GetById), new { id = resultado.IdEjercicio }, resultado);
    }

    // PUT api/exercises/5 (Operación de Escritura)
    [Authorize]
    [HttpPut("{id}")]
    public async Task<IActionResult> Update(int id, EjercicioGuardarDto dto)
    {
        var success = await _commandService.UpdateAsync(id, dto);
        if (!success) return NotFound();
        return NoContent();
    }

    // DELETE api/exercises/5 (Operación de Escritura)
    [Authorize]
    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(int id)
    {
        var (success, error) = await _commandService.DeleteAsync(id);
        if (!success)
        {
            if (error == "Ejercicio no encontrado") return NotFound();
            return Conflict(new { mensaje = error });
        }
        return NoContent();
    }
}
