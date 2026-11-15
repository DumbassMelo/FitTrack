-- =====================================================================
-- FITTRACK - SCRIPT DDL Y DML UNIFICADO DE BASE DE DATOS
-- Base de datos: SQL Server (MiProyectoDb)
-- =====================================================================

IF DB_ID('MiProyectoDb') IS NULL
BEGIN
    CREATE DATABASE MiProyectoDb;
END
GO

USE MiProyectoDb;
GO

-- ---------------------------------------------------------------------
-- 1. TABLA: Usuario
-- ---------------------------------------------------------------------
IF OBJECT_ID('dbo.Usuario', 'U') IS NULL
BEGIN
    CREATE TABLE dbo.Usuario (
        IdUsuario      INT IDENTITY(1,1) PRIMARY KEY,
        Nombre         NVARCHAR(100) NOT NULL,
        Correo         NVARCHAR(150) NOT NULL UNIQUE,
        PasswordHash   NVARCHAR(255) NOT NULL,
        FechaRegistro  DATETIME NOT NULL CONSTRAINT DF_Usuario_FechaRegistro DEFAULT GETDATE()
    );
END
GO

-- ---------------------------------------------------------------------
-- 2. TABLA: Ejercicio (Creación base y migración de columnas)
-- ---------------------------------------------------------------------
IF OBJECT_ID('dbo.Ejercicio', 'U') IS NULL
BEGIN
    CREATE TABLE dbo.Ejercicio (
        IdEjercicio    INT IDENTITY(1,1) PRIMARY KEY,
        Nombre         NVARCHAR(100) NOT NULL,
        Descripcion    NVARCHAR(500) NULL,
        GrupoMuscular  NVARCHAR(50)  NOT NULL,
        MusculoPrincipal NVARCHAR(50) NULL,
        MusculosSecundarios NVARCHAR(500) NULL,
        Slug           NVARCHAR(100) NULL,
        Equipamiento   NVARCHAR(50)  NULL,
        TipoEjercicio  NVARCHAR(50)  NULL,
        EsEstiramiento BIT NOT NULL CONSTRAINT DF_Ejercicio_EsEstiramiento DEFAULT 0
    );
END
GO

-- Si la tabla ya existía de una versión anterior, se agregan las columnas faltantes vía EXEC
-- para evitar errores de compilación previa en SSMS:
IF COL_LENGTH('dbo.Ejercicio', 'Slug') IS NULL
    EXEC('ALTER TABLE dbo.Ejercicio ADD Slug NVARCHAR(100) NULL;');
GO

IF COL_LENGTH('dbo.Ejercicio', 'MusculoPrincipal') IS NULL
    EXEC('ALTER TABLE dbo.Ejercicio ADD MusculoPrincipal NVARCHAR(50) NULL;');
GO

IF COL_LENGTH('dbo.Ejercicio', 'MusculosSecundarios') IS NULL
    EXEC('ALTER TABLE dbo.Ejercicio ADD MusculosSecundarios NVARCHAR(500) NULL;');
GO

IF COL_LENGTH('dbo.Ejercicio', 'Equipamiento') IS NULL
    EXEC('ALTER TABLE dbo.Ejercicio ADD Equipamiento NVARCHAR(50) NULL;');
GO

IF COL_LENGTH('dbo.Ejercicio', 'TipoEjercicio') IS NULL
    EXEC('ALTER TABLE dbo.Ejercicio ADD TipoEjercicio NVARCHAR(50) NULL;');
GO

IF COL_LENGTH('dbo.Ejercicio', 'EsEstiramiento') IS NULL
    EXEC('ALTER TABLE dbo.Ejercicio ADD EsEstiramiento BIT NOT NULL CONSTRAINT DF_Ejercicio_EsEstiramiento DEFAULT 0;');
GO

-- ---------------------------------------------------------------------
-- 3. TABLA: Rutina
-- ---------------------------------------------------------------------
IF OBJECT_ID('dbo.Rutina', 'U') IS NULL
BEGIN
    CREATE TABLE dbo.Rutina (
        IdRutina       INT IDENTITY(1,1) PRIMARY KEY,
        IdUsuario      INT NOT NULL,
        Nombre         NVARCHAR(100) NOT NULL,
        Descripcion    NVARCHAR(500) NULL,
        FechaCreacion  DATETIME NOT NULL CONSTRAINT DF_Rutina_FechaCreacion DEFAULT GETDATE(),
        CONSTRAINT FK_Rutina_Usuario FOREIGN KEY (IdUsuario) 
            REFERENCES dbo.Usuario(IdUsuario) ON DELETE CASCADE
    );
END
GO

-- ---------------------------------------------------------------------
-- 4. TABLA: RutinaEjercicio
-- ---------------------------------------------------------------------
IF OBJECT_ID('dbo.RutinaEjercicio', 'U') IS NULL
BEGIN
    CREATE TABLE dbo.RutinaEjercicio (
        IdRutinaEjercicio INT IDENTITY(1,1) PRIMARY KEY,
        IdRutina          INT NOT NULL,
        IdEjercicio       INT NOT NULL,
        Orden             INT NOT NULL,
        CONSTRAINT FK_RE_Rutina FOREIGN KEY (IdRutina) 
            REFERENCES dbo.Rutina(IdRutina) ON DELETE CASCADE,
        CONSTRAINT FK_RE_Ejercicio FOREIGN KEY (IdEjercicio) 
            REFERENCES dbo.Ejercicio(IdEjercicio)
    );
END
GO

-- ---------------------------------------------------------------------
-- 5. TABLA: Entrenamiento
-- ---------------------------------------------------------------------
IF OBJECT_ID('dbo.Entrenamiento', 'U') IS NULL
BEGIN
    CREATE TABLE dbo.Entrenamiento (
        IdEntrenamiento INT IDENTITY(1,1) PRIMARY KEY,
        IdUsuario       INT NOT NULL,
        IdRutina        INT NULL,
        Fecha           DATETIME NOT NULL CONSTRAINT DF_Ent_Fecha DEFAULT GETDATE(),
        Nombre          NVARCHAR(100) NULL,
        CONSTRAINT FK_Ent_Usuario FOREIGN KEY (IdUsuario) 
            REFERENCES dbo.Usuario(IdUsuario) ON DELETE CASCADE,
        CONSTRAINT FK_Ent_Rutina FOREIGN KEY (IdRutina) 
            REFERENCES dbo.Rutina(IdRutina) ON DELETE NO ACTION
    );
END
GO

-- ---------------------------------------------------------------------
-- 6. TABLA: Serie
-- ---------------------------------------------------------------------
IF OBJECT_ID('dbo.Serie', 'U') IS NULL
BEGIN
    CREATE TABLE dbo.Serie (
        IdSerie         INT IDENTITY(1,1) PRIMARY KEY,
        IdEntrenamiento INT NOT NULL,
        IdEjercicio     INT NOT NULL,
        NumeroSerie     INT NOT NULL,
        Peso            DECIMAL(6,2) NOT NULL,
        Repeticiones    INT NOT NULL,
        CONSTRAINT FK_Serie_Ent FOREIGN KEY (IdEntrenamiento) 
            REFERENCES dbo.Entrenamiento(IdEntrenamiento) ON DELETE CASCADE,
        CONSTRAINT FK_Serie_Eje FOREIGN KEY (IdEjercicio) 
            REFERENCES dbo.Ejercicio(IdEjercicio)
    );
END
GO

-- ---------------------------------------------------------------------
-- TRIGGER: Al eliminar una Rutina, nulifica IdRutina en Entrenamiento
-- (reemplaza ON DELETE SET NULL que SQL Server no permite por ciclo de cascada)
-- ---------------------------------------------------------------------
IF OBJECT_ID('dbo.TR_Rutina_NulificarEntrenamiento', 'TR') IS NOT NULL
    DROP TRIGGER dbo.TR_Rutina_NulificarEntrenamiento;
GO
CREATE TRIGGER dbo.TR_Rutina_NulificarEntrenamiento
ON dbo.Rutina
AFTER DELETE
AS
BEGIN
    SET NOCOUNT ON;
    UPDATE dbo.Entrenamiento
    SET IdRutina = NULL
    WHERE IdRutina IN (SELECT IdRutina FROM deleted);
END
GO

-- ---------------------------------------------------------------------
-- ÍNDICES DE RENDIMIENTO PARA CONSULTAS FRECUENTES
-- ---------------------------------------------------------------------
IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = 'IX_Rutina_IdUsuario' AND object_id = OBJECT_ID('dbo.Rutina'))
    CREATE INDEX IX_Rutina_IdUsuario ON dbo.Rutina(IdUsuario);
GO

IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = 'IX_Entrenamiento_IdUsuario_Fecha' AND object_id = OBJECT_ID('dbo.Entrenamiento'))
    CREATE INDEX IX_Entrenamiento_IdUsuario_Fecha ON dbo.Entrenamiento(IdUsuario, Fecha DESC);
GO

IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = 'IX_Serie_IdEntrenamiento' AND object_id = OBJECT_ID('dbo.Serie'))
    CREATE INDEX IX_Serie_IdEntrenamiento ON dbo.Serie(IdEntrenamiento);
GO

IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = 'IX_Ejercicio_GrupoMuscular' AND object_id = OBJECT_ID('dbo.Ejercicio'))
    CREATE INDEX IX_Ejercicio_GrupoMuscular ON dbo.Ejercicio(GrupoMuscular);
GO

-- ---------------------------------------------------------------------
-- El catalogo sincronizado con Workout Guide se carga en 02_workout_guide_catalog.sql.
-- Elimina el usuario de prueba y sus datos al actualizar una base existente.
DECLARE @IdUsuarioDemo INT =
    (SELECT IdUsuario FROM dbo.Usuario WHERE Correo = 'demo@fittrack.com');

IF @IdUsuarioDemo IS NOT NULL
BEGIN
    DELETE s
    FROM dbo.Serie s
    INNER JOIN dbo.Entrenamiento e ON e.IdEntrenamiento = s.IdEntrenamiento
    WHERE e.IdUsuario = @IdUsuarioDemo;

    DELETE FROM dbo.Entrenamiento WHERE IdUsuario = @IdUsuarioDemo;
    DELETE FROM dbo.Rutina WHERE IdUsuario = @IdUsuarioDemo;
    DELETE FROM dbo.Usuario WHERE IdUsuario = @IdUsuarioDemo;
END
GO

PRINT '=====================================================================';
PRINT 'Base de datos MiProyectoDb inicializada y actualizada correctamente.';
PRINT '=====================================================================';
