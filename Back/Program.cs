using System.Text;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi;
using MiProyectoApi.Models;
using MiProyectoApi.Services;
using MiProyectoApi.Services.Commands;
using MiProyectoApi.Services.Queries;
using Scalar.AspNetCore;

var builder = WebApplication.CreateBuilder(args);

// Configurar CORS para permitir comunicación con frontend (Expo Web, Móvil, Emulador)
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAll", policy =>
    {
        policy.AllowAnyOrigin()
              .AllowAnyMethod()
              .AllowAnyHeader();
    });
});

builder.Services.AddControllers();

// OpenAPI con botón "Authorize" (Bearer JWT)
builder.Services.AddOpenApi(options =>
{
    options.OpenApiVersion = OpenApiSpecVersion.OpenApi3_0;

    options.AddDocumentTransformer((document, context, ct) =>
    {
        document.Components ??= new OpenApiComponents();
        document.Components.SecuritySchemes ??= new Dictionary<string, IOpenApiSecurityScheme>();
        document.Components.SecuritySchemes["Bearer"] = new OpenApiSecurityScheme
        {
            Type = SecuritySchemeType.Http,
            Scheme = "bearer",
            BearerFormat = "JWT"
        };
        document.Security =
        [
            new OpenApiSecurityRequirement
            {
                [new OpenApiSecuritySchemeReference("Bearer", document)] = []
            }
        ];
        return Task.CompletedTask;
    });
});

// Conexión a SQL Server
builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseSqlServer(builder.Configuration.GetConnectionString("DefaultConnection")));

// Inyección de Dependencias: Separación de Consultas (Lectura) y Comandos (Escritura)
builder.Services.AddScoped<TokenService>();

// Servicios de Consulta (Lectura)
builder.Services.AddScoped<IEjercicioQueryService, EjercicioQueryService>();
builder.Services.AddScoped<IRutinaQueryService, RutinaQueryService>();
builder.Services.AddScoped<IEntrenamientoQueryService, EntrenamientoQueryService>();
builder.Services.AddScoped<IEstadisticaQueryService, EstadisticaQueryService>();
builder.Services.AddScoped<IUsuarioQueryService, UsuarioQueryService>();

// Servicios de Comando (Escritura)
builder.Services.AddScoped<IEjercicioCommandService, EjercicioCommandService>();
builder.Services.AddScoped<IRutinaCommandService, RutinaCommandService>();
builder.Services.AddScoped<IEntrenamientoCommandService, EntrenamientoCommandService>();
builder.Services.AddScoped<IUsuarioCommandService, UsuarioCommandService>();

// Autenticación JWT
builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(o => o.TokenValidationParameters = new TokenValidationParameters
    {
        ValidateIssuer = true,
        ValidateAudience = true,
        ValidateLifetime = true,
        ValidateIssuerSigningKey = true,
        ValidIssuer = builder.Configuration["Jwt:Issuer"],
        ValidAudience = builder.Configuration["Jwt:Audience"],
        IssuerSigningKey = new SymmetricSecurityKey(
            Encoding.UTF8.GetBytes(builder.Configuration["Jwt:Key"]!))
    });
builder.Services.AddAuthorization();

var app = builder.Build();

// Habilitar CORS antes del routing y autenticación
app.UseCors("AllowAll");

if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
    app.MapScalarApiReference();
    app.UseSwaggerUI(options =>
    {
        options.SwaggerEndpoint("/openapi/v1.json", "FitTrack API v1");
    });
}
else
{
    app.UseHttpsRedirection();
}

app.UseStaticFiles();
app.UseAuthentication();
app.UseAuthorization();
app.MapControllers();

app.Run();
