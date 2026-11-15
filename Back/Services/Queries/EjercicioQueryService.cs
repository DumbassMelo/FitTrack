using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using MiProyectoApi.Dtos;
using MiProyectoApi.Models;
using System;

namespace MiProyectoApi.Services.Queries;

public class EjercicioQueryService : IEjercicioQueryService
{
    private readonly AppDbContext _context;
    private readonly IConfiguration _configuration;

    public EjercicioQueryService(AppDbContext context, IConfiguration configuration)
    {
        _context = context;
        _configuration = configuration;
    }

    public async Task<IEnumerable<EjercicioDto>> GetAllAsync(string? grupoMuscular = null, string? equipamiento = null, string? buscar = null)
    {
        var query = _context.Ejercicios.AsNoTracking().AsQueryable();

        if (!string.IsNullOrWhiteSpace(grupoMuscular))
            query = query.Where(e => e.GrupoMuscular == grupoMuscular);

        if (!string.IsNullOrWhiteSpace(equipamiento))
            query = query.Where(e => e.Equipamiento == equipamiento);

        if (!string.IsNullOrWhiteSpace(buscar))
            query = query.Where(e =>
                e.Nombre.Contains(buscar)
                || (e.Descripcion != null && e.Descripcion.Contains(buscar))
                || (e.MusculoPrincipal != null && e.MusculoPrincipal.Contains(buscar))
                || (e.MusculosSecundarios != null && e.MusculosSecundarios.Contains(buscar))
                || (e.Equipamiento != null && e.Equipamiento.Contains(buscar)));

        var list = await query.ToListAsync();
        return list.Select(MapearDto);
    }

    public async Task<EjercicioDto?> GetByIdAsync(int id)
    {
        var e = await _context.Ejercicios.AsNoTracking().FirstOrDefaultAsync(x => x.IdEjercicio == id);
        return e == null ? null : MapearDto(e);
    }

    private EjercicioDto MapearDto(Ejercicio e)
    {
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
            MusculosSecundarios = string.IsNullOrWhiteSpace(e.MusculosSecundarios)
                ? new List<string>()
                : e.MusculosSecundarios.Split(", ", StringSplitOptions.RemoveEmptyEntries).ToList(),
            Slug = e.Slug,
            Equipamiento = e.Equipamiento,
            TipoEjercicio = e.TipoEjercicio,
            EsEstiramiento = e.EsEstiramiento,
            FotogramasSvg = fotogramas
        };
    }
}
