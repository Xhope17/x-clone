USE master;
GO

IF NOT EXISTS (SELECT name FROM sys.databases WHERE name = 'XClone')
    CREATE DATABASE XClone;
GO

USE XClone;
GO

-- ====================================================

CREATE TABLE Country (
    Id   UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    Name NVARCHAR(100)    NOT NULL
);
GO

CREATE TABLE City (
    Id        UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    Name      NVARCHAR(100)    NOT NULL,
    CountryId UNIQUEIDENTIFIER NOT NULL,

    CONSTRAINT FK_City_Country FOREIGN KEY (CountryId) REFERENCES Country(Id)
);
GO

CREATE TABLE Timezone (
    Id            UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    Name          NVARCHAR(100)    NOT NULL,
    Continente    NVARCHAR(50)     NOT NULL,
    DiferenciaUTF NVARCHAR(10)     NOT NULL
);
GO

-- ====================================================

CREATE TABLE [User] (
    Id          UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    UserName    NVARCHAR(50)     NOT NULL UNIQUE,
    DisplayName NVARCHAR(100)    NOT NULL,
    Email       NVARCHAR(255)    NOT NULL UNIQUE,
    Password    NVARCHAR(255)    NOT NULL,
    Age         INT              NOT NULL,
    PhoneNumber NVARCHAR(20)     NULL,
    IsVerified  BIT              NOT NULL DEFAULT 0, --FALSE
    --IsPrivate BIT NOT NULL DEFAULT 0, --FALSE deberia ir en otra tabla perfil
    PinnedPostId UNIQUEIDENTIFIER NULL, --deberia ir en otra tabla perfil
    TimezoneId  UNIQUEIDENTIFIER NULL,
    CityId      UNIQUEIDENTIFIER NULL,
    Position    NVARCHAR(100)    NOT NULL,

    JoinedAt    DATETIME2        NOT NULL DEFAULT SYSUTCDATETIME(),
    IsActive    BIT              NOT NULL DEFAULT 1,
    CreateAt    DATETIME2        NOT NULL DEFAULT SYSUTCDATETIME(),
    UpdatedAt   DATETIME2        NULL,
    DeletedAt   DATETIME2        NULL,

    CONSTRAINT FK_User_Timezone FOREIGN KEY (TimezoneId) REFERENCES Timezone(Id),
    CONSTRAINT FK_User_City     FOREIGN KEY (CityId)     REFERENCES City(Id)
);
GO

-- ====================================================

CREATE TABLE Community (
    Id            UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    CommunityName NVARCHAR(100)    NOT NULL,
    Description   NVARCHAR(255)    NULL,
    CreatorId     UNIQUEIDENTIFIER NOT NULL,

    CONSTRAINT FK_Community_User FOREIGN KEY (CreatorId) REFERENCES [User](Id)
);
GO

CREATE TABLE CommunityMember (
    Id          UNIQUEIDENTIFIER NOT NULL DEFAULT NEWID(),
    CommunityId UNIQUEIDENTIFIER NOT NULL,
    UserId      UNIQUEIDENTIFIER NOT NULL,
    Role        NVARCHAR(20)     NOT NULL DEFAULT 'Member',

    CONSTRAINT PK_CommunityMember          PRIMARY KEY (Id),
    CONSTRAINT FK_CommunityMember_Community FOREIGN KEY (CommunityId) REFERENCES Community(Id),
    CONSTRAINT FK_CommunityMember_User      FOREIGN KEY (UserId)      REFERENCES [User](Id),
    CONSTRAINT UQ_CommunityMember           UNIQUE (CommunityId, UserId),
    CONSTRAINT CK_CommunityMember_Role      CHECK (Role IN ('Owner', 'Moderator', 'Member'))
);
GO

-- ====================================================

CREATE TABLE Post (
    Id          UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    AuthorId    UNIQUEIDENTIFIER NOT NULL,
    Texto       NVARCHAR(MAX)    NOT NULL,
    IsSensitive BIT              NOT NULL DEFAULT 0,
    CommunityId UNIQUEIDENTIFIER NULL,

    JoinedAt    DATETIME2        NOT NULL DEFAULT SYSUTCDATETIME(),
    IsActive    BIT              NOT NULL DEFAULT 1,
    CreateAT    DATETIME2        NOT NULL DEFAULT SYSUTCDATETIME(),
    UpdatedAt   DATETIME2        NOT NULL DEFAULT SYSUTCDATETIME(),
    DeletedAt   DATETIME2        NULL,

    CONSTRAINT FK_Post_Author    FOREIGN KEY (AuthorId)    REFERENCES [User](Id),
    CONSTRAINT FK_Post_Community FOREIGN KEY (CommunityId) REFERENCES Community(Id)
);
GO

ALTER TABLE [User] ADD CONSTRAINT FK_User_PinnedPost FOREIGN KEY (PinnedPostId) REFERENCES Post(Id);
GO

-- ====================================================

CREATE TABLE Following (
    Id         UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    FollowerId UNIQUEIDENTIFIER NOT NULL,
    FollowedId UNIQUEIDENTIFIER NOT NULL,

    CONSTRAINT FK_Following_Follower  FOREIGN KEY (FollowerId) REFERENCES [User](Id),
    CONSTRAINT FK_Following_Following FOREIGN KEY (FollowedId) REFERENCES [User](Id),
    CONSTRAINT UQ_Following           UNIQUE (FollowerId, FollowedId),
    CONSTRAINT CHK_NoSelfFollow       CHECK (FollowerId <> FollowedId)
);
GO

CREATE TABLE Block (
    Id            UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    BlockerId     UNIQUEIDENTIFIER NOT NULL,
    BlockedId     UNIQUEIDENTIFIER NOT NULL,
    FechaCreacion DATETIME2        NOT NULL DEFAULT SYSUTCDATETIME(),

    CONSTRAINT FK_Block_Blocker FOREIGN KEY (BlockerId) REFERENCES [User](Id),
    CONSTRAINT FK_Block_Blocked FOREIGN KEY (BlockedId) REFERENCES [User](Id),
    CONSTRAINT UQ_Block         UNIQUE (BlockerId, BlockedId),
    CONSTRAINT CHK_NoSelfBlock  CHECK (BlockerId <> BlockedId)
);
GO

CREATE TABLE Message (
    Id         UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    Texto      NVARCHAR(MAX)    NOT NULL,
    SenderId   UNIQUEIDENTIFIER NOT NULL,
    ReceiverId UNIQUEIDENTIFIER NOT NULL,
    PostId     UNIQUEIDENTIFIER NULL,

    CONSTRAINT FK_Message_Sender FOREIGN KEY (SenderId) REFERENCES [User](Id),
    CONSTRAINT FK_Message_Post   FOREIGN KEY (PostId)   REFERENCES Post(Id)
);
GO

CREATE TABLE Reply (
    Id            UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    PostId        UNIQUEIDENTIFIER NOT NULL,
    Texto         NVARCHAR(MAX)    NOT NULL,
    AuthorId      UNIQUEIDENTIFIER NOT NULL,
    FechaCreacion DATETIME2        NOT NULL DEFAULT SYSUTCDATETIME(),

    CONSTRAINT FK_Reply_Post   FOREIGN KEY (PostId)   REFERENCES Post(Id),
    CONSTRAINT FK_Reply_Author FOREIGN KEY (AuthorId) REFERENCES [User](Id)
);
GO

CREATE TABLE Quote (
    Id            UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    QuotedPostId  UNIQUEIDENTIFIER NOT NULL,
    Texto         NVARCHAR(MAX)    NOT NULL,
    AuthorId      UNIQUEIDENTIFIER NOT NULL,
    FechaCreacion DATETIME2        NOT NULL DEFAULT SYSUTCDATETIME(),

    CONSTRAINT FK_Quote_Post   FOREIGN KEY (QuotedPostId) REFERENCES Post(Id),
    CONSTRAINT FK_Quote_Author FOREIGN KEY (AuthorId)     REFERENCES [User](Id)
);
GO

CREATE TABLE [Like] (
    Id            UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    PostId        UNIQUEIDENTIFIER NOT NULL,
    UserId        UNIQUEIDENTIFIER NOT NULL,
    FechaCreacion DATETIME2        NOT NULL DEFAULT SYSUTCDATETIME(),

    CONSTRAINT FK_Like_Post FOREIGN KEY (PostId)  REFERENCES Post(Id),
    CONSTRAINT FK_Like_User FOREIGN KEY (UserId)  REFERENCES [User](Id),
    CONSTRAINT UQ_Like      UNIQUE (PostId, UserId)
);
GO

CREATE TABLE Repost (
    Id            UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    PostId        UNIQUEIDENTIFIER NOT NULL,
    UserId        UNIQUEIDENTIFIER NOT NULL,
    FechaCreacion DATETIME2        NOT NULL DEFAULT SYSUTCDATETIME(),

    CONSTRAINT FK_Repost_Post FOREIGN KEY (PostId)  REFERENCES Post(Id),
    CONSTRAINT FK_Repost_User FOREIGN KEY (UserId)  REFERENCES [User](Id),
    CONSTRAINT UQ_Repost      UNIQUE (PostId, UserId)
);
GO

CREATE TABLE Mention (
    Id     UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    PostId UNIQUEIDENTIFIER NOT NULL,
    UserId UNIQUEIDENTIFIER NOT NULL,

    CONSTRAINT FK_Mention_Post FOREIGN KEY (PostId)  REFERENCES Post(Id),
    CONSTRAINT FK_Mention_User FOREIGN KEY (UserId)  REFERENCES [User](Id),
    CONSTRAINT UQ_Mention      UNIQUE (PostId, UserId)
);
GO

-- ====================================================

CREATE TABLE Hashtag (
    Id    UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    Texto NVARCHAR(100)    NOT NULL UNIQUE
);
GO

CREATE TABLE PostHashtag (
    Id        UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    PostId    UNIQUEIDENTIFIER NOT NULL,
    HashtagId UNIQUEIDENTIFIER NOT NULL,

    CONSTRAINT FK_PostHashtag_Post    FOREIGN KEY (PostId)    REFERENCES Post(Id),
    CONSTRAINT FK_PostHashtag_Hashtag FOREIGN KEY (HashtagId) REFERENCES Hashtag(Id),
    CONSTRAINT UQ_PostHashtag         UNIQUE (PostId, HashtagId)
);
GO

-- ============================================================
--  TABLA: Permissions (catálogo de permisos globales)
-- ============================================================
CREATE TABLE Permissions (
    Id          UNIQUEIDENTIFIER NOT NULL DEFAULT NEWID(),
    Code        NVARCHAR(100)    NOT NULL,
    Module      NVARCHAR(50)     NOT NULL,
    Action      NVARCHAR(50)     NOT NULL,
    Name        NVARCHAR(150)    NOT NULL,
    Description NVARCHAR(500)    NULL,
    Specificity NVARCHAR(20)     NOT NULL DEFAULT 'ByAssignment',

    CONSTRAINT PK_Permissions          PRIMARY KEY (Id),
    CONSTRAINT UQ_Permissions_Code     UNIQUE (Code),
    CONSTRAINT CK_Permissions_Specificity CHECK (Specificity IN ('Own', 'ByAssignment', 'Creator'))
);
GO

-- ============================================================
--  TABLA: Roles (catálogo de roles globales del sistema)
-- ============================================================
CREATE TABLE Roles (
    Id          UNIQUEIDENTIFIER NOT NULL DEFAULT NEWID(),
    Name        NVARCHAR(100)    NOT NULL,
    Description NVARCHAR(500)    NULL,
    IsActive    BIT              NOT NULL DEFAULT 1,
    CreatedAt   DATETIME2        NOT NULL DEFAULT SYSUTCDATETIME(),
    UpdatedAt   DATETIME2        NOT NULL DEFAULT SYSUTCDATETIME(),

    CONSTRAINT PK_Roles      PRIMARY KEY (Id),
    CONSTRAINT UQ_Roles_Name UNIQUE (Name)
);
GO

-- ============================================================
--  TABLA: RolePermissions (N:M Role <-> Permission)
-- ============================================================
CREATE TABLE RolePermissions (
    RoleId       UNIQUEIDENTIFIER NOT NULL,
    PermissionId UNIQUEIDENTIFIER NOT NULL,
    AssignedAt   DATETIME2        NOT NULL DEFAULT SYSUTCDATETIME(),

    CONSTRAINT PK_RolePermissions            PRIMARY KEY (RoleId, PermissionId),
    CONSTRAINT FK_RolePermissions_Role       FOREIGN KEY (RoleId)       REFERENCES Roles (Id)       ON DELETE CASCADE,
    CONSTRAINT FK_RolePermissions_Permission FOREIGN KEY (PermissionId) REFERENCES Permissions (Id) ON DELETE CASCADE
);
GO

-- ============================================================
--  TABLA: UserRoles (N:M User <-> Role)
-- ============================================================
CREATE TABLE UserRoles (
    UserId     UNIQUEIDENTIFIER NOT NULL,
    RoleId     UNIQUEIDENTIFIER NOT NULL,
    AssignedAt DATETIME2        NOT NULL DEFAULT SYSUTCDATETIME(),
    AssignedBy UNIQUEIDENTIFIER NULL,   -- NULL = sistema

    CONSTRAINT PK_UserRoles          PRIMARY KEY (UserId, RoleId),
    CONSTRAINT FK_UserRoles_User     FOREIGN KEY (UserId)     REFERENCES [User] (Id) ON DELETE CASCADE,
    CONSTRAINT FK_UserRoles_Role     FOREIGN KEY (RoleId)     REFERENCES Roles (Id)  ON DELETE CASCADE,
    CONSTRAINT FK_UserRoles_AssignedBy FOREIGN KEY (AssignedBy) REFERENCES [User] (Id)
);
GO

-- ============================================================
--  TABLA: UserHistory (histórico de eventos del usuario)
--  EntityType cubre todos los eventos relevantes en XClone:
--  RoleChange    = cambio de rol global (User -> Moderator, etc.)
--  Community     = ingreso o salida de una comunidad
--  Suspension    = suspensión o reactivación de la cuenta
--  Verification  = verificación otorgada o removida
-- ============================================================
CREATE TABLE UserHistory (
    Id          UNIQUEIDENTIFIER NOT NULL DEFAULT NEWID(),
    UserId      UNIQUEIDENTIFIER NOT NULL,
    EntityType  NVARCHAR(20)     NOT NULL,
    EntityId    UNIQUEIDENTIFIER NULL,     -- NULL cuando no aplica (ej. Suspension)
    EntityName  NVARCHAR(200)    NOT NULL, -- descripción legible del evento
    StartedAt   DATETIME2        NOT NULL,
    EndedAt     DATETIME2        NULL,     -- NULL = aún activo / evento puntual
    RecordedAt  DATETIME2        NOT NULL DEFAULT SYSUTCDATETIME(),
    PerformedBy UNIQUEIDENTIFIER NULL,     -- quién ejecutó el evento, NULL = sistema

    CONSTRAINT PK_UserHistory             PRIMARY KEY (Id),
    CONSTRAINT FK_UserHistory_User        FOREIGN KEY (UserId)      REFERENCES [User] (Id) ON DELETE CASCADE,
    CONSTRAINT FK_UserHistory_PerformedBy FOREIGN KEY (PerformedBy) REFERENCES [User] (Id),
    CONSTRAINT CK_UserHistory_EntityType  CHECK (EntityType IN (
        'RoleChange',
        'Community',
        'Suspension',
        'Verification'
    ))
);
GO

-- ============================================================
--  SEED: Permisos globales de XClone
-- ============================================================
INSERT INTO Permissions (Id, Code, Module, Action, Name, Description, Specificity)
VALUES
    -- Usuarios
    (NEWID(), 'USERS/CREATE',           'USERS',       'CREATE',           'Crear usuario',                'Permite crear usuarios en el sistema',                          'ByAssignment'),
    (NEWID(), 'USERS/UPDATE',           'USERS',       'UPDATE',           'Actualizar cualquier usuario', 'Permite actualizar el perfil de cualquier usuario',             'ByAssignment'),
    (NEWID(), 'USERS/UPDATE_PERSONAL',  'USERS',       'UPDATE_PERSONAL',  'Actualizar perfil propio',     'Permite al usuario editar su propio perfil',                    'Own'),
    (NEWID(), 'USERS/DISABLE',          'USERS',       'DISABLE',          'Suspender usuario',            'Permite suspender o deshabilitar una cuenta',                   'ByAssignment'),
    (NEWID(), 'USERS/VERIFY',           'USERS',       'VERIFY',           'Verificar usuario',            'Permite otorgar la verificación a un usuario',                  'ByAssignment'),
    -- Posts
    (NEWID(), 'POSTS/CREATE',           'POSTS',       'CREATE',           'Crear post',                   'Permite publicar posts',                                        'Own'),
    (NEWID(), 'POSTS/UPDATE',           'POSTS',       'UPDATE',           'Editar post propio',           'Permite editar posts propios',                                  'Own'),
    (NEWID(), 'POSTS/DELETE',           'POSTS',       'DELETE',           'Eliminar post propio',         'Permite eliminar posts propios',                                'Own'),
    (NEWID(), 'POSTS/DELETE_ANY',       'POSTS',       'DELETE_ANY',       'Eliminar cualquier post',      'Permite eliminar posts de otros usuarios',                      'ByAssignment'),
    (NEWID(), 'POSTS/MARK_SENSITIVE',   'POSTS',       'MARK_SENSITIVE',   'Marcar post como sensible',    'Permite etiquetar posts como contenido sensible',               'ByAssignment'),
    (NEWID(), 'POSTS/PIN',              'POSTS',       'PIN',              'Fijar post propio',            'Permite fijar un post en el perfil propio',                     'Own'),
    -- Replies
    (NEWID(), 'REPLIES/CREATE',         'REPLIES',     'CREATE',           'Responder post',               'Permite responder a posts',                                     'Own'),
    (NEWID(), 'REPLIES/DELETE',         'REPLIES',     'DELETE',           'Eliminar reply propio',        'Permite eliminar replies propios',                              'Own'),
    (NEWID(), 'REPLIES/DELETE_ANY',     'REPLIES',     'DELETE_ANY',       'Eliminar cualquier reply',     'Permite eliminar replies de otros usuarios',                    'ByAssignment'),
    -- Mensajes directos
    (NEWID(), 'MESSAGES/SEND',          'MESSAGES',    'SEND',             'Enviar mensaje directo',       'Permite enviar mensajes directos a otros usuarios',             'Own'),
    (NEWID(), 'MESSAGES/DELETE_OWN',    'MESSAGES',    'DELETE_OWN',       'Eliminar mensaje propio',      'Permite eliminar mensajes propios enviados',                    'Own'),
    (NEWID(), 'MESSAGES/DELETE_ANY',    'MESSAGES',    'DELETE_ANY',       'Eliminar cualquier mensaje',   'Permite eliminar mensajes de cualquier usuario',                'ByAssignment'),
    -- Comunidades
    (NEWID(), 'COMMUNITIES/CREATE',     'COMMUNITIES', 'CREATE',           'Crear comunidad',              'Permite crear nuevas comunidades',                              'Own'),
    (NEWID(), 'COMMUNITIES/DELETE_ANY', 'COMMUNITIES', 'DELETE_ANY',       'Eliminar cualquier comunidad', 'Permite eliminar comunidades desde administración',             'ByAssignment');
GO

-- ============================================================
--  SEED: Roles globales de XClone
-- ============================================================
DECLARE @RoleAdmin     UNIQUEIDENTIFIER = NEWID();
DECLARE @RoleModerator UNIQUEIDENTIFIER = NEWID();
DECLARE @RoleUser      UNIQUEIDENTIFIER = NEWID();

INSERT INTO Roles (Id, Name, Description)
VALUES
    (@RoleAdmin,     'Admin',
     'Control total de la plataforma. Gestiona usuarios, modera contenido, asigna roles y verifica cuentas.'),
    (@RoleModerator, 'Moderator',
     'Modera contenido de la plataforma. Puede suspender cuentas, eliminar posts/replies y marcar contenido sensible.'),
    (@RoleUser,      'User',
     'Usuario estándar. Gestiona su propio perfil, publica contenido y se comunica con otros usuarios.');
GO

-- Admin: todos los permisos
INSERT INTO RolePermissions (RoleId, PermissionId)
SELECT r.Id, p.Id
FROM   Roles r
CROSS JOIN Permissions p
WHERE  r.Name = 'Admin';
GO

-- Moderator: modera contenido y cuentas
INSERT INTO RolePermissions (RoleId, PermissionId)
SELECT r.Id, p.Id
FROM   Roles r
JOIN   Permissions p ON p.Code IN (
    'USERS/DISABLE',
    'USERS/VERIFY',
    'POSTS/DELETE_ANY',
    'POSTS/MARK_SENSITIVE',
    'REPLIES/DELETE_ANY',
    'MESSAGES/DELETE_ANY',
    'COMMUNITIES/DELETE_ANY'
)
WHERE  r.Name = 'Moderator';
GO

-- User: acciones sobre su propio contenido únicamente
INSERT INTO RolePermissions (RoleId, PermissionId)
SELECT r.Id, p.Id
FROM   Roles r
JOIN   Permissions p ON p.Code IN (
    'USERS/UPDATE_PERSONAL',
    'POSTS/CREATE',
    'POSTS/UPDATE',
    'POSTS/DELETE',
    'POSTS/PIN',
    'REPLIES/CREATE',
    'REPLIES/DELETE',
    'MESSAGES/SEND',
    'MESSAGES/DELETE_OWN',
    'COMMUNITIES/CREATE'
)
WHERE  r.Name = 'User';
GO


-- ====================================================

CREATE TABLE EmailTemplates (
	EmailTemplateId INT IDENTITY(1, 1) NOT NULL,
	Name VARCHAR(100) NOT NULL,
	Subject VARCHAR(255) NOT NULL,
	Body TEXT NOT NULL,
	CreatedAt DATETIME2 NOT NULL DEFAULT(SYSUTCDATETIME())
);
GO

INSERT INTO EmailTemplates (Name, Subject, Body)
VALUES
    ('USER_REGISTER',       'Registro de usuario - Xclone',        'Se creó una cuenta con su correo electrónico. Su contraseña es </strong>{{password}}<strong>'),
    ('AUTH_LOGIN_SUCCESS',  'Inicio de sesión exitoso - XClone',   'Se inicó sesión en su cuenta a las <strong>{{datetime}}</strong>'),
    ('AUTH_LOGIN FAILED',   'Inicio de sesión fallido - XClone',   'Se intentó iniciar sesión en su cuenta, si no fue usted quién realizó esta acción, comuniquese de inmediado con administración'),
	('AUTH_REGISTER_EMAIL_VERIFICATION', 'Verifica tu cuenta - XClone', 'Hola, para continuar con su proceso de registro, necesita validar su correo electrónico haciendo clic en el siguiente <a href="{{url}}">enlace</a>.'),
	('AUTH_RECOVER_PASSWORD_OTP', 'Código de recuperación de contraseña - XClone', 'Hola, el siguiente código te permitirá restablecer tu contraseña para volver a entrar a tu cuenta: <strong>{{otp}}</strong>. No compartas este código con nadie.');

GO


-- ============================================================
--  TABLA: Menus
-- ============================================================
CREATE TABLE Menus (
    Id        UNIQUEIDENTIFIER NOT NULL DEFAULT NEWID(),
    Code      NVARCHAR(100)    NOT NULL,
    Name      NVARCHAR(150)    NOT NULL,
    Path      NVARCHAR(300)    NOT NULL,
    IconName  NVARCHAR(100)    NOT NULL,
    ParentId  UNIQUEIDENTIFIER NULL,
    SortOrder INT              NOT NULL DEFAULT 0,
    IsVisible BIT              NOT NULL DEFAULT 1,
    IsActive  BIT              NOT NULL DEFAULT 1,
    CreatedAt DATETIME2        NOT NULL DEFAULT SYSUTCDATETIME(),
    UpdatedAt DATETIME2        NOT NULL DEFAULT SYSUTCDATETIME(),

    CONSTRAINT PK_Menus          PRIMARY KEY (Id),
    CONSTRAINT UQ_Menus_Code     UNIQUE (Code),
    CONSTRAINT FK_Menus_ParentId FOREIGN KEY (ParentId) REFERENCES Menus (Id)
);
GO

-- ============================================================
--  TABLA: MenuPermissions (N:M Menu <-> Permission)
--  Define qué permisos son necesarios para ver/acceder a un ítem de menú.
--  Los permisos del usuario se derivan de sus roles asignados.
-- ============================================================
CREATE TABLE MenuPermissions (
    MenuId       UNIQUEIDENTIFIER NOT NULL,
    PermissionId UNIQUEIDENTIFIER NOT NULL,
    -- ALL = el usuario debe tener TODOS los permisos del menú para verlo
    -- ANY = basta con tener AL MENOS UNO para verlo
    MatchMode    NVARCHAR(10)     NOT NULL DEFAULT 'ANY',

    CONSTRAINT PK_MenuPermissions            PRIMARY KEY (MenuId, PermissionId),
    CONSTRAINT FK_MenuPermissions_Menu       FOREIGN KEY (MenuId)       REFERENCES Menus (Id)       ON DELETE CASCADE,
    CONSTRAINT FK_MenuPermissions_Permission FOREIGN KEY (PermissionId) REFERENCES Permissions (Id) ON DELETE CASCADE,
    CONSTRAINT CK_MenuPermissions_MatchMode  CHECK (MatchMode IN ('ANY', 'ALL'))
);
GO

-- ============================================================
--  SEED: Menús del sistema XClone
-- ============================================================
DECLARE @IdHome          UNIQUEIDENTIFIER = NEWID();
DECLARE @IdExplore       UNIQUEIDENTIFIER = NEWID();
DECLARE @IdNotifications UNIQUEIDENTIFIER = NEWID();
DECLARE @IdMessages      UNIQUEIDENTIFIER = NEWID();
DECLARE @IdCommunities   UNIQUEIDENTIFIER = NEWID();
DECLARE @IdCommList      UNIQUEIDENTIFIER = NEWID();
DECLARE @IdCommMembers   UNIQUEIDENTIFIER = NEWID();
DECLARE @IdProfile       UNIQUEIDENTIFIER = NEWID();
DECLARE @IdAdmin         UNIQUEIDENTIFIER = NEWID();
DECLARE @IdAdminUsers    UNIQUEIDENTIFIER = NEWID();
DECLARE @IdAdminContent  UNIQUEIDENTIFIER = NEWID();

INSERT INTO Menus (Id, Code, Name, Path, IconName, ParentId, SortOrder, IsVisible, IsActive)
VALUES
    -- Menús raíz (visibles para todos los usuarios)
    (@IdHome,          'home',                  'Inicio',           '/home',                    'home',           NULL,            1,  1, 1),
    (@IdExplore,       'explore',               'Explorar',         '/explore',                 'search',         NULL,            2,  1, 1),
    (@IdNotifications, 'notifications',         'Notificaciones',   '/notifications',           'bell',           NULL,            3,  1, 1),
    (@IdMessages,      'messages',              'Mensajes',         '/messages',                'envelope',       NULL,            4,  1, 1),
    (@IdCommunities,   'communities',           'Comunidades',      '/communities',             'users-group',    NULL,            5,  1, 1),
    (@IdProfile,       'profile',               'Mi Perfil',        '/profile',                 'user-circle',    NULL,            6,  1, 1),
    -- Submenús de Comunidades
    (@IdCommList,      'communities.list',      'Mis Comunidades',  '/communities/list',        'list',           @IdCommunities,  1,  1, 1),
    (@IdCommMembers,   'communities.members',   'Miembros',         '/communities/members',     'users',          @IdCommunities,  2,  1, 1),
    -- Menú de administración (solo Admin y Moderator)
    (@IdAdmin,         'admin',                 'Administración',   '/admin',                   'shield',         NULL,            7,  1, 1),
    (@IdAdminUsers,    'admin.users',           'Usuarios',         '/admin/users',             'user-cog',       @IdAdmin,        1,  1, 1),
    (@IdAdminContent,  'admin.content',         'Contenido',        '/admin/content',           'flag',           @IdAdmin,        2,  1, 1);
GO

-- ============================================================
--  SEED: Relación Menús <-> Permisos
-- ============================================================
INSERT INTO MenuPermissions (MenuId, PermissionId, MatchMode)
SELECT m.Id, p.Id, 'ANY'
FROM   Menus m
CROSS JOIN Permissions p
WHERE
    -- Mensajes: requiere poder enviar o eliminar mensajes
    (m.Code = 'messages'            AND p.Code IN ('MESSAGES/SEND', 'MESSAGES/DELETE_OWN'))
    -- Comunidades: requiere poder crear comunidades
    OR (m.Code = 'communities.list'   AND p.Code = 'COMMUNITIES/CREATE')
    -- Miembros de comunidad: requiere poder gestionar miembros (Owner/Moderator de comunidad)
    OR (m.Code = 'communities.members' AND p.Code = 'COMMUNITIES/CREATE')
    -- Panel de admin: requiere al menos un permiso de gestión de usuarios o contenido
    OR (m.Code = 'admin'              AND p.Code IN ('USERS/DISABLE', 'USERS/VERIFY', 'POSTS/DELETE_ANY', 'POSTS/MARK_SENSITIVE'))
    -- Gestión de usuarios: suspender o verificar cuentas
    OR (m.Code = 'admin.users'        AND p.Code IN ('USERS/DISABLE', 'USERS/VERIFY', 'USERS/UPDATE', 'USERS/CREATE'))
    -- Gestión de contenido: moderar posts, replies y comunidades
    OR (m.Code = 'admin.content'      AND p.Code IN ('POSTS/DELETE_ANY', 'POSTS/MARK_SENSITIVE', 'REPLIES/DELETE_ANY', 'COMMUNITIES/DELETE_ANY'));
GO


-- ============================================================
--  ÍNDICES
-- ============================================================
CREATE INDEX IX_RolePermissions_PermissionId ON RolePermissions (PermissionId);
CREATE INDEX IX_UserRoles_RoleId             ON UserRoles (RoleId);
CREATE INDEX IX_UserRoles_AssignedBy         ON UserRoles (AssignedBy);
CREATE INDEX IX_UserHistory_UserId           ON UserHistory (UserId);
CREATE INDEX IX_UserHistory_EntityType       ON UserHistory (EntityType, EntityId);
CREATE INDEX IX_UserHistory_PerformedBy      ON UserHistory (PerformedBy);
CREATE INDEX IX_Menus_ParentId              ON Menus (ParentId);
CREATE INDEX IX_Menus_SortOrder             ON Menus (SortOrder);
CREATE INDEX IX_MenuPermissions_PermissionId ON MenuPermissions (PermissionId);
GO