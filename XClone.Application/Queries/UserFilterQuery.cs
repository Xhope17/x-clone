using XClone.Application.Models.Requets.User;
using XClone.Domain.Database.SqlServer.Entities;

namespace XClone.Application.Queries
{
    public static class UserFilterQuery
    {
        public static IQueryable<User> ApplyQuery(this IQueryable<User> queryable, FilterUserRequest model)
        {
            // Filtrado de nombre
            if (!string.IsNullOrWhiteSpace(model.UserName))
            {
                queryable = queryable.Where(x => x.UserName.Contains(model.UserName ?? ""));
            }

            // Filtrado de displayname
            if (!string.IsNullOrWhiteSpace(model.DisplayName))
            {
                queryable = queryable.Where(x => x.DisplayName != null && x.DisplayName.Contains(model.DisplayName ?? ""));
            }

            // Filtrado del cargo
            if (!string.IsNullOrWhiteSpace(model.Position))
            {
                queryable = queryable.Where(x => x.Position.Contains(model.Position ?? ""));
            }

            return queryable;
        }
    }
}
