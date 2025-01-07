using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Neo4jClient.Cypher;
using NeoWatch.Model;
using NeoWatch.Services;

[Route("Actor")]
[Authorize(Roles = "Moderator")]
public class ActorController : ControllerBase
{
    private readonly ActorService _actorService;

    public ActorController(ActorService actorService)
    {
        _actorService = actorService;
    }

    [AllowAnonymous]
    [HttpGet("GetActorByName/{name}")]
    public async Task<IActionResult> GetActorByName(string name)
    {
        var show = await _actorService.GetActorByNameAsync(name);
        return Ok(show);
    }

    [HttpPost("CreateAnActor")]
    public async Task<IActionResult> CreateAnActor([FromBody] Actor newActor)
    {
        var actor = await _actorService.CreateActorAsync(newActor);
        return Ok("Uspešno kreiran glumac/glumica.");
    }

    [HttpDelete("DeleteAnActor/{name}")]
    public async Task<IActionResult> DeleteAnActor(string name)
    {
        var actor = await _actorService.DeleteAnActorAsync(name);
        if (actor.name == null)
            return Ok("Uspešno obrisan/a glumac/glumica.");
        else return BadRequest($"Doslo je do greške prilikom brisanja glumca: {name}");
    }

    [HttpPost("LinkTVShowAndActor/{showTitle}/{actorName}/{role}")]
    public async Task<IActionResult> LinkTvShowAndActor(string showTitle, string actorName, string role)
    {
        var r = await _actorService.LinkTVShowAndActor(actorName, showTitle, role);
        if (r == null)
            return BadRequest("Došlo je do greške");
        return Ok($"Uspešno povezani serija: {showTitle} i {actorName}, uloga: {r.role}");
    }

}
