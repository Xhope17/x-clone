using System;
using System.Collections.Generic;
using Microsoft.EntityFrameworkCore;
using XClone.Domain.Database.SqlServer.Entities;

namespace XClone.Domain.Database.SqlServer.Context;

public partial class XcloneContext : DbContext
{
    public XcloneContext(DbContextOptions<XcloneContext> options)
        : base(options)
    {
    }

    public virtual DbSet<Block> Blocks { get; set; }

    public virtual DbSet<City> Cities { get; set; }

    public virtual DbSet<Community> Communities { get; set; }

    public virtual DbSet<CommunityMember> CommunityMembers { get; set; }

    public virtual DbSet<Country> Countries { get; set; }

    public virtual DbSet<EmailTemplate> EmailTemplates { get; set; }

    public virtual DbSet<Following> Followings { get; set; }

    public virtual DbSet<Hashtag> Hashtags { get; set; }

    public virtual DbSet<Like> Likes { get; set; }

    public virtual DbSet<Mention> Mentions { get; set; }

    public virtual DbSet<Message> Messages { get; set; }

    public virtual DbSet<Permission> Permissions { get; set; }

    public virtual DbSet<Post> Posts { get; set; }

    public virtual DbSet<PostHashtag> PostHashtags { get; set; }

    public virtual DbSet<Quote> Quotes { get; set; }

    public virtual DbSet<Reply> Replies { get; set; }

    public virtual DbSet<Repost> Reposts { get; set; }

    public virtual DbSet<Role> Roles { get; set; }

    public virtual DbSet<RolePermission> RolePermissions { get; set; }

    public virtual DbSet<Timezone> Timezones { get; set; }

    public virtual DbSet<User> Users { get; set; }

    public virtual DbSet<UserHistory> UserHistories { get; set; }

    public virtual DbSet<UserRole> UserRoles { get; set; }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<Block>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("PK__Block__3214EC078775205C");

            entity.ToTable("Block");

            entity.HasIndex(e => new { e.BlockerId, e.BlockedId }, "UQ_Block").IsUnique();

            entity.Property(e => e.Id).HasDefaultValueSql("(newid())");
            entity.Property(e => e.FechaCreacion).HasDefaultValueSql("(sysutcdatetime())");

            entity.HasOne(d => d.Blocked).WithMany(p => p.BlockBlockeds)
                .HasForeignKey(d => d.BlockedId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK_Block_Blocked");

            entity.HasOne(d => d.Blocker).WithMany(p => p.BlockBlockers)
                .HasForeignKey(d => d.BlockerId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK_Block_Blocker");
        });

        modelBuilder.Entity<City>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("PK__City__3214EC07F58DF6A4");

            entity.ToTable("City");

            entity.Property(e => e.Id).HasDefaultValueSql("(newid())");
            entity.Property(e => e.Name).HasMaxLength(100);

            entity.HasOne(d => d.Country).WithMany(p => p.Cities)
                .HasForeignKey(d => d.CountryId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK_City_Country");
        });

        modelBuilder.Entity<Community>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("PK__Communit__3214EC07AC494D6D");

            entity.ToTable("Community");

            entity.Property(e => e.Id).HasDefaultValueSql("(newid())");
            entity.Property(e => e.CommunityName).HasMaxLength(100);
            entity.Property(e => e.Description).HasMaxLength(255);

            entity.HasOne(d => d.Creator).WithMany(p => p.Communities)
                .HasForeignKey(d => d.CreatorId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK_Community_User");
        });

        modelBuilder.Entity<CommunityMember>(entity =>
        {
            entity.ToTable("CommunityMember");

            entity.HasIndex(e => new { e.CommunityId, e.UserId }, "UQ_CommunityMember").IsUnique();

            entity.Property(e => e.Id).HasDefaultValueSql("(newid())");
            entity.Property(e => e.Role)
                .HasMaxLength(20)
                .HasDefaultValue("Member");

            entity.HasOne(d => d.Community).WithMany(p => p.CommunityMembers)
                .HasForeignKey(d => d.CommunityId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK_CommunityMember_Community");

            entity.HasOne(d => d.User).WithMany(p => p.CommunityMembers)
                .HasForeignKey(d => d.UserId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK_CommunityMember_User");
        });

        modelBuilder.Entity<Country>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("PK__Country__3214EC079A75A788");

            entity.ToTable("Country");

            entity.Property(e => e.Id).HasDefaultValueSql("(newid())");
            entity.Property(e => e.Name).HasMaxLength(100);
        });

        modelBuilder.Entity<EmailTemplate>(entity =>
        {
            entity
                .HasNoKey()
                .ToTable("email_templates");

            entity.Property(e => e.Body).HasColumnType("text");
            entity.Property(e => e.CreateAt).HasDefaultValueSql("(sysutcdatetime())");
            entity.Property(e => e.EmailTemplateId).ValueGeneratedOnAdd();
            entity.Property(e => e.Name)
                .HasMaxLength(100)
                .IsUnicode(false);
            entity.Property(e => e.Subject)
                .HasMaxLength(255)
                .IsUnicode(false);
        });

        modelBuilder.Entity<Following>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("PK__Followin__3214EC07AC4DE14B");

            entity.ToTable("Following");

            entity.HasIndex(e => new { e.FollowerId, e.FollowedId }, "UQ_Following").IsUnique();

            entity.Property(e => e.Id).HasDefaultValueSql("(newid())");

            entity.HasOne(d => d.Followed).WithMany(p => p.FollowingFolloweds)
                .HasForeignKey(d => d.FollowedId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK_Following_Following");

            entity.HasOne(d => d.Follower).WithMany(p => p.FollowingFollowers)
                .HasForeignKey(d => d.FollowerId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK_Following_Follower");
        });

        modelBuilder.Entity<Hashtag>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("PK__Hashtag__3214EC07DBE3528C");

            entity.ToTable("Hashtag");

            entity.HasIndex(e => e.Texto, "UQ__Hashtag__5176E45492893F13").IsUnique();

            entity.Property(e => e.Id).HasDefaultValueSql("(newid())");
            entity.Property(e => e.Texto).HasMaxLength(100);
        });

        modelBuilder.Entity<Like>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("PK__Like__3214EC07EF618B9D");

            entity.ToTable("Like");

            entity.HasIndex(e => new { e.PostId, e.UserId }, "UQ_Like").IsUnique();

            entity.Property(e => e.Id).HasDefaultValueSql("(newid())");
            entity.Property(e => e.FechaCreacion).HasDefaultValueSql("(sysutcdatetime())");

            entity.HasOne(d => d.Post).WithMany(p => p.Likes)
                .HasForeignKey(d => d.PostId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK_Like_Post");

            entity.HasOne(d => d.User).WithMany(p => p.Likes)
                .HasForeignKey(d => d.UserId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK_Like_User");
        });

        modelBuilder.Entity<Mention>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("PK__Mention__3214EC07DA3B4C42");

            entity.ToTable("Mention");

            entity.HasIndex(e => new { e.PostId, e.UserId }, "UQ_Mention").IsUnique();

            entity.Property(e => e.Id).HasDefaultValueSql("(newid())");

            entity.HasOne(d => d.Post).WithMany(p => p.Mentions)
                .HasForeignKey(d => d.PostId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK_Mention_Post");

            entity.HasOne(d => d.User).WithMany(p => p.Mentions)
                .HasForeignKey(d => d.UserId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK_Mention_User");
        });

        modelBuilder.Entity<Message>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("PK__Message__3214EC0707EDDE26");

            entity.ToTable("Message");

            entity.Property(e => e.Id).HasDefaultValueSql("(newid())");

            entity.HasOne(d => d.Post).WithMany(p => p.Messages)
                .HasForeignKey(d => d.PostId)
                .HasConstraintName("FK_Message_Post");

            entity.HasOne(d => d.Sender).WithMany(p => p.Messages)
                .HasForeignKey(d => d.SenderId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK_Message_Sender");
        });

        modelBuilder.Entity<Permission>(entity =>
        {
            entity.HasIndex(e => e.Code, "UQ_Permissions_Code").IsUnique();

            entity.Property(e => e.Id).HasDefaultValueSql("(newid())");
            entity.Property(e => e.Action).HasMaxLength(50);
            entity.Property(e => e.Code).HasMaxLength(100);
            entity.Property(e => e.Description).HasMaxLength(500);
            entity.Property(e => e.Module).HasMaxLength(50);
            entity.Property(e => e.Name).HasMaxLength(150);
            entity.Property(e => e.Specificity)
                .HasMaxLength(20)
                .HasDefaultValue("ByAssignment");
        });

        modelBuilder.Entity<Post>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("PK__Post__3214EC07B0FC4534");

            entity.ToTable("Post");

            entity.Property(e => e.Id).HasDefaultValueSql("(newid())");
            entity.Property(e => e.CreateAt)
                .HasDefaultValueSql("(sysutcdatetime())")
                .HasColumnName("CreateAT");
            entity.Property(e => e.IsActive).HasDefaultValue(true);
            entity.Property(e => e.JoinedAt).HasDefaultValueSql("(sysutcdatetime())");
            entity.Property(e => e.UpdatedAt).HasDefaultValueSql("(sysutcdatetime())");

            entity.HasOne(d => d.Author).WithMany(p => p.Posts)
                .HasForeignKey(d => d.AuthorId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK_Post_Author");

            entity.HasOne(d => d.Community).WithMany(p => p.Posts)
                .HasForeignKey(d => d.CommunityId)
                .HasConstraintName("FK_Post_Community");
        });

        modelBuilder.Entity<PostHashtag>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("PK__PostHash__3214EC0769C4DFFB");

            entity.ToTable("PostHashtag");

            entity.HasIndex(e => new { e.PostId, e.HashtagId }, "UQ_PostHashtag").IsUnique();

            entity.Property(e => e.Id).HasDefaultValueSql("(newid())");

            entity.HasOne(d => d.Hashtag).WithMany(p => p.PostHashtags)
                .HasForeignKey(d => d.HashtagId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK_PostHashtag_Hashtag");

            entity.HasOne(d => d.Post).WithMany(p => p.PostHashtags)
                .HasForeignKey(d => d.PostId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK_PostHashtag_Post");
        });

        modelBuilder.Entity<Quote>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("PK__Quote__3214EC079C7AF58C");

            entity.ToTable("Quote");

            entity.Property(e => e.Id).HasDefaultValueSql("(newid())");
            entity.Property(e => e.FechaCreacion).HasDefaultValueSql("(sysutcdatetime())");

            entity.HasOne(d => d.Author).WithMany(p => p.Quotes)
                .HasForeignKey(d => d.AuthorId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK_Quote_Author");

            entity.HasOne(d => d.QuotedPost).WithMany(p => p.Quotes)
                .HasForeignKey(d => d.QuotedPostId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK_Quote_Post");
        });

        modelBuilder.Entity<Reply>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("PK__Reply__3214EC0709D06809");

            entity.ToTable("Reply");

            entity.Property(e => e.Id).HasDefaultValueSql("(newid())");
            entity.Property(e => e.FechaCreacion).HasDefaultValueSql("(sysutcdatetime())");

            entity.HasOne(d => d.Author).WithMany(p => p.Replies)
                .HasForeignKey(d => d.AuthorId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK_Reply_Author");

            entity.HasOne(d => d.Post).WithMany(p => p.Replies)
                .HasForeignKey(d => d.PostId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK_Reply_Post");
        });

        modelBuilder.Entity<Repost>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("PK__Repost__3214EC07B31375C2");

            entity.ToTable("Repost");

            entity.HasIndex(e => new { e.PostId, e.UserId }, "UQ_Repost").IsUnique();

            entity.Property(e => e.Id).HasDefaultValueSql("(newid())");
            entity.Property(e => e.FechaCreacion).HasDefaultValueSql("(sysutcdatetime())");

            entity.HasOne(d => d.Post).WithMany(p => p.Reposts)
                .HasForeignKey(d => d.PostId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK_Repost_Post");

            entity.HasOne(d => d.User).WithMany(p => p.Reposts)
                .HasForeignKey(d => d.UserId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK_Repost_User");
        });

        modelBuilder.Entity<Role>(entity =>
        {
            entity.HasIndex(e => e.Name, "UQ_Roles_Name").IsUnique();

            entity.Property(e => e.Id).HasDefaultValueSql("(newid())");
            entity.Property(e => e.CreatedAt).HasDefaultValueSql("(sysutcdatetime())");
            entity.Property(e => e.Description).HasMaxLength(500);
            entity.Property(e => e.IsActive).HasDefaultValue(true);
            entity.Property(e => e.Name).HasMaxLength(100);
            entity.Property(e => e.UpdatedAt).HasDefaultValueSql("(sysutcdatetime())");
        });

        modelBuilder.Entity<RolePermission>(entity =>
        {
            entity.HasKey(e => new { e.RoleId, e.PermissionId });

            entity.HasIndex(e => e.PermissionId, "IX_RolePermissions_PermissionId");

            entity.Property(e => e.AssignedAt).HasDefaultValueSql("(sysutcdatetime())");

            entity.HasOne(d => d.Permission).WithMany(p => p.RolePermissions)
                .HasForeignKey(d => d.PermissionId)
                .HasConstraintName("FK_RolePermissions_Permission");

            entity.HasOne(d => d.Role).WithMany(p => p.RolePermissions)
                .HasForeignKey(d => d.RoleId)
                .HasConstraintName("FK_RolePermissions_Role");
        });

        modelBuilder.Entity<Timezone>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("PK__Timezone__3214EC07EBE124F0");

            entity.ToTable("Timezone");

            entity.Property(e => e.Id).HasDefaultValueSql("(newid())");
            entity.Property(e => e.Continente).HasMaxLength(50);
            entity.Property(e => e.DiferenciaUtf)
                .HasMaxLength(10)
                .HasColumnName("DiferenciaUTF");
            entity.Property(e => e.Name).HasMaxLength(100);
        });

        modelBuilder.Entity<User>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("PK__User__3214EC07F420F628");

            entity.ToTable("User");

            entity.HasIndex(e => e.Email, "UQ__User__A9D1053466B6F3E2").IsUnique();

            entity.HasIndex(e => e.UserName, "UQ__User__C9F2845610690660").IsUnique();

            entity.Property(e => e.Id).HasDefaultValueSql("(newid())");
            entity.Property(e => e.CreateAt).HasDefaultValueSql("(sysutcdatetime())");
            entity.Property(e => e.DisplayName).HasMaxLength(100);
            entity.Property(e => e.Email).HasMaxLength(255);
            entity.Property(e => e.IsActive).HasDefaultValue(true);
            entity.Property(e => e.JoinedAt).HasDefaultValueSql("(sysutcdatetime())");
            entity.Property(e => e.Password).HasMaxLength(255);
            entity.Property(e => e.PhoneNumber).HasMaxLength(20);
            entity.Property(e => e.Position).HasMaxLength(100);
            entity.Property(e => e.UpdatedAt).HasDefaultValueSql("(sysutcdatetime())");
            entity.Property(e => e.UserName).HasMaxLength(50);

            entity.HasOne(d => d.City).WithMany(p => p.Users)
                .HasForeignKey(d => d.CityId)
                .HasConstraintName("FK_User_City");

            entity.HasOne(d => d.PinnedPost).WithMany(p => p.Users)
                .HasForeignKey(d => d.PinnedPostId)
                .HasConstraintName("FK_User_PinnedPost");

            entity.HasOne(d => d.Timezone).WithMany(p => p.Users)
                .HasForeignKey(d => d.TimezoneId)
                .HasConstraintName("FK_User_Timezone");
        });

        modelBuilder.Entity<UserHistory>(entity =>
        {
            entity.ToTable("UserHistory");

            entity.HasIndex(e => new { e.EntityType, e.EntityId }, "IX_UserHistory_EntityType");

            entity.HasIndex(e => e.PerformedBy, "IX_UserHistory_PerformedBy");

            entity.HasIndex(e => e.UserId, "IX_UserHistory_UserId");

            entity.Property(e => e.Id).HasDefaultValueSql("(newid())");
            entity.Property(e => e.EntityName).HasMaxLength(200);
            entity.Property(e => e.EntityType).HasMaxLength(20);
            entity.Property(e => e.RecordedAt).HasDefaultValueSql("(sysutcdatetime())");

            entity.HasOne(d => d.PerformedByNavigation).WithMany(p => p.UserHistoryPerformedByNavigations)
                .HasForeignKey(d => d.PerformedBy)
                .HasConstraintName("FK_UserHistory_PerformedBy");

            entity.HasOne(d => d.User).WithMany(p => p.UserHistoryUsers)
                .HasForeignKey(d => d.UserId)
                .HasConstraintName("FK_UserHistory_User");
        });

        modelBuilder.Entity<UserRole>(entity =>
        {
            entity.HasKey(e => new { e.UserId, e.RoleId });

            entity.HasIndex(e => e.AssignedBy, "IX_UserRoles_AssignedBy");

            entity.HasIndex(e => e.RoleId, "IX_UserRoles_RoleId");

            entity.Property(e => e.AssignedAt).HasDefaultValueSql("(sysutcdatetime())");

            entity.HasOne(d => d.AssignedByNavigation).WithMany(p => p.UserRoleAssignedByNavigations)
                .HasForeignKey(d => d.AssignedBy)
                .HasConstraintName("FK_UserRoles_AssignedBy");

            entity.HasOne(d => d.Role).WithMany(p => p.UserRoles)
                .HasForeignKey(d => d.RoleId)
                .HasConstraintName("FK_UserRoles_Role");

            entity.HasOne(d => d.User).WithMany(p => p.UserRoleUsers)
                .HasForeignKey(d => d.UserId)
                .HasConstraintName("FK_UserRoles_User");
        });

        OnModelCreatingPartial(modelBuilder);
    }

    partial void OnModelCreatingPartial(ModelBuilder modelBuilder);
}
