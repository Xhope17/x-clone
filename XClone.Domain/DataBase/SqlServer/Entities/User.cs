using System;
using System.Collections.Generic;

namespace XClone.Domain.Database.SqlServer.Entities;

public partial class User
{
    public Guid Id { get; set; }

    public string UserName { get; set; } = null!;

    public string DisplayName { get; set; } = null!;

    public string Email { get; set; } = null!;

    public string Password { get; set; } = null!;

    public int Age { get; set; }

    public string? PhoneNumber { get; set; }

    public bool IsVerified { get; set; }

    public Guid? PinnedPostId { get; set; }

    public Guid? TimezoneId { get; set; }

    public Guid? CityId { get; set; }

    public string Position { get; set; } = null!;

    public DateTime JoinedAt { get; set; }

    public bool IsActive { get; set; }

    public DateTime CreateAt { get; set; }

    public DateTime UpdatedAt { get; set; }

    public DateTime? DeletedAt { get; set; }

    public virtual ICollection<Block> BlockBlockeds { get; set; } = new List<Block>();

    public virtual ICollection<Block> BlockBlockers { get; set; } = new List<Block>();

    public virtual City? City { get; set; }

    public virtual ICollection<Community> Communities { get; set; } = new List<Community>();

    public virtual ICollection<CommunityMember> CommunityMembers { get; set; } = new List<CommunityMember>();

    public virtual ICollection<Following> FollowingFolloweds { get; set; } = new List<Following>();

    public virtual ICollection<Following> FollowingFollowers { get; set; } = new List<Following>();

    public virtual ICollection<Like> Likes { get; set; } = new List<Like>();

    public virtual ICollection<Mention> Mentions { get; set; } = new List<Mention>();

    public virtual ICollection<Message> Messages { get; set; } = new List<Message>();

    public virtual Post? PinnedPost { get; set; }

    public virtual ICollection<Post> Posts { get; set; } = new List<Post>();

    public virtual ICollection<Quote> Quotes { get; set; } = new List<Quote>();

    public virtual ICollection<Reply> Replies { get; set; } = new List<Reply>();

    public virtual ICollection<Repost> Reposts { get; set; } = new List<Repost>();

    public virtual Timezone? Timezone { get; set; }

    public virtual ICollection<UserHistory> UserHistoryPerformedByNavigations { get; set; } = new List<UserHistory>();

    public virtual ICollection<UserHistory> UserHistoryUsers { get; set; } = new List<UserHistory>();

    public virtual ICollection<UserRole> UserRoleAssignedByNavigations { get; set; } = new List<UserRole>();

    public virtual ICollection<UserRole> UserRoleUsers { get; set; } = new List<UserRole>();
}
