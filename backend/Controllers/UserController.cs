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

    [HttpGet("GetUserCounts")]
    public async Task<IActionResult> GetUserCount()
    {
        var count = await _userService.GetUserCountsAsync();
        return Ok(count); 
    }

    [AllowAnonymous]
    [HttpGet("FindUsers/{search}/{role}")]
    public async Task<IActionResult> FindUsers(string search, string role)
    {
        List<User>? users = await _userService.SearchForUsersAsync(search, role);
        return Ok(users);
    }

    [HttpGet("FindUsersByEmail/{search}/{role}")]
    public async Task<IActionResult> FindUsersByEmail(string search, string role)
    {
        List<User>? users = await _userService.SearchForUsersByEmailAsync(search, role);
        return Ok(users);
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

    [HttpPut("UploadProfilePicture/{username}")]
    public async Task<IActionResult> UploadProfilePicture(IFormFile file, string username)
    {
        if (file == null || file.Length == 0)
            return BadRequest("No file uploaded");

        if (file.Length > 1000000)
            return BadRequest("File size too large!");

        var profile = await _userService.GetUserAsync(username);
        if (profile == null)
            return NotFound("User doesn't exist.");

        var uploadsFolder = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot", "UploadedFiles");
        if (!Directory.Exists(uploadsFolder))
            Directory.CreateDirectory(uploadsFolder);

        var fileExtension = Path.GetExtension(file.FileName);
        var fileName = username + fileExtension;
        var filePath = Path.Combine(uploadsFolder, fileName);

        if (System.IO.File.Exists(filePath))
            System.IO.File.Delete(filePath);

        using (var stream = new FileStream(filePath, FileMode.Create))
        {
            await file.CopyToAsync(stream);
        }

        var fileUrl = $"/UploadedFiles/{fileName}";

        bool updateSuccess = await _userService.UpdateUserProfilePictureAsync(username, fileUrl);

        if (!updateSuccess)
            return StatusCode(500, "Failed to update user profile picture.");

        return Ok(new { fileUrl });
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

    [HttpGet("GetUserFollowers/{username}")]
    public async Task<IActionResult> GetUserFollowers(string username)
    {
        List<User>? users = await _userService.GetUserFollowersAsync(username);

        if (users != null)
            return Ok(users);
        else
            return BadRequest("Korisnik sa zadatim korisničkim imenom ne postoji.");
    }

    [HttpGet("GetUserFollowings/{username}")]
    public async Task<IActionResult> GetUserFollowings(string username)
    {
        List<User>? users = await _userService.GetUserFollowingsAsync(username);

        if (users != null)
            return Ok(users);
        else
            return BadRequest("Korisnik sa zadatim korisničkim imenom ne postoji.");
    }

    [HttpGet("IsUserFollowing/{username}/{userToCheck}")]

    public async Task<IActionResult> IsUserFollowing(string username, string userToCheck)
    {
        bool? follows = await _userService.IsUserFollowingAsync(username, userToCheck);

        if (follows != null)
            return Ok(follows);
        else
            return BadRequest("");
    }

    [HttpPut("FollowUser/{username}/{userToFollow}")]
    public async Task<IActionResult> FollowUser(string username, string userToFollow)
    {
        bool followed = await _userService.FollowUserAsync(username, userToFollow);
        return Ok($"Korisnik je {(followed ? "uspešno" : "neuspešno")} zapraćen.");
    }

    [HttpPut("UnfollowUser/{username}/{userToUnfollow}")]
    public async Task<IActionResult> UnfollowUser(string username, string userToUnfollow)
    {
        bool unfollowed = await _userService.UnfollowUserAsync(username, userToUnfollow);
        return Ok($"Korisnik {username} je {(unfollowed ? "uspešno" : "neuspešno")} otpratio korisnika {userToUnfollow}");
    }

    #endregion

    #region Shows

    [AllowAnonymous]
    [HttpGet("GetShowsToWatch/{username}")]
    public async Task<IActionResult> GetShowsToWatch(string username)
    {
        var shows = await _userService.GetShowsToWatchAsync(username);

        if (shows != null)
        {
            if (shows.Count > 0) return Ok(shows);
            else return NotFound("Korisnik nema serija koje planira da gleda.");
        }
        else
        {
            return BadRequest("Korisnik sa zadatim korisničkim imenom ne postoji.");
        }
    }

    [AllowAnonymous]
    [HttpGet("GetShowsWatched/{username}")]
    public async Task<IActionResult> GetShowsWatched(string username)
    {
        var shows = await _userService.GetShowsWatchedAsync(username);

        if (shows != null)
        {
            if (shows.Count > 0) return Ok(shows);
            else return NotFound("Korisnik nema serija koje je gledao.");
        }
        else
        {
            return BadRequest("Korisnik sa zadatim korisničkim imenom ne postoji.");
        }
    }

    [AllowAnonymous]
    [HttpGet("GetShowsWatching/{username}")]
    public async Task<IActionResult> GetShowsWatching(string username)
    {
        var shows = await _userService.GetShowsWatchingAsync(username);

        if (shows != null)
        {
            if (shows.Count > 0) return Ok(shows);
            else return NotFound("Korisnik nema serija koje gleda.");
        }
        else
        {
            return BadRequest("Korisnik sa zadatim korisničkim imenom ne postoji.");
        }
    }

    [HttpPut("AddShowToWatch")]
    public async Task<IActionResult> AddShowToWatch([FromBody] WatchInfo data)
    {
        bool? added = await _userService.AddShowToWatchAsync(data.Username, data.TvShowTitle);

        if (added == true)
            return Ok($"Uspešno dodata serija {data.TvShowTitle} korisniku {data.Username} u listi koju je korisnik planira da gleda.");
        if (added == false)
            return BadRequest("Nemoguće prebaciti seriju iz liste odgledatih serija koje imaju recenziju. Prvo obrišite recenziju.");
        else
            return BadRequest("Korisnik ili serija sa zadatim imenom ne postoji.");
    }

    [HttpPut("AddShowWatched")]
    public async Task<IActionResult> AddShowWatched([FromBody] WatchInfo data)
    {
        bool added = await _userService.AddShowWatchedAsync(data.Username, data.TvShowTitle);

        if (added)
            return Ok($"Uspešno dodata serija {data.TvShowTitle} korisniku {data.Username} u listu koju je korisnik odgledao.");
        else
            return BadRequest("Korisnik ili serija sa zadatim imenom ne postoji.");
    }

    [HttpPut("AddShowWatching")]
    public async Task<IActionResult> AddShowWatching([FromBody] WatchInfo data)
    {
        bool? added = await _userService.AddShowWatchingAsync(data.Username, data.TvShowTitle);

        if (added == true)
            return Ok($"Uspešno dodata serija {data.TvShowTitle} korisniku {data.Username} u listi koju korisnik gleda.");
        if (added == false)
            return BadRequest("Nemoguće prebaciti seriju iz liste odgledatih serija koje imaju recenziju. Prvo obrišite recenziju.");
        else
            return BadRequest("Korisnik ili serija sa zadatim imenom ne postoji.");
    }

    [HttpGet("GetReview")]
    public async Task<IActionResult> GetReview(string username, string showTitle)
    {
        var review = await _userService.GetReviewAsync(username, showTitle);

        if (review != null)
            return Ok($"Recenzija korisnika {username}:\nOcena: {review.FirstOrDefault().Key}\n{review.FirstOrDefault().Value}");
        else
            return BadRequest("Korisnik nema recenziju za ovu seriju.");
    }

    [HttpPut("AddReview")]
    public async Task<IActionResult> AddReview([FromBody] ReviewInfo data)
    {
        var review = await _userService.AddReviewAsync(data.Username, data.Title, data.Rating, data.Comment ?? "");

        if (review)
            return Ok($"Uspešno dodata recenzija.");
        else
            return BadRequest("Nemoguće dodati recenziju za seriju koju korisnik nije odgledao.");
    }

    [HttpDelete("DeleteReview")]
    public async Task<IActionResult> DeleteReview([FromQuery] string username, [FromQuery] string tvShowTitle)
    {
        var review = await _userService.DeleteReviewAsync(username, tvShowTitle);

        if (review)
            return Ok($"Uspešno obrisana recenzija.");
        else
            return BadRequest("Nemoguće obrisati recenziju koja ne postoji.");
    }

    #endregion

    [AllowAnonymous]
    [HttpGet("GetUserStats/{username}")]
    public async Task<IActionResult> GetUserStats(string username)
    {
        var (WatchedCount, WatchingCount, PlanToWatchCount, FollowersCount) = await _userService.GetUserStatsAsync(username);
        return Ok(new
        {
            WatchedCount,
            WatchingCount,
            PlanToWatchCount,
            FollowersCount
        });
    }
}

public class WatchInfo
{
    public required string Username { get; set; }
    public required string TvShowTitle { get; set; }
}


public class ReviewInfo //mozemo da dodamo ovo u watched isto kako god ne znam
{
    public required string Username { get; set; }
    public required string Title { get; set; }
    public required int Rating { get; set; }
    public string? Comment { get; set; }
}