using Microsoft.IdentityModel.Tokens;
using Neo4j.Driver;
using Neo4jClient;
using Neo4jClient.Cypher;
using NeoWatch.Model;

namespace NeoWatch.Services;

public class ActorService
{
    public async Task<Actor?> GetActorByNameAsync(string name)
    {
        using var client = new GraphClient(new Uri("http://localhost:7474"), "neo4j", "8vR@JaRJU-SL7Hr");
        await client.ConnectAsync();

        var query = client.Cypher
            .Match("(a:Actor {name: $name})")
            .OptionalMatch("(a:Actor)-[:ACTED_IN]->(s:Show)")
            .WithParam("name", name)
            .Return((s, a) => new
            {
                Actor = a.As<Actor>(),
                Shows = s.CollectAs<Show>()
            });

        var result = await query.ResultsAsync;

        var showData = result.FirstOrDefault();

        if (showData != null)
        {

            var actor = new Actor
            {
                name = showData.Actor.name,
                dob = showData.Actor.dob,
                bio = showData.Actor.bio,
                shows = showData.Actor.shows,
            };

            return actor;
        }

        return null;
    }

    public async Task<Actor?> CreateActorAsync(Actor actor) //proveriti jel radi samo kad se kreira MORAMO DA PROSLEDIMO SVE PODATKE
    {
        using var client = new GraphClient(new Uri("http://localhost:7474"), "neo4j", "8vR@JaRJU-SL7Hr");
        try
        {
            await client.ConnectAsync();
        }
        catch (Exception ex)
        {
            Console.WriteLine($"Error connecting to database: {ex.Message}");
            return null;
        }

        var query = client.Cypher
            .Merge("(a:Actor {name: $name})")
            .WithParam("name", actor.name)
            .OnCreate()
            .Set("a.bio = $bio, a.dob = $dob")
            .WithParam("bio", actor.bio)
            .WithParam("dob", actor.dob);

        var result = await query.Return((a) => a.As<Actor>()).ResultsAsync;

        return result.First();
    }

    public async Task<Actor?> UpdateActorAsync(Actor actor) // update samo osnovnih informacija ne i serija! 
    {
        using var client = new GraphClient(new Uri("http://localhost:7474"), "neo4j", "8vR@JaRJU-SL7Hr");
        await client.ConnectAsync();

        var query = client.Cypher
            .Match("(a:Actor {name: $name})")
            .WithParam("name", actor.name);

        if (!string.IsNullOrWhiteSpace(actor.bio))
        {
            query = query.Set("a.bio = $bio").WithParam("bio", actor.bio);
        }

        if (!string.IsNullOrWhiteSpace(actor.dob))
        {
            query = query.Set("a.dob = $dob").WithParam("dob", actor.dob);
        }

        var result = await query.Return(a => a.As<Actor>()).ResultsAsync;

        return result.FirstOrDefault();
    }

    public async Task<Actor> DeleteAnActorAsync(string name)
    {
        using var client = new GraphClient(new Uri("http://localhost:7474"), "neo4j", "8vR@JaRJU-SL7Hr");
        await client.ConnectAsync();

        var query = client.Cypher
            .Match("(a:Actor {name: $name})")
            .WithParam("name", name)
            .DetachDelete("a").Return(a => a.As<Actor>());

        var result = await query.ResultsAsync; //vrati ce objekat ciji su properti setovani na null 

        return result.First();

    }

    //ova funkcija povezuje seriju sa glumcem, serija mora da već postoji (tako nam je najlogičnije), dodajemo joj glumca ili glumcu seriju kako god,
    //merge će proveriti da li taj glumac postoji ako ne postoji kreiraće ga (svakako bi se radio match pa nista ne gubimo)
    public async Task<ActedIn?> LinkTVShowAndActor(string actorName, string showTitle, string role)
    {
        using var client = new GraphClient(new Uri("http://localhost:7474"), "neo4j", "8vR@JaRJU-SL7Hr");
        await client.ConnectAsync();


        var findTheShow = client.Cypher //prvo proveravamo da li serija postoji, ako ne postoji dobija se poruka da je neophodno prvo je kreirati
            .Match("(s:Show {title: $showTitle})")
            .WithParam("showTitle", showTitle)
            .Return(() => Return.As<string>("s.title"));

        var result = await findTheShow.ResultsAsync;

        if (!result.Any() || result.First().IsNullOrEmpty())
            return null;

        var query = client.Cypher
            .Match("(s:Show {title: $showTitle})")
            .WithParam("showTitle", showTitle)
            .Merge("(a:Actor {name: $actorName})")
            .WithParam("actorName", actorName)
            .Merge("(s)<-[r:ACTED_IN]-(a)")
            .OnCreate()
            .Set("r.role = $role")
            .WithParam("role", role)
            .Return((r) => r.As<ActedIn>());//morala sam da kreiram klasu za ovo videti da li moze kako drugacije

        var relationship = await query.ResultsAsync;

        return relationship.First();
    }

}
