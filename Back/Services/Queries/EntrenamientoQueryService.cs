using Microsoft.EntityFrameworkCore;
using MiProyectoApi.Dtos;
using MiProyectoApi.Models;

namespace MiProyectoApi.Services.Queries;

public class EntrenamientoQueryService : IEntrenamientoQueryService
{
    private readonly AppDbContext _db;

    public EntrenamientoQueryService(AppDbContext db)
    {
        _db = db;
    }

    public async Task<IEnumerable<WorkoutResumenDto>> GetAllByUserAsync(int userId)
    {
        var entrenos = await _db.Entrenamientos
            .AsNoTracking()
            .Where(e => e.IdUsuario == userId)
            .OrderByDescending(e => e.Fecha)
            .Select(e => new { e.IdEntrenamiento, e.IdRutina, e.Nombre, Fecha = (DateTime?)e.Fecha })
            .ToListAsync();

        var ids = entrenos.Select(e => e.IdEntrenamiento).ToList();

        var series = await _db.Series
            .AsNoTracking()
            .Where(s => ids.Contains(s.IdEntrenamiento))
            .Select(s => new
            {
                s.IdEntrenamiento,
                Peso = (decimal?)s.Peso,
                Rep = (int?)s.Repeticiones
            })
            .ToListAsync();

        return entrenos.Select(e =>
        {
            var propias = series.Where(s => s.IdEntrenamiento == e.IdEntrenamiento).ToList();
            var volumen = propias.Sum(s => (s.Peso ?? 0) * (s.Rep ?? 0));
            return new WorkoutResumenDto(
                e.IdEntrenamiento, e.IdRutina, e.Nombre, e.Fecha, propias.Count, volumen);
        });
    }

    public async Task<WorkoutOutDto?> GetByIdAsync(int id, int userId)
    {
        var e = await _db.Entrenamientos
            .AsNoTracking()
            .FirstOrDefaultAsync(x => x.IdEntrenamiento == id && x.IdUsuario == userId);
        if (e is null) return null;

        var series = await (from s in _db.Series.AsNoTracking()
                            join ej in _db.Ejercicios.AsNoTracking() on s.IdEjercicio equals ej.IdEjercicio
                            where s.IdEntrenamiento == e.IdEntrenamiento
                            orderby s.IdEjercicio, s.NumeroSerie
                            select new
                            {
                                s.IdSerie,
                                s.IdEjercicio,
                                ej.Nombre,
                                NumeroSerie = (int?)s.NumeroSerie,
                                Peso = (decimal?)s.Peso,
                                Rep = (int?)s.Repeticiones
                            }).ToListAsync();

        var volumen = series.Sum(s => (s.Peso ?? 0) * (s.Rep ?? 0));

        return new WorkoutOutDto(
            e.IdEntrenamiento, e.IdRutina, e.Nombre, e.Fecha, volumen,
            series.Select(s => new SerieOutDto(
                s.IdSerie, s.IdEjercicio, s.Nombre, s.NumeroSerie, s.Peso, s.Rep)).ToList());
    }
}
