CREATE DATABASE XClone;
GO
USE XCLONE;
GO

-- ====================================================

CREATE TABLE Country (
    Id INT IDENTITY(1,1) PRIMARY KEY,
    Nombre NVARCHAR(100) NOT NULL
);
GO

CREATE TABLE City (
    Id INT IDENTITY(1,1) PRIMARY KEY,
    Nombre NVARCHAR(100) NOT NULL,
    PaisId INT NOT NULL,
    CONSTRAINT FK_City_Country FOREIGN KEY (PaisId) REFERENCES Country(Id)
);
GO

CREATE TABLE Timezone (
    Id INT IDENTITY(1,1) PRIMARY KEY,
    Nombre NVARCHAR(100) NOT NULL,
    Continente NVARCHAR(50) NOT NULL,
    DiferenciaUTF NVARCHAR(10) NOT NULL 
);
GO

-- ====================================================

CREATE TABLE [User] (
    Id INT IDENTITY(1,1) PRIMARY KEY,
    NombreUsuario NVARCHAR(50) NOT NULL UNIQUE,
    ZonaHorariaId INT NULL,
    CiudadId INT NULL,
    CONSTRAINT FK_User_Timezone FOREIGN KEY (ZonaHorariaId) REFERENCES Timezone(Id),
    CONSTRAINT FK_User_City FOREIGN KEY (CiudadId) REFERENCES City(Id)
);
GO

-- ====================================================

CREATE TABLE Community (
    Id INT IDENTITY(1,1) PRIMARY KEY,
    Nombre NVARCHAR(100) NOT NULL,
    Descripcion NVARCHAR(255) NULL,
    CreadorId INT NOT NULL,
    CONSTRAINT FK_Community_User FOREIGN KEY (CreadorId) REFERENCES [User](Id)
);
GO

CREATE TABLE CommunityMember (
    Id INT IDENTITY(1,1) PRIMARY KEY,
    ComunidadId INT NOT NULL,
    UsuarioId INT NOT NULL,
    CONSTRAINT FK_CommunityMember_Community FOREIGN KEY (ComunidadId) REFERENCES Community(Id),
    CONSTRAINT FK_CommunityMember_User FOREIGN KEY (UsuarioId) REFERENCES [User](Id),
    CONSTRAINT UQ_CommunityMember UNIQUE (ComunidadId, UsuarioId)
);
GO

-- ====================================================

CREATE TABLE Post (
    Id INT IDENTITY(1,1) PRIMARY KEY,
    Texto NVARCHAR(MAX) NULL,
    AutorId INT NOT NULL,
    RepostId INT NULL, 
    ComunidadId INT NULL, 
    FechaCreacion DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME(),
    CONSTRAINT FK_Post_Author FOREIGN KEY (AutorId) REFERENCES [User](Id),
    CONSTRAINT FK_Post_Repost FOREIGN KEY (RepostId) REFERENCES Post(Id),
    CONSTRAINT FK_Post_Community FOREIGN KEY (ComunidadId) REFERENCES Community(Id)
);
GO

-- ====================================================

CREATE TABLE Following (
    Id INT IDENTITY(1,1) PRIMARY KEY,
    SeguidorId INT NOT NULL,
    SeguidoId INT NOT NULL,
    CONSTRAINT FK_Following_Follower FOREIGN KEY (SeguidorId) REFERENCES [User](Id),
    CONSTRAINT FK_Following_Following FOREIGN KEY (SeguidoId) REFERENCES [User](Id),
    CONSTRAINT UQ_Following UNIQUE (SeguidorId, SeguidoId),
    CONSTRAINT CHK_NoSelfFollow CHECK (SeguidorId <> SeguidoId)
);
GO

CREATE TABLE Message (
    Id INT IDENTITY(1,1) PRIMARY KEY,
    Texto NVARCHAR(MAX) NOT NULL,
    RemitenteId INT NOT NULL,
    PostId INT NULL, 
    CONSTRAINT FK_Message_Sender FOREIGN KEY (RemitenteId) REFERENCES [User](Id),
    CONSTRAINT FK_Message_Post FOREIGN KEY (PostId) REFERENCES Post(Id)
);
GO

CREATE TABLE Reply (
    Id INT IDENTITY(1,1) PRIMARY KEY,
    PostId INT NOT NULL,
    Texto NVARCHAR(MAX) NOT NULL,
    AutorId INT NOT NULL,
    CONSTRAINT FK_Reply_Post FOREIGN KEY (PostId) REFERENCES Post(Id),
    CONSTRAINT FK_Reply_Author FOREIGN KEY (AutorId) REFERENCES [User](Id)
);
GO

CREATE TABLE [Like] (
    Id INT IDENTITY(1,1) PRIMARY KEY,
    PostId INT NOT NULL,
    UsuarioId INT NOT NULL,
    FechaCreacion DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME(),
    CONSTRAINT FK_Like_Post FOREIGN KEY (PostId) REFERENCES Post(Id),
    CONSTRAINT FK_Like_User FOREIGN KEY (UsuarioId) REFERENCES [User](Id),
    CONSTRAINT UQ_Like UNIQUE (PostId, UsuarioId)
);

CREATE TABLE Repost (
    Id INT IDENTITY(1,1) PRIMARY KEY,
    PostOriginalId INT NOT NULL, 
    NuevoPostId INT NOT NULL,     
    CONSTRAINT FK_Repost_Original FOREIGN KEY (PostOriginalId) REFERENCES Post(Id),
    CONSTRAINT FK_Repost_New FOREIGN KEY (NuevoPostId) REFERENCES Post(Id)
);
GO

-- ====================================================

CREATE TABLE Hashtag (
    Id INT IDENTITY(1,1) PRIMARY KEY,
    Texto NVARCHAR(100) NOT NULL UNIQUE
);
GO

CREATE TABLE PostHashtag (
    Id INT IDENTITY(1,1) PRIMARY KEY,
    PostId INT NOT NULL,
    HashtagId INT NOT NULL,
    CONSTRAINT FK_PostHashtag_Post FOREIGN KEY (PostId) REFERENCES Post(Id),
    CONSTRAINT FK_PostHashtag_Hashtag FOREIGN KEY (HashtagId) REFERENCES Hashtag(Id),
    CONSTRAINT UQ_PostHashtag UNIQUE (PostId, HashtagId)
);
GO