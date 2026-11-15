using MiProyectoApi.Dtos;

namespace MiProyectoApi.Services.Commands;

public interface IRutinaCommandService
{
    Task<(bool Success, RutinaOutDto? Result, string? ErrorMessage)> CreateAsync(int userId, RutinaCreateDto dto);
    Task<(bool Success, RutinaOutDto? Result, string? ErrorMessage)> UpdateAsync(int id, int userId, RutinaCreateDto dto);
    Task<bool> DeleteAsync(int id, int userId);
}
