using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using NeoWatch.Model;
using NeoWatch.Services;

[Route("User")]
[Authorize(Roles = "User,Moderator")]
public class UserController : ControllerBase
{
    private readonly UserService _userService;

    public UserController(UserService userService)
    {
        _userService = userService;
    }

    #region User CRUD

    [AllowAnonymous]
    [HttpGet("GetAllUsers")]
    public async Task<IActionResult> GetAllUsers()
    {
        var users = await _userService.GetAllUsersAsync();
        return Ok(users);
    }

    [AllowAnonymous]
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
            return Ok($"Uspešno izmenjene informacije korisnika sa korisničkim imenom: {user.username}");
        else
            return BadRequest("Nije moguće izmeniti informacije korisnika.");
    }

    [HttpDelete("DeleteUser")]
    public async Task<IActionResult> DeleteUser(string username)
    {
        var user = await _userService.DeleteUserAsync(username);

        if (user != null)
            return Ok("Korisnik uspešno obrisan.");
        else
            return BadRequest("Korisnik ne postoji");
    }

    #endregion

    #region Following

    [HttpGet("GetUserFollowers")]
    public async Task<IActionResult> GetUserFollowers(string username)
    {
        List<User>? users = await _userService.GetUserFollowersAsync(username);

        if (users != null)
            return Ok(users);
        else
            return BadRequest("Korisnik sa zadatim korisničkim imenom ne postoji.");
    }

    [HttpGet("GetUserFollowings")]
    public async Task<IActionResult> GetUserFollowings(string username)
    {
        List<User>? users = await _userService.GetUserFollowingsAsync(username);

        if (users != null)
            return Ok(users);
        else
            return BadRequest("Korisnik sa zadatim korisničkim imenom ne postoji.");
    }

    [HttpPut("FollowUser")]
    public async Task<IActionResult> FollowUser(string username, string userToFollow)
    {
        bool followed = await _userService.FollowUserAsync(username, userToFollow);
        return Ok($"Korisnik je {(followed ? "uspešno" : "neuspešno")} zapraćen.");
    }

    [HttpPut("UnfollowUser")]
    public async Task<IActionResult> UnfollowUser(string username, string userToUnfollow)
    {
        bool unfollowed = await _userService.UnfollowUserAsync(username, userToUnfollow);
        return Ok($"Korisnik {username} je {(unfollowed ? "uspešno" : "neuspešno")} otpratio korisnika {userToUnfollow}");
    }

    #endregion

    #region Shows


    [HttpGet("GetUserStats/{username}")]
    public async Task<IActionResult> GetUserStats(string username)
    {
        var data = await _userService.GetUserStatsAsync(username);
        return Ok(new
        {
            data.WatchedCount,
            data.WatchingCount,
            data.FollowersCount
        });
    }


    #endregion
}