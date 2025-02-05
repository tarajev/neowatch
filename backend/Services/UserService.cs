using Neo4jClient;
using NeoWatch.Model;

namespace NeoWatch.Services;

public class UserService
{
    #region User CRUD

    public async Task<List<User>?> GetAllUsersAsync()
    {
        using var client = new GraphClient(new Uri("http://localhost:7474"), "neo4j", "8vR@JaRJU-SL7Hr");
        await client.ConnectAsync(); //mozda treba neki try catch i mozda treba singleton pa da se client koristi drugacije 

        var query = client.Cypher
            .Match("(u:User)")
            .Limit(30)
            .Return((u) => u.As<User>());

        var result = await query.ResultsAsync;

        return result.ToList();
    }

    public async Task<User?> GetUserAsync(string username)
    {
        using var client = new GraphClient(new Uri("http://localhost:7474"), "neo4j", "8vR@JaRJU-SL7Hr");
        await client.ConnectAsync(); //mozda treba neki try catch i mozda treba singleton pa da se client koristi drugacije 

        var query = client.Cypher
            .Match("(u:User {username: $username})")
            .WithParam("username", username)
            .Return((u) => u.As<User>());

        var result = await query.ResultsAsync;

        Console.WriteLine($"Found: {result?.FirstOrDefault()?.username}");
        User? user = result?.FirstOrDefault();

        //treba da se hashuje sifra 
        return user;
    }

    public async Task<User?> CreateUserAsync(User user)
    {
        using var client = new GraphClient(new Uri("http://localhost:7474"), "neo4j", "8vR@JaRJU-SL7Hr");
        await client.ConnectAsync();

        var query = client.Cypher
            .Match("(u:User {username: $username})")
            .WithParam("username", user.username)
            .Return((u) => u.As<User>());

        var result = await query.ResultsAsync;

        if (result.Any())
        {
            Console.WriteLine("Cannot create user - Username already exists.");
            return null;
        }
        else
        {
            var createdUser = await client.Cypher
                .Create("(u:User $user)")
                .WithParam("user", new
                {
                    user.username,
                    user.email,
                    user.password,
                    joinedDate = DateTime.UtcNow,
                    user.role //ovo sam dodala
                })
                .Return(u => u.As<User>())
                .ResultsAsync;

            Console.WriteLine("User created successfully.");
            return createdUser.FirstOrDefault();
        }
    }

    public async Task<User?> UpdateUserAsync(User user)
    {
        using var client = new GraphClient(new Uri("http://localhost:7474"), "neo4j", "8vR@JaRJU-SL7Hr");
        await client.ConnectAsync();

        var existingUser = await client.Cypher
            .Match("(u:User {username: $username})")
            .WithParam("username", user.username)
            .Set("u.password = $password, u.picture = $picture, u.bio = $bio")
            .WithParams(new
            {
                user.password,
                user.picture,
                user.bio,
            })
            .Return(u => u.As<User>())
            .ResultsAsync;

        Console.WriteLine(existingUser);

        if (existingUser.Any())
        {
            Console.WriteLine("User updated successfully.");
            return user;
        }
        else
        {
            Console.WriteLine("Cannot update user - No user with the given username found.");
            return null;
        }
    }

    public async Task<User?> DeleteUserAsync(string username)
    {
        using var client = new GraphClient(new Uri("http://localhost:7474"), "neo4j", "8vR@JaRJU-SL7Hr");
        await client.ConnectAsync();

        var users = await client.Cypher
            .Match("(u:User {username: $username})")
            .WithParam("username", username)
            .DetachDelete("u")
            .Return(u => u.As<User>())
            .ResultsAsync;

        if (users.Any())
        {
            Console.WriteLine($"User {username} deleted successfully.");
            return users.FirstOrDefault();
        }
        else
        {
            Console.WriteLine("Cannot delete user - No user with given username found.");
            return null;
        }
    }

    #endregion

    #region Following

    public async Task<List<User>?> GetUserFollowersAsync(string username)
    {
        using var client = new GraphClient(new Uri("http://localhost:7474"), "neo4j", "8vR@JaRJU-SL7Hr");
        await client.ConnectAsync();

        var userExists = await client.Cypher
            .Match("(u:User {username: $username})")
            .WithParam("username", username)
            .Return(u => u.As<User>())
            .ResultsAsync;

        if (!userExists.Any())
        {
            Console.WriteLine("No user with the given username found.");
            return null;
        }

        var followers = await client.Cypher
            .Match("(u:User {username: $username})<-[:FOLLOWS]-(f:User)")
            .WithParam("username", username)
            .Return(f => f.As<User>())
            .ResultsAsync;

        if (followers.Any())
            Console.WriteLine($"Successfully found {followers.Count()} followers of user {username}");
        else
            Console.WriteLine($"User {username} exists but has no followers.");

        return followers.ToList();
    }

    public async Task<List<User>?> GetUserFollowingsAsync(string username)
    {
        using var client = new GraphClient(new Uri("http://localhost:7474"), "neo4j", "8vR@JaRJU-SL7Hr");
        await client.ConnectAsync();

        // Ne znam da li da, kada mi vrati listu, da se stavi u memoriju user.following?
        // Ako se to uradi onda mora prvo ovo da se pozove, pa posle moze da se koristi user.following da se nabave followers.
        // A mozda je ovo i lose jer konzistentnost podataka.

        var userExists = await client.Cypher
            .Match("(u:User {username: $username})")
            .WithParam("username", username)
            .Return(u => u.As<User>())
            .ResultsAsync;

        if (!userExists.Any())
        {
            Console.WriteLine("No user with the given username found.");
            return null;
        }

        var followings = await client.Cypher
            .Match("(u:User {username: $username})-[:FOLLOWS]->(f:User)")
            .WithParam("username", username)
            .Return(f => f.As<User>())
            .ResultsAsync;

        if (followings.Any())
            Console.WriteLine($"Successfully found {followings.Count()} followings of user {username}");
        else
            Console.WriteLine($"User {username} exists but has no followings.");

        return followings.ToList();
    }

    public async Task<bool> FollowUserAsync(string username, string followsUser)
    {
        using var client = new GraphClient(new Uri("http://localhost:7474"), "neo4j", "8vR@JaRJU-SL7Hr");
        await client.ConnectAsync();

        var result = await client.Cypher
            .Match("(u:User {username: $username}), (f:User {username: $followsUser})")
            .WithParams(new
            {
                username,
                followsUser
            })
            .Merge("(u)-[:FOLLOWS]->(f)")
            .Return(f => f.As<User>())
            .ResultsAsync;

        if (result.Any())
        {
            Console.WriteLine($"User {username} is now following {followsUser}");
            return true;
        }
        else
        {
            Console.WriteLine("No user with given username exists.");
            return false;
        }
    }

    public async Task<bool> UnfollowUserAsync(string username, string unfollowsUser)
    {
        using var client = new GraphClient(new Uri("http://localhost:7474"), "neo4j", "8vR@JaRJU-SL7Hr");
        await client.ConnectAsync();

        var result = await client.Cypher
            .Match("(u:User {username: $username})-[r:FOLLOWS]->(f:User {username: $unfollowsUser})")
            .WithParams(new
            {
                username,
                unfollowsUser
            })
            .Delete("r")
            .Return(f => f.As<User>())
            .ResultsAsync;

        if (result.Any())
        {
            Console.WriteLine($"User {username} unfollowed {unfollowsUser}");
            return true;
        }
        else
        {
            Console.WriteLine("No follow relationship found or users don't exist.");
            return false;
        }
    }

    #endregion

    #region Shows

    public async Task<List<Show>?> GetShowsToWatchAsync(string username)
    {
        using var client = new GraphClient(new Uri("http://localhost:7474"), "neo4j", "8vR@JaRJU-SL7Hr");
        await client.ConnectAsync();

        var userExists = await client.Cypher
            .Match("(u:User {username: $username})")
            .WithParam("username", username)
            .Return(u => u.As<User>())
            .ResultsAsync;

        if (!userExists.Any())
        {
            Console.WriteLine("No user with the given username found.");
            return null;
        }

        var shows = await client.Cypher
            .Match("(u:User {username: $username})-[:YET_TO_WATCH]->(s:Show)")
            .WithParam("username", username)
            .Return(s => s.As<Show>())
            .ResultsAsync;

        if (shows.Any())
            Console.WriteLine($"Successfully found {shows.Count()} shows to watch of user {username}");
        else
            Console.WriteLine($"User {username} exists but has no shows to watch.");

        return shows.ToList();
    }

    public async Task<List<Show>?> GetShowsWatchedAsync(string username)
    {
        using var client = new GraphClient(new Uri("http://localhost:7474"), "neo4j", "8vR@JaRJU-SL7Hr");
        await client.ConnectAsync();

        var userExists = await client.Cypher
            .Match("(u:User {username: $username})")
            .WithParam("username", username)
            .Return(u => u.As<User>())
            .ResultsAsync;

        if (!userExists.Any())
        {
            Console.WriteLine("No user with the given username found.");
            return null;
        }

        var shows = await client.Cypher
            .Match("(u:User {username: $username})-[:WATCHED]->(s:Show)")
            .WithParam("username", username)
            .Return(s => s.As<Show>())
            .ResultsAsync;

        if (shows.Any())
            Console.WriteLine($"Successfully found {shows.Count()} shows watched of user {username}");
        else
            Console.WriteLine($"User {username} exists but has no shows watched.");

        return shows.ToList();
    }

    public async Task<List<Show>?> GetShowsWatchingAsync(string username)
    {
        using var client = new GraphClient(new Uri("http://localhost:7474"), "neo4j", "8vR@JaRJU-SL7Hr");
        await client.ConnectAsync();

        var userExists = await client.Cypher
            .Match("(u:User {username: $username})")
            .WithParam("username", username)
            .Return(u => u.As<User>())
            .ResultsAsync;

        if (!userExists.Any())
        {
            Console.WriteLine("No user with the given username found.");
            return null;
        }

        var shows = await client.Cypher
            .Match("(u:User {username: $username})-[:WATCHING]->(s:Show)")
            .WithParam("username", username)
            .Return(s => s.As<Show>())
            .ResultsAsync;

        if (shows.Any())
            Console.WriteLine($"Successfully found {shows.Count()} shows watching of user {username}");
        else
            Console.WriteLine($"User {username} exists but has no shows watching.");

        return shows.ToList();
    }

    public async Task<bool?> AddShowToWatchAsync(string username, string showTitle)
    {
        using var client = new GraphClient(new Uri("http://localhost:7474"), "neo4j", "8vR@JaRJU-SL7Hr");
        await client.ConnectAsync();

        // Proveravamo da li postoji review za seriju
        var hasReview = await client.Cypher
            .Match("(u:User {username: $username})-[w:WATCHED]->(s:Show {title: $showTitle})")
            .Where("w.rating IS NOT NULL OR w.comment IS NOT NULL")
            .WithParams(new { username, showTitle })
            .Return(w => w.As<Watched>())
            .ResultsAsync;

        if (hasReview.Any())
        {
            Console.WriteLine($"Cannot change state for {showTitle}. Remove the review first.");
            return false;
        }

        // Ako ne postoji review menjamo tip veze
        var result = await client.Cypher
            .Match("(u:User {username: $username}), (s:Show {title: $showTitle})")
            .WithParams(new { username, showTitle })
            .OptionalMatch("(u)-[r:WATCHING|WATCHED]->(s)")
            .Delete("r")
            .Merge("(u)-[:YET_TO_WATCH]->(s)")
            .Return(s => s.As<Show>())
            .ResultsAsync;

        if (result.Any())
        {
            Console.WriteLine($"User {username} added {showTitle} to plan to watch list.");
            return true;
        }
        else
        {
            Console.WriteLine("No user or show with given title exists.");
            return null;
        }
    }

    public async Task<bool> AddShowWatchedAsync(string username, string showTitle)
    {
        using var client = new GraphClient(new Uri("http://localhost:7474"), "neo4j", "8vR@JaRJU-SL7Hr");
        await client.ConnectAsync();

        var result = await client.Cypher
            .Match("(u:User {username: $username}), (s:Show {title: $showTitle})")
            .WithParams(new
            {
                username,
                showTitle
            })
            .OptionalMatch("(u)-[r:YET_TO_WATCH|WATCHING]->(s)")
            .Delete("r")
            .Merge("(u)-[:WATCHED]->(s)")
            .Return(s => s.As<Show>())
            .ResultsAsync;

        if (result.Any())
        {
            Console.WriteLine($"User {username} added {showTitle} to watched list.");
            return true;
        }
        else
        {
            Console.WriteLine("No user or show with given title exists.");
            return false;
        }
    }

    public async Task<bool?> AddShowWatchingAsync(string username, string showTitle)
    {
        using var client = new GraphClient(new Uri("http://localhost:7474"), "neo4j", "8vR@JaRJU-SL7Hr");
        await client.ConnectAsync();

        // Proveravamo da li postoji review za seriju
        var hasReview = await client.Cypher
            .Match("(u:User {username: $username})-[w:WATCHED]->(s:Show {title: $showTitle})")
            .Where("w.rating IS NOT NULL OR w.comment IS NOT NULL")
            .WithParams(new { username, showTitle })
            .Return(w => w.As<Watched>())
            .ResultsAsync;

        if (hasReview.Any())
        {
            Console.WriteLine($"Cannot change state for {showTitle}. Remove the review first.");
            return false;
        }

        // Ako ne postoji review menjamo tip veze
        var result = await client.Cypher
            .Match("(u:User {username: $username}), (s:Show {title: $showTitle})")
            .WithParams(new { username, showTitle })
            .OptionalMatch("(u)-[r:YET_TO_WATCH|WATCHED]->(s)")
            .Delete("r")
            .Merge("(u)-[:WATCHING]->(s)")
            .Return(s => s.As<Show>())
            .ResultsAsync;

        if (result.Any())
        {
            Console.WriteLine($"User {username} added {showTitle} to watching list.");
            return true;
        }
        else
        {
            Console.WriteLine("No user or show with given title exists.");
            return null;
        }
    }

    public async Task<Dictionary<int, string?>?> GetReviewAsync(string username, string showTitle)
    {
        using var client = new GraphClient(new Uri("http://localhost:7474"), "neo4j", "8vR@JaRJU-SL7Hr");
        await client.ConnectAsync();

        var review = await client.Cypher
            .Match("(u:User {username: $username})-[w:WATCHED]->(s:Show {title: $showTitle})")
            .Where("w.rating IS NOT NULL OR w.comment IS NOT NULL")
            .WithParams(new { username, showTitle })
            .Return(w => new
            {
                Rating = w.As<Watched>().rating,
                Comment = w.As<Watched>().comment
            })
            .ResultsAsync;

        if (!review.Any())
        {
            Console.WriteLine($"No review found for user {username} on show {showTitle}.");
            return null;
        }

        var firstReview = review.FirstOrDefault();
        if (firstReview == null) return null;

        Console.WriteLine($"Returned review for user {username} on show {showTitle}.");
        return new Dictionary<int, string?> { { firstReview.Rating, firstReview.Comment } };
    }

    public async Task<bool> AddReviewAsync(string username, string showTitle, int rating, string comment)
    {
        using var client = new GraphClient(new Uri("http://localhost:7474"), "neo4j", "8vR@JaRJU-SL7Hr");
        await client.ConnectAsync();

        // Ako je korisnik gledao seriju
        var watchedConnection = await client.Cypher
            .Match("(u:User {username: $username})-[w:WATCHED]->(s:Show {title: $showTitle})")
            .WithParams(new { username, showTitle })
            .Return(w => w.As<Watched>())
            .ResultsAsync;

        if (!watchedConnection.Any())
        {
            Console.WriteLine($"User {username} has not watched the show {showTitle}. Review cannot be added.");
            return false;
        }

        // Dodaje ili azurira review
        await client.Cypher
            .Match("(u:User {username: $username})-[w:WATCHED]->(s:Show {title: $showTitle})")
            .WithParams(new { username, showTitle, rating, comment })
            .Set("w.rating = $rating, w.comment = $comment")
            .ExecuteWithoutResultsAsync();

        Console.WriteLine($"Review added/updated for user {username} on show {showTitle}.");
        return true;
    }

    public async Task<bool> DeleteReviewAsync(string username, string showTitle)
    {
        using var client = new GraphClient(new Uri("http://localhost:7474"), "neo4j", "8vR@JaRJU-SL7Hr");
        await client.ConnectAsync();

        var review = await client.Cypher
            .Match("(u:User {username: $username})-[w:WATCHED]->(s:Show {title: $showTitle})")
            .Where("w.rating IS NOT NULL OR w.comment IS NOT NULL")
            .WithParams(new { username, showTitle })
            .Return(w => w.As<Watched>())
            .ResultsAsync;

        if (!review.Any())
        {
            Console.WriteLine($"No review exists for user {username} on show {showTitle}.");
            return false;
        }

        await client.Cypher
            .Match("(u:User {username: $username})-[w:WATCHED]->(s:Show {title: $showTitle})")
            .WithParams(new { username, showTitle })
            .Remove("w.rating, w.comment")
            .ExecuteWithoutResultsAsync();

        Console.WriteLine($"Review successfully deleted for user {username} on show {showTitle}.");
        return true;
    }

    #endregion

    public async Task<(int WatchedCount, int WatchingCount, int PlanToWatchCount, int FollowersCount)> GetUserStatsAsync(string username)
    {
        using var client = new GraphClient(new Uri("http://localhost:7474"), "neo4j", "8vR@JaRJU-SL7Hr");
        await client.ConnectAsync();

        var query = client.Cypher
            .Match("(u:User {username: $username})")
            .WithParam("username", username)
            .OptionalMatch("(u)-[:WATCHED]->(w:Show)")
            .OptionalMatch("(u)-[:WATCHING]->(q:Show)")
            .OptionalMatch("(u)-[:YET_TO_WATCH]->(p:Show)")
            .OptionalMatch("(u)<-[:FOLLOWS]-(f:User)")
            // Vraćanje podataka o broju serija i korisnika koji prate
            .Return((w, q, p, f) => new
            {
                WatchedCount = w.Count(),
                WatchingCount = q.Count(),
                PlanToWatchCount = p.Count(),
                FollowersCount = f.Count()
            });

        var result = await query.ResultsAsync;
        var data = result.FirstOrDefault();

        Console.WriteLine("DATA:" + data);

        if (data != null)
            return ((int)data.WatchedCount, (int)data.WatchingCount, (int)data.PlanToWatchCount, (int)data.FollowersCount);

        return (0, 0, 0, 0);
    }

    public async Task<bool> UpdateUserProfilePictureAsync(string username, string fileUrl)
    {
        try
        {
            using var client = new GraphClient(new Uri("http://localhost:7474"), "neo4j", "8vR@JaRJU-SL7Hr");
            await client.ConnectAsync();

            var query = client.Cypher
                .Match("(u:User {username: $username})")
                .WithParam("username", username)
                .Set("u.picture = $fileUrl")
                .WithParam("fileUrl", fileUrl)
                .Return((u) => u.As<User>());

            var result = await query.ResultsAsync;

            return result.Any();
        }
        catch (Exception ex)
        {
            Console.WriteLine($"Error updating profile picture: {ex.Message}");
            return false;
        }
    }
}