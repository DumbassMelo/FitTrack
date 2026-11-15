using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using MiProyectoApi.Dtos;
using MiProyectoApi.Services.Queries;

namespace MiProyectoApi.Controllers;

[ApiController]
[Authorize]
[Route("api/statistics")]
public class StatisticsController : ControllerBase
{
    private readonly IEstadisticaQueryService _queryService;

    public StatisticsController(IEstadisticaQueryService queryService)
    {
        _queryService = queryService;
    }

    private int UserId => int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);

    // GET api/statistics/progress (Operación de Lectura)
    [HttpGet("progress")]
    public async Task<IActionResult> Progress()
    {
        var progreso = await _queryService.GetGeneralProgressAsync(UserId);
        return Ok(progreso);
    }

    // GET api/statistics/exercise/{id} (Operación de Lectura)
    [HttpGet("exercise/{id}")]
    public async Task<IActionResult> ExerciseProgress(int id)
    {
        var progreso = await _queryService.GetExerciseProgressAsync(id, UserId);
        if (progreso is null) return NotFound();
        return Ok(progreso);
    }
}
