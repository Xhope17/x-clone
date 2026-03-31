using System;
using System.Collections.Generic;

namespace XClone.Domain.Database.SqlServer.Entities;

public partial class Community
{
    public Guid Id { get; set; }

    public string CommunityName { get; set; } = null!;

    public string? Description { get; set; }

    public Guid CreatorId { get; set; }

    public virtual ICollection<CommunityMember> CommunityMembers { get; set; } = new List<CommunityMember>();

    public virtual User Creator { get; set; } = null!;

    public virtual ICollection<Post> Posts { get; set; } = new List<Post>();
}
