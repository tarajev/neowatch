
using System.IdentityModel.Tokens.Jwt;
using Microsoft.Extensions.Primitives;
using System.Security.Claims;
using System.Text;
using Microsoft.IdentityModel.Tokens;
using NeoWatch.Model;
using Microsoft.IdentityModel.JsonWebTokens;
using Neo4jClient;
using Neo4jClient.Cypher;
using Microsoft.AspNetCore.Mvc;

namespace NeoWatch.Services;

public class AuthService
{
    public static string GenerateJwtToken(IConfiguration _configuration, User user)
    {
        string key = _configuration["Jwt:Secret"];
        var securityKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(key));

        var credentials = new SigningCredentials(securityKey, SecurityAlgorithms.HmacSha256);

        var tokenDescriptor = new SecurityTokenDescriptor
        {
            Subject = new ClaimsIdentity(
        [
            new Claim(ClaimTypes.Role, user.role),
            new Claim(ClaimTypes.Name, user.username),
            new Claim(ClaimTypes.Email, user.email)
        ]),
            Expires = DateTime.UtcNow.AddMinutes(120),
            SigningCredentials = credentials,
            Issuer = _configuration["Jwt:Issuer"],
            Audience = _configuration["Jwt:Issuer"],
        };

        var handler = new JsonWebTokenHandler();
        var token = handler.CreateToken(tokenDescriptor);

        return token;
    }

    public static async Task<bool> CheckEmail(string email)
    {
        using var client = new GraphClient(new Uri("http://localhost:7474"), "neo4j", "8vR@JaRJU-SL7Hr");
        await client.ConnectAsync();

        var query = client.Cypher
            .Match("(u:User {email: $email})")
            .WithParam("email", email)
            .Return(u => u.Count() > 0);

        // Rezultat vraća true ako postoji čvor sa zadatim emailom
        var result = await query.ResultsAsync;
        return result.FirstOrDefault();
    }

    public static async Task<User?> GetUserByEmailAsync(string email) //mozemo da prebacimo i u User-a ali se koristi samo kod logovanja
    {
        using var client = new GraphClient(new Uri("http://localhost:7474"), "neo4j", "8vR@JaRJU-SL7Hr");
        await client.ConnectAsync();

        var query = client.Cypher
            .Match("(u:User {email: $email})")
            .WithParam("email", email)
            .Return(u => u.As<User>());

        // Rezultat vraća true ako postoji barem jedan čvor sa zadatim emailom
        var result = await query.ResultsAsync;
        User? user = result?.FirstOrDefault();

        if (user != null)
            user.password = ""; //treba da se hashuje ovo lol 

        return user;
    }
}