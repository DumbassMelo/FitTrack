using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using MiProyectoApi.Dtos;
using MiProyectoApi.Models;

namespace MiProyectoApi.Services.Commands;

public class EjercicioCommandService : IEjercicioCommandService
{
    private readonly AppDbContext _context;
    private readonly IConfiguration _configuration;

    public EjercicioCommandService(AppDbContext context, IConfiguration configuration)
    {
        _context = context;
        _configuration = configuration;
    }

    public async Task<EjercicioDto> CreateAsync(EjercicioGuardarDto dto)
    {
        var e = new Ejercicio
        {
            Nombre = dto.Nombre,
            Descripcion = dto.Descripcion,
            GrupoMuscular = dto.GrupoMuscular,
            MusculoPrincipal = dto.MusculoPrincipal,
            MusculosSecundarios = string.Join(", ", dto.MusculosSecundarios),
            Slug = dto.Slug,
            Equipamiento = dto.Equipamiento,
            TipoEjercicio = dto.TipoEjercicio,
            EsEstiramiento = dto.EsEstiramiento
        };

        _context.Ejercicios.Add(e);
        await _context.SaveChangesAsync();

        var baseAssetUrl = _configuration["WorkoutGuide:BaseAssetUrl"]?.TrimEnd('/')
            ?? "https://raw.githubusercontent.com/bryllim/workout-guide/aac599224bb9780305239607ef98540b7e0ce389/packages/workout-guide/assets";

        var fotogramas = new List<string>();
        if (!string.IsNullOrWhiteSpace(e.Slug))
        {
            fotogramas.Add($"{baseAssetUrl}/{e.Slug}/frame-1.svg");
            fotogramas.Add($"{baseAssetUrl}/{e.Slug}/frame-2.svg");
            fotogramas.Add($"{baseAssetUrl}/{e.Slug}/frame-3.svg");
        }

        return new EjercicioDto
        {
            IdEjercicio = e.IdEjercicio,
            Nombre = e.Nombre,
            Descripcion = e.Descripcion,
            GrupoMuscular = e.GrupoMuscular,
            MusculoPrincipal = e.MusculoPrincipal,
            MusculosSecundarios = dto.MusculosSecundarios,
            Slug = e.Slug,
            Equipamiento = e.Equipamiento,
            TipoEjercicio = e.TipoEjercicio,
            EsEstiramiento = e.EsEstiramiento,
            FotogramasSvg = fotogramas
        };
    }

    public async Task<bool> UpdateAsync(int id, EjercicioGuardarDto dto)
    {
        var e = await _context.Ejercicios.FindAsync(id);
        if (e == null) return false;

        e.Nombre = dto.Nombre;
        e.Descripcion = dto.Descripcion;
        e.GrupoMuscular = dto.GrupoMuscular;
        e.MusculoPrincipal = dto.MusculoPrincipal;
        e.MusculosSecundarios = string.Join(", ", dto.MusculosSecundarios);
        e.Slug = dto.Slug;
        e.Equipamiento = dto.Equipamiento;
        e.TipoEjercicio = dto.TipoEjercicio;
        e.EsEstiramiento = dto.EsEstiramiento;

        await _context.SaveChangesAsync();
        return true;
    }

    public async Task<(bool Success, string? ErrorMessage)> DeleteAsync(int id)
    {
        var e = await _context.Ejercicios.FindAsync(id);
        if (e == null) return (false, "Ejercicio no encontrado");

        bool enUso = await _context.RutinaEjercicios.AnyAsync(r => r.IdEjercicio == id)
                  || await _context.Series.AnyAsync(s => s.IdEjercicio == id);
        if (enUso)
            return (false, "El ejercicio está en uso en rutinas o entrenamientos.");

        _context.Ejercicios.Remove(e);
        await _context.SaveChangesAsync();
        return (true, null);
    }
}
