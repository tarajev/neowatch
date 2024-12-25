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
        User? showData = result?.FirstOrDefault();

        if (showData != null)
            showData.password = ""; //treba da se hashuje ovo lol 

        return showData;
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

    // TODO da se uradi za serije koje je gledao i koje planira da gleda.

    #endregion
}