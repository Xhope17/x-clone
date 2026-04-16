using System;
using System.Collections.Generic;

namespace XClone.Domain.Database.SqlServer.Entities;

public partial class CommunityMember
{
    public Guid Id { get; set; }

    public Guid CommunityId { get; set; }

    public Guid UserId { get; set; }

    public string Role { get; set; } = null!;

    public virtual Community Community { get; set; } = null!;

    public virtual User User { get; set; } = null!;
}
