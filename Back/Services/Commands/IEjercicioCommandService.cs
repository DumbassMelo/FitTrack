using MiProyectoApi.Dtos;

namespace MiProyectoApi.Services.Commands;

public interface IEjercicioCommandService
{
    Task<EjercicioDto> CreateAsync(EjercicioGuardarDto dto);
    Task<bool> UpdateAsync(int id, EjercicioGuardarDto dto);
    Task<(bool Success, string? ErrorMessage)> DeleteAsync(int id);
}
