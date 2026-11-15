using MiProyectoApi.Dtos;

namespace MiProyectoApi.Services.Commands;

public interface IEntrenamientoCommandService
{
    Task<(bool Success, WorkoutOutDto? Result, string? ErrorMessage)> CreateAsync(int userId, WorkoutCreateDto dto);
    Task<bool> DeleteAsync(int id, int userId);
}
