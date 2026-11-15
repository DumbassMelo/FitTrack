using MiProyectoApi.Dtos;

namespace MiProyectoApi.Services.Commands;

public interface IUsuarioCommandService
{
    Task<(bool Success, object? Result, string? ErrorMessage)> RegisterAsync(RegisterDto dto);
    Task<(bool Success, string? Token, string? ErrorMessage)> LoginAsync(LoginDto dto);
    Task<(bool Success, PerfilDto? Result, string? ErrorMessage)> UpdateProfileAsync(int userId, PerfilUpdateDto dto);
}
