using MiProyectoApi.Dtos;

namespace MiProyectoApi.Services.Queries;

public interface IUsuarioQueryService
{
    Task<PerfilDto?> GetProfileAsync(int userId);
}
