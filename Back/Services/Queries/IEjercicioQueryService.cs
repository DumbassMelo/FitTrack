using MiProyectoApi.Dtos;

namespace MiProyectoApi.Services.Queries;

public interface IEjercicioQueryService
{
    Task<IEnumerable<EjercicioDto>> GetAllAsync(string? grupoMuscular = null, string? equipamiento = null, string? buscar = null);
    Task<EjercicioDto?> GetByIdAsync(int id);
}
