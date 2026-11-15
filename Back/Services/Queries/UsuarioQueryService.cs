using Microsoft.EntityFrameworkCore;
using MiProyectoApi.Dtos;
using MiProyectoApi.Models;

namespace MiProyectoApi.Services.Queries;

public class UsuarioQueryService : IUsuarioQueryService
{
    private readonly AppDbContext _db;

    public UsuarioQueryService(AppDbContext db)
    {
        _db = db;
    }

    public async Task<PerfilDto?> GetProfileAsync(int userId)
    {
        var u = await _db.Usuarios.AsNoTracking().FirstOrDefaultAsync(x => x.IdUsuario == userId);
        if (u is null) return null;
        return new PerfilDto(u.IdUsuario, u.Nombre, u.Correo, u.FechaRegistro);
    }
}
