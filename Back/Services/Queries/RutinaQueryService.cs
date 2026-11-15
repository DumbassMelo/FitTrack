using Microsoft.EntityFrameworkCore;
using MiProyectoApi.Dtos;
using MiProyectoApi.Models;

namespace MiProyectoApi.Services.Queries;

public class RutinaQueryService : IRutinaQueryService
{
    private readonly AppDbContext _db;

    public RutinaQueryService(AppDbContext db)
    {
        _db = db;
    }

    public async Task<List<RutinaOutDto>> GetAllByUserAsync(int userId)
    {
        var rutinas = await _db.Rutinas
            .AsNoTracking()
            .Where(r => r.IdUsuario == userId)
            .OrderByDescending(r => r.FechaCreacion)
            .ToListAsync();

        var resultado = new List<RutinaOutDto>();
        foreach (var r in rutinas)
        {
            resultado.Add(new RutinaOutDto(
                r.IdRutina, r.Nombre, r.Descripcion, r.FechaCreacion,
                await EjerciciosDeAsync(r.IdRutina)));
        }
        return resultado;
    }

    public async Task<RutinaOutDto?> GetByIdAsync(int id, int userId)
    {
        var r = await _db.Rutinas
            .AsNoTracking()
            .FirstOrDefaultAsync(x => x.IdRutina == id && x.IdUsuario == userId);
        if (r is null) return null;

        return new RutinaOutDto(
            r.IdRutina, r.Nombre, r.Descripcion, r.FechaCreacion,
            await EjerciciosDeAsync(r.IdRutina));
    }

    public async Task<RutinaOutDto?> GetRecentByUserAsync(int userId)
    {
        // 1. Check most recent workout with routine
        var lastWorkout = await _db.Entrenamientos
            .AsNoTracking()
            .Where(e => e.IdUsuario == userId && e.IdRutina != null)
            .OrderByDescending(e => e.Fecha)
            .FirstOrDefaultAsync();

        if (lastWorkout?.IdRutina != null)
        {
            var r = await GetByIdAsync(lastWorkout.IdRutina.Value, userId);
            if (r != null) return r;
        }

        // 2. Fallback to newest routine created by user
        var newestRoutine = await _db.Rutinas
            .AsNoTracking()
            .Where(r => r.IdUsuario == userId)
            .OrderByDescending(r => r.FechaCreacion)
            .FirstOrDefaultAsync();

        if (newestRoutine != null)
        {
            return new RutinaOutDto(
                newestRoutine.IdRutina,
                newestRoutine.Nombre,
                newestRoutine.Descripcion,
                newestRoutine.FechaCreacion,
                await EjerciciosDeAsync(newestRoutine.IdRutina));
        }

        return null;
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
}
