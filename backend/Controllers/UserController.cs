using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Neo4jClient.Cypher;
using NeoWatch.Model;
using NeoWatch.Services;

[Authorize(Roles = "User,Moderator")]
public class UserController : ControllerBase
{
    private readonly UserService _userService;

    public UserController(UserService userService)
    {
        _userService = userService;
    }

    [HttpGet("GetAllUsers")]
    public async Task<IActionResult> GetUserByUsername()
    {
        var users = await _userService.GetAllUsersAsync();
        return Ok(users);
    }

    [HttpGet("GetUserByUsername/{username}")]
    public async Task<IActionResult> GetUserByUsername(string username)
    {
        var user = await _userService.GetUserAsync(username);
        return Ok(user);
    }

    [AllowAnonymous]
    [HttpPost("CreateUser")]
    public async Task<IActionResult> CreateUser([FromBody] User newUser)
    {
        var user = await _userService.CreateUserAsync(newUser);

        if (user != null)
            return Ok($"Uspešno dodat novi korisnik sa korisničkim imenom: {user!.username}");
        else
            return BadRequest("Nije moguce kreirati korisnika");
    }

    [HttpPut("UpdateUser")]
    public async Task<IActionResult> UpdateUser([FromBody] User updatedUser)
    {
        var user = await _userService.UpdateUserAsync(updatedUser);

        if (user != null)
            return Ok($"Uspešno izmenjene informacije korisnika sa korisničkim imenom:");
        else
            return BadRequest("Nije moguće izmeniti informacije korisnika.");
    }
}