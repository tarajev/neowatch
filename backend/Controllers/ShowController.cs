using Microsoft.AspNetCore.Mvc;
using Neo4jClient.Cypher;
using NeoWatch.Model;
using NeoWatch.Services;

public class ShowController : ControllerBase
{
    private readonly ShowService _showService;

    // Konstruktor koji prima konkretnu instancu ShowService
    public ShowController(ShowService ShowService)
    {
        _showService = ShowService;
    }

    [HttpGet("GetShowByTitle/{title}")]
    public async Task<IActionResult> GetShowByTitle(string title)
    {
        var show = await _showService.GetShowByTitleAsync(title);
        return Ok(show);
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

    [HttpGet("GetAllShows")]
    public async Task<IActionResult> GetAllShows()
    {
        var show = await _showService.GetAllShows();
        if (show != null)
            return Ok(show);
        else
            return BadRequest("No shows found.");
    }

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

}
