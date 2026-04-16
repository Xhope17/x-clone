#XClone

##Creación de dbContext y entidades de base de datos


dotnet ef dbcontext scaffold "Server=localhost,1433;User=sa;Password=Admin1234@;Database=XClone;TrustServerCertificate=true" Microsoft.EntityFrameworkCore.SqlServer --project Xclone.Domain --startup-project X_Clone.WebApi --no-build --force --context-dir Database/SqlServer/Context --output-dir Database/SqlServer/Entities --no-onconfiguring

# --build no se compila el proyecto solo ejecuta el comando
# --force fuerza a actualizar la tablas
# --no-onconfiguring para no crear una colección en dbcontext