using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Neo4jClient.Cypher;
using NeoWatch.Model;
using NeoWatch.Services;

[Route("Genre")]
[Authorize(Roles = "Moderator")]
public class GenreController : ControllerBase
{
    private readonly GenreService _genreService;

    public GenreController(GenreService genreService)
    {
        _genreService = genreService;
    }

    [AllowAnonymous]
    [HttpGet("GetAllGenres")]
    public async Task<IActionResult> GetAllGenres()
    {
        var genres = await _genreService.GetAllGenres();
        return Ok(genres);
    }
}
