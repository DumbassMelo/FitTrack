using MiProyectoApi.Dtos;

namespace MiProyectoApi.Services.Queries;

public interface IEstadisticaQueryService
{
    Task<ProgresoGeneralDto> GetGeneralProgressAsync(int userId);
    Task<ProgresoEjercicioDto?> GetExerciseProgressAsync(int idEjercicio, int userId);
}
