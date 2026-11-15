using Microsoft.EntityFrameworkCore;
using MiProyectoApi.Dtos;
using MiProyectoApi.Models;

namespace MiProyectoApi.Services.Commands;

public class UsuarioCommandService : IUsuarioCommandService
{
    private readonly AppDbContext _db;
    private readonly TokenService _tokens;

    public UsuarioCommandService(AppDbContext db, TokenService tokens)
    {
        _db = db;
        _tokens = tokens;
    }

    public async Task<(bool Success, object? Result, string? ErrorMessage)> RegisterAsync(RegisterDto dto)
    {
        if (await _db.Usuarios.AnyAsync(u => u.Correo == dto.Correo))
            return (false, null, "El correo ya está registrado");

        var u = new Usuario
        {
            Nombre = dto.Nombre,
            Correo = dto.Correo,
            PasswordHash = BCrypt.Net.BCrypt.HashPassword(dto.Password),
            FechaRegistro = DateTime.Now
        };
        _db.Usuarios.Add(u);
        await _db.SaveChangesAsync();

        return (true, new { u.IdUsuario, u.Nombre, u.Correo }, null);
    }

    public async Task<(bool Success, string? Token, string? ErrorMessage)> LoginAsync(LoginDto dto)
    {
        var u = await _db.Usuarios.FirstOrDefaultAsync(x => x.Correo == dto.Correo);
        if (u is null || !BCrypt.Net.BCrypt.Verify(dto.Password, u.PasswordHash))
            return (false, null, "Credenciales inválidas");

        return (true, _tokens.Crear(u), null);
    }

    public async Task<(bool Success, PerfilDto? Result, string? ErrorMessage)> UpdateProfileAsync(int userId, PerfilUpdateDto dto)
    {
        var u = await _db.Usuarios.FindAsync(userId);
        if (u is null) return (false, null, "Usuario no encontrado");

        var correoEnUso = await _db.Usuarios
            .AnyAsync(x => x.Correo == dto.Correo && x.IdUsuario != userId);
        if (correoEnUso)
            return (false, null, "Ese correo ya está en uso");

        u.Nombre = dto.Nombre;
        u.Correo = dto.Correo;
        if (!string.IsNullOrWhiteSpace(dto.NuevaPassword))
            u.PasswordHash = BCrypt.Net.BCrypt.HashPassword(dto.NuevaPassword);

        await _db.SaveChangesAsync();
        return (true, new PerfilDto(u.IdUsuario, u.Nombre, u.Correo, u.FechaRegistro), null);
    }
}
