using Microsoft.AspNetCore.Authentication.OAuth.Claims;
using Microsoft.AspNetCore.Mvc;
using Microsoft.IdentityModel.Tokens;
using NeoWatch.Model;
using NeoWatch.Services;

[Route("Auth")]
public class AuthController : ControllerBase
{
    private readonly IConfiguration _configuration;
    private readonly UserService _userService;
    public AuthController(IConfiguration c, UserService userService)
    {
        _configuration = c;
        _userService = userService;
    }

    [HttpPost("Login")]
    public async Task<IActionResult> Login([FromBody] LoginRequest request)
    {
        var user = await AuthService.GetUserByEmailAsync(request.Email);

        if (user != null)
        {
            var token = AuthService.GenerateJwtToken(_configuration, user);
            var response = new {
                user = user,
                jwtToken = token
            };
            return Ok(response);
        }

        return BadRequest("Pogrešno uneti podaci.");
    }

    [HttpPost("Register")]
    public async Task<IActionResult> Register([FromBody] RegisterInfo request)
    {
        var user = await _userService.GetUserAsync(request.Username);
        var checkEmail = await AuthService.CheckEmail(request.Email);

        if (user == null && !checkEmail)
        {
            var newUser = new User
            {
                username = request.Username,
                email = request.Email,
                password = request.Password,
                role = "User",
                joinedDate = DateTime.Now
            };

            var result = await _userService.CreateUserAsync(newUser);
            if (result != null)
            {
                var token = AuthService.GenerateJwtToken(_configuration, newUser);
                return Ok(new { Message = "Korisnik je uspešno kreiran.", Token = token });
            }
            return BadRequest("Došlo je do greške pri kreiranju korisnika");
        }

        return BadRequest("Ovaj korisnik već postoji.");
    }

}

public class LoginRequest //ovo premestiti negde?
{
    public required string Email { get; set; }
    public required string Password { get; set; }
}

public class RegisterInfo
{
    public required string Email { get; set; }
    public required string Username { get; set; }
    public required string Password { get; set; }

}
