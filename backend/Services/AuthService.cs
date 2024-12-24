
using System.IdentityModel.Tokens.Jwt;
using Microsoft.Extensions.Primitives;
using System.Security.Claims;
using System.Text;
using Microsoft.IdentityModel.Tokens;
using NeoWatch.Model;
using Microsoft.IdentityModel.JsonWebTokens;

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

}