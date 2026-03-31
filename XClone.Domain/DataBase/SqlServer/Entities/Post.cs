using System;
using System.Collections.Generic;

namespace XClone.Domain.Database.SqlServer.Entities;

public partial class Post
{
    public Guid Id { get; set; }

    public string? Texto { get; set; }

    public bool IsSensitive { get; set; }

    public bool IsDeleted { get; set; }

    public Guid AuthorId { get; set; }

    public Guid? CommunityId { get; set; }

    public DateTime CreateAt { get; set; }

    public virtual User Author { get; set; } = null!;

    public virtual Community? Community { get; set; }

    public virtual ICollection<Like> Likes { get; set; } = new List<Like>();

    public virtual ICollection<Mention> Mentions { get; set; } = new List<Mention>();

    public virtual ICollection<Message> Messages { get; set; } = new List<Message>();

    public virtual ICollection<PostHashtag> PostHashtags { get; set; } = new List<PostHashtag>();

    public virtual ICollection<Quote> Quotes { get; set; } = new List<Quote>();

    public virtual ICollection<Reply> Replies { get; set; } = new List<Reply>();

    public virtual ICollection<Repost> Reposts { get; set; } = new List<Repost>();

    public virtual ICollection<User> Users { get; set; } = new List<User>();
}
