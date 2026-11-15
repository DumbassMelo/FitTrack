using MiProyectoApi.Dtos;

namespace MiProyectoApi.Services.Queries;

public interface IRutinaQueryService
{
    Task<List<RutinaOutDto>> GetAllByUserAsync(int userId);
    Task<RutinaOutDto?> GetByIdAsync(int id, int userId);
    Task<RutinaOutDto?> GetRecentByUserAsync(int userId);
}
