using MiProyectoApi.Dtos;

namespace MiProyectoApi.Services.Queries;

public interface IEntrenamientoQueryService
{
    Task<IEnumerable<WorkoutResumenDto>> GetAllByUserAsync(int userId);
    Task<WorkoutOutDto?> GetByIdAsync(int id, int userId);
}
