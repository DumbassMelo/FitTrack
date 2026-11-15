using Microsoft.EntityFrameworkCore;
using MiProyectoApi.Dtos;
using MiProyectoApi.Models;

namespace MiProyectoApi.Services.Commands;

public class RutinaCommandService : IRutinaCommandService
{
    private readonly AppDbContext _db;

    public RutinaCommandService(AppDbContext db)
    {
        _db = db;
    }

    private async Task<bool> EjerciciosValidosAsync(List<RutinaEjercicioInDto> lista)
    {
        var ids = lista.Select(x => x.IdEjercicio).Distinct().ToList();
        var existentes = await _db.Ejercicios.CountAsync(e => ids.Contains(e.IdEjercicio));
        return existentes == ids.Count;
    }

    private async Task<List<RutinaEjercicioOutDto>> EjerciciosDeAsync(int idRutina)
    {
        var filas = await (from re in _db.RutinaEjercicios.AsNoTracking()
                           join e in _db.Ejercicios.AsNoTracking() on re.IdEjercicio equals e.IdEjercicio
                           where re.IdRutina == idRutina
                           orderby re.Orden
                           select new { e.IdEjercicio, e.Nombre, e.GrupoMuscular, re.Orden })
                          .ToListAsync();

        return filas.Select(f => new RutinaEjercicioOutDto(
            f.IdEjercicio, f.Nombre, f.GrupoMuscular, f.Orden)).ToList();
    }

    public async Task<(bool Success, RutinaOutDto? Result, string? ErrorMessage)> CreateAsync(int userId, RutinaCreateDto dto)
    {
        var lista = dto.Ejercicios ?? new List<RutinaEjercicioInDto>();
        if (!await EjerciciosValidosAsync(lista))
            return (false, null, "Alguno de los ejercicios no existe");

        await using var tx = await _db.Database.BeginTransactionAsync();

        var r = new Rutina
        {
            IdUsuario = userId,
            Nombre = dto.Nombre,
            Descripcion = dto.Descripcion,
            FechaCreacion = DateTime.Now
        };
        _db.Rutinas.Add(r);
        await _db.SaveChangesAsync();

        foreach (var e in lista)
        {
            _db.RutinaEjercicios.Add(new RutinaEjercicio
            {
                IdRutina = r.IdRutina,
                IdEjercicio = e.IdEjercicio,
                Orden = e.Orden
            });
        }
        await _db.SaveChangesAsync();
        await tx.CommitAsync();

        var salida = new RutinaOutDto(
            r.IdRutina, r.Nombre, r.Descripcion, r.FechaCreacion,
            await EjerciciosDeAsync(r.IdRutina));

        return (true, salida, null);
    }

    public async Task<(bool Success, RutinaOutDto? Result, string? ErrorMessage)> UpdateAsync(int id, int userId, RutinaCreateDto dto)
    {
        var r = await _db.Rutinas
            .FirstOrDefaultAsync(x => x.IdRutina == id && x.IdUsuario == userId);
        if (r is null) return (false, null, "Rutina no encontrada");

        var lista = dto.Ejercicios ?? new List<RutinaEjercicioInDto>();
        if (!await EjerciciosValidosAsync(lista))
            return (false, null, "Alguno de los ejercicios no existe");

        await using var tx = await _db.Database.BeginTransactionAsync();

        r.Nombre = dto.Nombre;
        r.Descripcion = dto.Descripcion;

        var anteriores = _db.RutinaEjercicios.Where(x => x.IdRutina == id);
        _db.RutinaEjercicios.RemoveRange(anteriores);

        foreach (var e in lista)
        {
            _db.RutinaEjercicios.Add(new RutinaEjercicio
            {
                IdRutina = id,
                IdEjercicio = e.IdEjercicio,
                Orden = e.Orden
            });
        }
        await _db.SaveChangesAsync();
        await tx.CommitAsync();

        var salida = new RutinaOutDto(
            r.IdRutina, r.Nombre, r.Descripcion, r.FechaCreacion,
            await EjerciciosDeAsync(id));

        return (true, salida, null);
    }

    public async Task<bool> DeleteAsync(int id, int userId)
    {
        var r = await _db.Rutinas
            .FirstOrDefaultAsync(x => x.IdRutina == id && x.IdUsuario == userId);
        if (r is null) return false;

        await _db.Entrenamientos
            .Where(e => e.IdRutina == id)
            .ExecuteUpdateAsync(s => s.SetProperty(e => e.IdRutina, (int?)null));

        _db.Rutinas.Remove(r);
        await _db.SaveChangesAsync();
        return true;
    }
}
