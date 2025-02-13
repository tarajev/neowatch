using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Neo4jClient.Cypher;
using NeoWatch.Model;
using NeoWatch.Services;

[Route("Show")]
[Authorize(Roles = "User,Moderator")]
public class ShowController : ControllerBase
{
    private readonly ShowService _showService;

    // Konstruktor koji prima konkretnu instancu ShowService
    public ShowController(ShowService ShowService)
    {
        _showService = ShowService;
    }

    [AllowAnonymous]
    [HttpGet("GetShowByTitle/{title}")]
    public async Task<IActionResult> GetShowByTitle(string title)
    {
        var show = await _showService.GetShowByTitleAsync(title);
        return Ok(show);
    }

    [HttpGet("GetShowCount")]
    public async Task<IActionResult> GetUserCount()
    {
        var count = await _showService.GetShowCountAsync();
        return Ok(count); 
    }

    [HttpPost("CreateAShow")]
    public async Task<IActionResult> CreateAShow([FromBody] Show newShow)
    {

        if (newShow == null)
        {
            return BadRequest("Serija nije prosleđena.");
        }

        var show = await _showService.CreateShowAsync(newShow);
       if (show == null)
        {
            return StatusCode(500, "Došlo je do greške pri kreiranju serije.");
        }

        return Ok("Uspesno dodata serija"); 
    }

    [HttpPut("UploadShowThumbnail/{showTitle}")]
    public async Task<IActionResult> UploadShowThumbnail(IFormFile file, string showTitle)
    {
        if (file == null || file.Length == 0)
            return BadRequest("No file uploaded");

        if (file.Length > 1000000)
            return BadRequest("File size too large!");

        var show = await _showService.GetShowByTitleAsync(showTitle);
        if (show == null)
            return NotFound("Show doesn't exist.");

        var uploadsFolder = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot", "UploadedFiles", "Shows");
        if (!Directory.Exists(uploadsFolder))
            Directory.CreateDirectory(uploadsFolder);

        var fileExtension = Path.GetExtension(file.FileName);
        var fileName = show.title + fileExtension;
        var filePath = Path.Combine(uploadsFolder, fileName);

        if (System.IO.File.Exists(filePath))
            System.IO.File.Delete(filePath);

        using (var stream = new FileStream(filePath, FileMode.Create))
        {
            await file.CopyToAsync(stream);
        }

        var fileUrl = $"/UploadedFiles/Shows/{fileName}";

        bool updateSuccess = await _showService.UpdateShowThumbnailAsync(showTitle, fileUrl);

        if (!updateSuccess)
            return StatusCode(500, "Failed to update show thumbnail.");

        return Ok(new { fileUrl });
    }


    [HttpPut("UpdateAShow/{oldTitle}")]
    public async Task<IActionResult> UpdateAShow([FromBody] Show show, string oldTitle)
    {
        var data = await _showService.UpdateShowAsync(show, oldTitle);

        if (show == null)
        {
            return BadRequest("Serija nije prosleđena.");
        }

        if (data == null)
        {
            return StatusCode(500, "Došlo je do greške pri ažuriranju serije.");
        }

        return Ok("Uspešno ažurirana serija.");
    }

    [AllowAnonymous]
    [HttpGet("GetAllShows")]
    public async Task<IActionResult> GetAllShows()
    {
        var show = await _showService.GetAllShows();
        if (show != null)
            return Ok(show);
        else
            return BadRequest("No shows found.");
    }

    [Authorize(Roles = "Moderator")]
    [HttpDelete("DeleteAShow/{title}")]
    public async Task<IActionResult> DeleteAShow(string title)
    {
        var show = await _showService.DeleteAShow(title);
        if (show.title == null)
            return Ok("Uspešno obrisana serija.");
        else return BadRequest($"Doslo je do greške prilikom brisanja serije {title}");
    }

    [HttpPut("UpdateARating/{title}/{rating}")]
    public async Task<IActionResult> UpdateTheRating(string title, double rating)
    {
        var newRating = await _showService.UpdateTheRating(title, rating);

        if (newRating == -1)
            return BadRequest("Došlo je do greške prilikom ažuriranja ocene");

        return Ok($"Nova ocena je {newRating}");

    }

    [Authorize(Roles = "User")]
    [HttpGet("GetRecommendations/{username}")]
    public async Task<IActionResult> GetRecommendations(string username)
    {
        var shows = await _showService.RecommendTVShows(username);
        return Ok(shows);
    }

    [Authorize(Roles = "User")]
    [HttpGet("FriendsWatchList/{username}")]
    public async Task<IActionResult> FriendsWatchList(string username)
    {
        var shows = await _showService.WhatFriendsAreWatching(username);
        return Ok(shows);
    }

    [AllowAnonymous]
    [HttpGet("SearchShowsByGenre")]
    public async Task<IActionResult> SearchShowByGenre([FromQuery] List<string> genres)
    {
        var shows = await _showService.SearchShowsByGenre(genres);
        if (shows.Count == 0)
            return BadRequest("Nije pronadjena nijedna serija sa ovim žanrom");
        return Ok(shows);
    }

    [AllowAnonymous]
    [HttpGet("SearchShowsByActor/{actorName}")]
    public async Task<IActionResult> SearchShowByActor(string actorName)
    {
        var shows = await _showService.SearchShowsByActor(actorName);
        if (shows.Count == 0)
            return BadRequest("Nije pronadjena nijedna serija sa ovim glumcem");
        return Ok(shows);
    }


    [AllowAnonymous]
    [HttpGet("GetMostWatchedShows")]
    public async Task<IActionResult> GetMostedWatchedShows()
    {
        var shows = await _showService.FindMostWatchedShows();
        if (shows.Count == 0)
            return BadRequest("Nije pronadjena nijedna serija");
        return Ok(shows);
    }

    [AllowAnonymous]
    [HttpGet("SearchShowByTitle/{search}")]
    public async Task<IActionResult> SearchShowByTitle(string search)
    {
        var shows = await _showService.SearchShowsByTitle(search);
        if (shows.Count == 0)
            return BadRequest("Nije pronadjena nijedna serija");
        return Ok(shows);
    }

    [AllowAnonymous]
    [HttpGet("GetTvShowGenresAndActors/{showTitle}")]
    public async Task<IActionResult> GetTvShowGenresAndActors(string showTitle)
    {
        var result = await _showService.GetTvShowDetailsAsync(showTitle);
        if (result == null)
            return BadRequest("Došlo je do greške");

        return Ok(new
        {
            genres = result.genres,
            cast = result.cast
        });
    }
}
