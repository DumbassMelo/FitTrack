using Microsoft.EntityFrameworkCore;
using MiProyectoApi.Dtos;
using MiProyectoApi.Models;

namespace MiProyectoApi.Services.Queries;

public class EstadisticaQueryService : IEstadisticaQueryService
{
    private readonly AppDbContext _db;

    public EstadisticaQueryService(AppDbContext db)
    {
        _db = db;
    }

    private record FilaSerie(
        int IdEntrenamiento, DateTime? Fecha, int IdEjercicio,
        string Nombre, string GrupoMuscular, decimal? Peso, int? Rep);

    private async Task<List<FilaSerie>> SeriesDelUsuarioAsync(int userId, int? idEjercicio = null)
    {
        var entrenos = await _db.Entrenamientos
            .AsNoTracking()
            .Where(e => e.IdUsuario == userId)
            .Select(e => new { e.IdEntrenamiento, Fecha = (DateTime?)e.Fecha })
            .ToListAsync();

        var idsEntreno = entrenos.Select(e => e.IdEntrenamiento).ToList();
        var fechas = entrenos.ToDictionary(e => e.IdEntrenamiento, e => e.Fecha);

        var consulta = _db.Series.AsNoTracking().Where(s => idsEntreno.Contains(s.IdEntrenamiento));
        if (idEjercicio is not null)
            consulta = consulta.Where(s => s.IdEjercicio == idEjercicio);

        var series = await consulta
            .Select(s => new
            {
                s.IdEntrenamiento,
                s.IdEjercicio,
                Peso = (decimal?)s.Peso,
                Rep = (int?)s.Repeticiones
            })
            .ToListAsync();

        var ejercicios = await _db.Ejercicios.AsNoTracking().ToDictionaryAsync(e => e.IdEjercicio);

        return series.Select(s => new FilaSerie(
            s.IdEntrenamiento,
            fechas[s.IdEntrenamiento],
            s.IdEjercicio,
            ejercicios.TryGetValue(s.IdEjercicio, out var ej) ? ej.Nombre : "Desconocido",
            ejercicios.TryGetValue(s.IdEjercicio, out var ej2) ? ej2.GrupoMuscular : "General",
            s.Peso,
            s.Rep)).ToList();
    }

    public async Task<ProgresoGeneralDto> GetGeneralProgressAsync(int userId)
    {
        var datos = await SeriesDelUsuarioAsync(userId);

        var totalEntrenos = await _db.Entrenamientos.AsNoTracking().CountAsync(e => e.IdUsuario == userId);
        var ultimo = await _db.Entrenamientos
            .AsNoTracking()
            .Where(e => e.IdUsuario == userId)
            .MaxAsync(e => (DateTime?)e.Fecha);

        var porEntreno = datos
            .GroupBy(d => new { d.IdEntrenamiento, d.Fecha })
            .OrderBy(g => g.Key.Fecha)
            .Select(g => new VolumenEntrenamientoDto(
                g.Key.IdEntrenamiento, g.Key.Fecha,
                g.Sum(x => (x.Peso ?? 0) * (x.Rep ?? 0))))
            .ToList();

        var masUsados = datos
            .GroupBy(d => new { d.IdEjercicio, d.Nombre })
            .OrderByDescending(g => g.Count())
            .Take(5)
            .Select(g => new EjercicioFrecuenteDto(g.Key.IdEjercicio, g.Key.Nombre, g.Count()))
            .ToList();

        return new ProgresoGeneralDto(
            totalEntrenos,
            datos.Count,
            datos.Sum(x => (x.Peso ?? 0) * (x.Rep ?? 0)),
            datos.Count == 0 ? 0 : datos.Max(x => x.Peso ?? 0),
            ultimo,
            porEntreno,
            masUsados);
    }

    public async Task<ProgresoEjercicioDto?> GetExerciseProgressAsync(int idEjercicio, int userId)
    {
        var ejercicio = await _db.Ejercicios.AsNoTracking().FirstOrDefaultAsync(e => e.IdEjercicio == idEjercicio);
        if (ejercicio is null) return null;

        var datos = await SeriesDelUsuarioAsync(userId, idEjercicio);

        var evolucion = datos
            .GroupBy(d => new { d.IdEntrenamiento, d.Fecha })
            .OrderBy(g => g.Key.Fecha)
            .Select(g => new PuntoProgresoDto(
                g.Key.IdEntrenamiento,
                g.Key.Fecha,
                g.Max(x => x.Peso ?? 0),
                g.Sum(x => x.Rep ?? 0),
                g.Sum(x => (x.Peso ?? 0) * (x.Rep ?? 0))))
            .ToList();

        return new ProgresoEjercicioDto(
            ejercicio.IdEjercicio,
            ejercicio.Nombre,
            ejercicio.GrupoMuscular,
            datos.Count,
            datos.Count == 0 ? 0 : datos.Max(x => x.Peso ?? 0),
            datos.Count == 0 ? 0 : datos.Max(x => x.Rep ?? 0),
            datos.Sum(x => (x.Peso ?? 0) * (x.Rep ?? 0)),
            evolucion);
    }
}
