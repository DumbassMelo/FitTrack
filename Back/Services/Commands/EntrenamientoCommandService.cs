using Microsoft.EntityFrameworkCore;
using MiProyectoApi.Dtos;
using MiProyectoApi.Models;

namespace MiProyectoApi.Services.Commands;

public class EntrenamientoCommandService : IEntrenamientoCommandService
{
    private readonly AppDbContext _db;

    public EntrenamientoCommandService(AppDbContext db)
    {
        _db = db;
    }

    public async Task<(bool Success, WorkoutOutDto? Result, string? ErrorMessage)> CreateAsync(int userId, WorkoutCreateDto dto)
    {
        if (dto.IdRutina is not null)
        {
            var esSuya = await _db.Rutinas
                .AnyAsync(r => r.IdRutina == dto.IdRutina && r.IdUsuario == userId);
            if (!esSuya)
                return (false, null, "La rutina no existe o no te pertenece");
        }

        var idsEj = dto.Series.Select(s => s.IdEjercicio).Distinct().ToList();
        var existentes = await _db.Ejercicios.CountAsync(x => idsEj.Contains(x.IdEjercicio));
        if (existentes != idsEj.Count)
            return (false, null, "Alguno de los ejercicios no existe");

        var e = new Entrenamiento
        {
            IdUsuario = userId,
            IdRutina = dto.IdRutina,
            Nombre = dto.Nombre,
            Fecha = dto.Fecha ?? DateTime.Now,
            Series = dto.Series.Select(s => new Serie
            {
                IdEjercicio = s.IdEjercicio,
                NumeroSerie = s.NumeroSerie,
                Peso = s.Peso,
                Repeticiones = s.Repeticiones
            }).ToList()
        };

        _db.Entrenamientos.Add(e);
        await _db.SaveChangesAsync();

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

        var salida = new WorkoutOutDto(
            e.IdEntrenamiento, e.IdRutina, e.Nombre, e.Fecha, volumen,
            series.Select(s => new SerieOutDto(
                s.IdSerie, s.IdEjercicio, s.Nombre, s.NumeroSerie, s.Peso, s.Rep)).ToList());

        return (true, salida, null);
    }

    public async Task<bool> DeleteAsync(int id, int userId)
    {
        var e = await _db.Entrenamientos
            .FirstOrDefaultAsync(x => x.IdEntrenamiento == id && x.IdUsuario == userId);
        if (e is null) return false;

        await _db.Series.Where(s => s.IdEntrenamiento == id).ExecuteDeleteAsync();
        _db.Entrenamientos.Remove(e);
        await _db.SaveChangesAsync();
        return true;
    }
}
