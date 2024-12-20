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
    public async Task<IActionResult> CreateAShow([FromBody] Show newShow){
        var show = await _showService.CreateShowAsync(newShow);
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
    public async Task<IActionResult> DeleteAShow(string title){
        var show = await _showService.DeleteAShow(title);
        if(show.title == null)
        return Ok("Uspešno obrisana serija.");
        else return BadRequest($"Doslo je do greške prilikom brisanja serije {title}");
    }

}
