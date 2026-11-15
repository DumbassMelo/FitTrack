using System;
using System.Collections.Generic;

namespace MiProyectoApi.Models;

public partial class Ejercicio
{
    public int IdEjercicio { get; set; }

    public string Nombre { get; set; } = null!;

    public string? Descripcion { get; set; }

    public string GrupoMuscular { get; set; } = null!;

    public string? MusculoPrincipal { get; set; }

    public string? MusculosSecundarios { get; set; }

    public string? Slug { get; set; }

    public string? Equipamiento { get; set; }

    public string? TipoEjercicio { get; set; }

    public bool EsEstiramiento { get; set; }

    public virtual ICollection<RutinaEjercicio> RutinaEjercicios { get; set; } = new List<RutinaEjercicio>();

    public virtual ICollection<Serie> Series { get; set; } = new List<Serie>();
}
