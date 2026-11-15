using System.ComponentModel.DataAnnotations;

namespace MiProyectoApi.Dtos;

// Lo que la API devuelve
public class EjercicioDto
{
    public int IdEjercicio { get; set; }
    public string Nombre { get; set; } = null!;
    public string? Descripcion { get; set; }
    public string GrupoMuscular { get; set; } = null!;
    public string? MusculoPrincipal { get; set; }
    public List<string> MusculosSecundarios { get; set; } = new();
    public string? Slug { get; set; }
    public string? Equipamiento { get; set; }
    public string? TipoEjercicio { get; set; }
    public bool EsEstiramiento { get; set; }
    public List<string> FotogramasSvg { get; set; } = new();
}

// Lo que la API recibe al crear o actualizar
public class EjercicioGuardarDto
{
    [Required, StringLength(100)]
    public string Nombre { get; set; } = null!;

    [StringLength(500)]
    public string? Descripcion { get; set; }

    [Required, StringLength(50)]
    public string GrupoMuscular { get; set; } = null!;

    [StringLength(50)]
    public string? MusculoPrincipal { get; set; }

    public List<string> MusculosSecundarios { get; set; } = new();

    [StringLength(100)]
    public string? Slug { get; set; }

    [StringLength(50)]
    public string? Equipamiento { get; set; }

    [StringLength(50)]
    public string? TipoEjercicio { get; set; }

    public bool EsEstiramiento { get; set; } = false;
}