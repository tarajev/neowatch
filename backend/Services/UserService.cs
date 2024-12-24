using Neo4jClient;
using NeoWatch.Model;

namespace NeoWatch.Services;

public class UserService
{
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
}