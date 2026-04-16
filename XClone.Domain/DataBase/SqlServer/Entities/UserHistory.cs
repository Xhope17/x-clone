using System;
using System.Collections.Generic;

namespace XClone.Domain.Database.SqlServer.Entities;

public partial class UserHistory
{
    public Guid Id { get; set; }

    public Guid UserId { get; set; }

    public string EntityType { get; set; } = null!;

    public Guid? EntityId { get; set; }

    public string EntityName { get; set; } = null!;

    public DateTime StartedAt { get; set; }

    public DateTime? EndedAt { get; set; }

    public DateTime RecordedAt { get; set; }

    public Guid? PerformedBy { get; set; }

    public virtual User? PerformedByNavigation { get; set; }

    public virtual User User { get; set; } = null!;
}
