using System;
using System.Collections.Generic;

namespace XClone.Domain.Database.SqlServer.Entities;

public partial class Timezone
{
    public Guid Id { get; set; }

    public string Name { get; set; } = null!;

    public string Continente { get; set; } = null!;

    public string DiferenciaUtf { get; set; } = null!;

    public virtual ICollection<User> Users { get; set; } = new List<User>();
}
