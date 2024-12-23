using Neo4j.Driver;
using Neo4jClient;
using Neo4jClient.Cypher;
using NeoWatch.Model;

namespace NeoWatch.Services;
public class ShowService
{
    private readonly IDriver _driver;

    public ShowService(IDriver driver)
    {
        _driver = driver;
    }

    /*
        public async Task<Show?> GetShowByTitleAsync(string title)
        {

            var query = @"
                MATCH (s:Show {title: $title})
                RETURN s {
                .*, genres: [(g:Genre)<-[:IN_GENRE]-(s) | g{.name}],
                actors: [(s:Show)<-[:ACTED_IN]-(a) | a{.name}]
                } AS show";


            using var session = _driver.AsyncSession();

            var records = await session.ExecuteReadAsync(async tx =>
            {
                var cursor = await tx.RunAsync(query, new {title});
                return await cursor.SingleAsync();
            });

            if(records.Count() == 0){
                return null; //nez vrv treba neka obrada gresaka
            }

            var showNode =  records["show"].As<INode>();

            // Mapiranje rezultata u objekat Show
            var show = new Show
            {
                Title = showNode.Properties["title"].ToString(),
                Description = showNode.Properties["description"].ToString(),
                Year = showNode.Properties["year"].ToString(),
                ImageUrl = showNode.Properties.ContainsKey("imageUrl") ? showNode.Properties["imageUrl"].ToString() : null,
                Genres = (showNode.Properties["genres"] as List<object>)?.Select(g => new Genre { Name = g.ToString() }).ToList(),
                Cast = (showNode.Properties["actors"] as List<object>)?.Select(a => new Actor { Name = a.ToString() }).ToList()
            };

            return show;

        }
    */
    public async Task<Show?> GetShowByTitleAsync(string title)
    {
        using var client = new GraphClient(new Uri("http://localhost:7474"), "neo4j", "8vR@JaRJU-SL7Hr");
        await client.ConnectAsync(); //mozda treba neki try catch i mozda treba singleton pa da se client koristi drugacije 

        var query = client.Cypher
            .Match("(s:Show {title: $title})")
            .OptionalMatch("(g:Genre)<-[:IN_GENRE]-(s)")
            .OptionalMatch("(a:Actor)-[:ACTED_IN]->(s)")
            .WithParam("title", title)
            .Return((s, g, a) => new
            {
                Show = s.As<Show>(),
                Genres = g.CollectAs<Genre>(), //collect as vraca vise rezultata
                Actors = a.CollectAs<ActedIn>()
            });

        var result = await query.ResultsAsync;

        var showData = result.FirstOrDefault();

        if (showData != null)
        {

            var show = new Show
            {
                title = showData.Show.title,
                genres = showData.Genres.ToList(), //ovo ne vraca jer nije lepo kreirano
                cast = showData.Actors.ToList(), //izmena sada vraca objekat koji sadrzi glumca i njegovu ulogu 
                desc = showData.Show.desc,
                year = showData.Show.year
            };

            return show;
        }

        return null;
    }

    public async Task<Show?> CreateShowAsync(Show show) //treba izmeniti da prvo ide provera pa create
    {
        using var client = new GraphClient(new Uri("http://localhost:7474"), "neo4j", "8vR@JaRJU-SL7Hr");
        await client.ConnectAsync();

        var showFound = await client.Cypher.Match("(s:Show {title: $title})").Return((s) => s.As<Show>()).ResultsAsync;

        if (showFound == null)
            return null;

        // merge proveri da li postoji pre kreiranja
        var query = client.Cypher
            .Merge("(s:Show {title: $title})")
            .WithParam("title", show.title) //ovo ce proci iako serija postoji samo ce se dodati zanr prakticno radice kao apdejt onda mozemo to da promenimo ako zelis (promenila)
            .OnCreate()
            .Set("s.desc = $desc, s.year = $year")
            .WithParam("desc", show.desc)
            .WithParam("year", show.year);  //ovde ne dodajem rating jer rating u startu nema, tehnicki 

        foreach (var genre in show.genres)  //ako moze nekako pametnije (da se za sve zanrove izvrsi) be my guest
        {
            var index = show.genres.IndexOf(genre); //i za ovo, ne moze da se koristi ime jer ima razmak, vecina spec karaktera ne dolazi u obzir a ne zelim da transformisem string yippe sto bi kosta rekao
            var genreKey = $"g{index}"; //na frontendu osigurati da su uneseni razliciti zanrovi pls 
            query = query
                .Merge($"({genreKey}:Genre {{name: $gn_{index}}})")
                .WithParam($"gn_{index}", genre.name)
                .Merge($"(s)-[:IN_GENRE]->({genreKey})");
        }
        if (show.cast != null && show.cast.Count > 0)
        {
            foreach (var castMember in show.cast)
            {
                var index = show.cast.IndexOf(castMember);
                var actorKey = $"a{index}";
                var rKey = $"r{index}";
                query = query
                    .Merge($"({actorKey}:Actor {{name: $an_{index}}})")
                    .WithParam($"an_{index}", castMember.actor!.name)
                    .Merge($"(s)<-[{rKey}:ACTED_IN]-({actorKey})") //default relationship je left to right
                    .Set($"{rKey}.role = $role_{index}")
                    .WithParam($"role_{index}", castMember.role);
            }
        }

        var result = await query.Return((s) => s.As<Show>()).ResultsAsync;
        Console.WriteLine($"NASLOV SERIJE JE:::::::: {result.First().title}");

        return result.First();

    }


    public async Task<List<Show>> GetAllShows()
    { //vraća prvih 30

        using var client = new GraphClient(new Uri("http://localhost:7474"), "neo4j", "8vR@JaRJU-SL7Hr");
        await client.ConnectAsync();

        var query = client.Cypher
        .Match("(a:Actor)-[:ACTED_IN]->(s:Show)-[:IN_GENRE]->(g:Genre)")
        .With("s, COLLECT(DISTINCT g) AS genres, COLLECT(DISTINCT a) AS actors")  //ovo eliminise duplikate
        .Limit(30)
        .Return((s, genres, actors) => new
        {
            Show = s.As<Show>(),
            Genres = genres.As<List<Genre>>(),
            Actors = actors.As<List<ActedIn>>()
        });

        var result = await query.ResultsAsync;

        var shows = new List<Show>();

        foreach (var item in result)
        {
            var show = new Show
            {
                title = item.Show.title,
                year = item.Show.year,
                desc = item.Show.desc,
                imageUrl = item.Show.imageUrl,
                rating = item.Show.rating,
                genres = item.Genres.ToList(),
                cast = item.Actors.ToList()
            };

            shows.Add(show);
        }

        return shows;
    }

    public async Task<Show?> UpdateShowAsync(Show show, string oldTitle) //RATING NE MOZE DA SE APDEJTUJE ODAVDE (ovo sve rade moderatori) treba da postoji lista serija koju je moguce apdejtovati
    {
        using var client = new GraphClient(new Uri("http://localhost:7474"), "neo4j", "8vR@JaRJU-SL7Hr");
        await client.ConnectAsync();

        var query = client.Cypher
            .Match("(s:Show {title: $title})")
            .WithParam("title", oldTitle);

        if (!string.IsNullOrWhiteSpace(show.title))
        {
            query = query.Set("s.title = $t").WithParam("t", show.title);
        }

        if (!string.IsNullOrWhiteSpace(show.desc))
        {
            query = query.Set("s.desc = $desc").WithParam("desc", show.desc);
        }

        if (!string.IsNullOrWhiteSpace(show.year))
        {
            query = query.Set("s.year = $year").WithParam("year", show.year);
        }

        if (!string.IsNullOrWhiteSpace(show.year))
        {
            query = query.Set("s.imageUrl = $imageUrl").WithParam("imageUrl", show.imageUrl);
        }

        if (show.genres != null && show.genres.Any()) //treba da uradim za izbacivanje zanrova!! ?
        {
            foreach (var genre in show.genres)
            {
                var index = show.genres.IndexOf(genre);
                var genreKey = $"g{index}";
                query = query
                    .Merge($"({genreKey}:Genre {{name: $gn_{index}}})")
                    .WithParam($"gn_{index}", genre.name)
                    .Merge($"(s)-[:IN_GENRE]->({genreKey})");
            }
        }

        if (show.cast != null && show.cast.Any())
        {
            var existingActorsQuery = client.Cypher
                .Match("(s:Show {title: $title})<-[:ACTED_IN]-(a:Actor)")
                .WithParam("title", show.title)
                .Return(a => a.As<ActedIn>());

            var existingActors = (await existingActorsQuery.ResultsAsync).ToList();

            var actorsToRemove = existingActors.Where(ea => !show.cast.Any(newActor => newActor.actor.name == ea.actor.name)).ToList();
            foreach (var actorToRemove in actorsToRemove)
            {
                query = query
                    .Match("(s:Show {title: $title1})<-[:ACTED_IN]-(a:Actor)")
                    .Where("a.name = $actorName")
                    .WithParam("actorName", actorToRemove.actor.name)
                    .WithParam("title1", oldTitle)
                    .Delete("s<-[:ACTED_IN]-a");
            }

            foreach (var actor in show.cast)
            {
                var index = show.cast.IndexOf(actor);
                var actorKey = $"a{index}";
                query = query
                    .Merge($"({actorKey}:Actor {{name: $an_{index}}})")
                    .WithParam($"an_{index}", actor.actor.name)
                    .Merge($"(s)<-[:ACTED_IN]-({actorKey})");
            }
        }

        var result = await query.Return(s => s.As<Show>()).ResultsAsync;

        return result.FirstOrDefault();
    }

    public async Task<Show> DeleteAShow(string title)
    {
        using var client = new GraphClient(new Uri("http://localhost:7474"), "neo4j", "8vR@JaRJU-SL7Hr");
        await client.ConnectAsync();

        var query = client.Cypher
            .Match("(s:Show {title: $title})")
            .WithParam("title", title)
            .DetachDelete("s").Return(s => s.As<Show>());

        var result = await query.ResultsAsync; //vrati ce objekat ciji su properti setovani na null 

        return result.First();

    }
    public async Task<Double> UpdateTheRating(string title, double rating)
    {
        using var client = new GraphClient(new Uri("http://localhost:7474"), "neo4j", "8vR@JaRJU-SL7Hr");
        await client.ConnectAsync();

        var q = client.Cypher.Match("(s:Show {title: $title})")
        .WithParam("title", title)
        .Return(() => new { numberOfReviews = Return.As<int>("s.numberOfReviews"), previousRating = Return.As<Double>("s.rating") });

        var data = await q.ResultsAsync;
        var newNumberOfReviews = data.First().numberOfReviews + 1;
        var newRating = (data.First().previousRating * data.First().numberOfReviews + rating) / newNumberOfReviews;

        var query = client.Cypher
            .Match("(s:Show {title: $title})")
            .WithParam("title", title)
            .Set("s.rating = $rating, s.numberOfReviews = $numberOfReviews")
            .WithParam("rating", newRating)
            .WithParam("numberOfReviews", newNumberOfReviews)
            .Return(() => Return.As<Double>("s.rating"));

        var result = await query.ResultsAsync;

        if (!result.Any())
            return -1;

        return result.First();
    }

    public async Task<List<Show>> RecommendTVShows(string username)
    {

        using var client = new GraphClient(new Uri("http://localhost:7474"), "neo4j", "8vR@JaRJU-SL7Hr");
        await client.ConnectAsync();

        var query = client.Cypher
             .Match("(u:User {username: $username})-[r:WATCHED]->(s:Show)<-[:WATCHED]-(other:User)")
             .WithParam("username", username)
             .Where("u <> other AND r.rating >= 7")
             .With("u, other") //sad se nadalje koriste samo ovi korisnici koji su pronadjeni
             .Match("(other)-[w:WATCHED]->(recommended:Show)")
             .Where("NOT (u)-[w:WATCHED]->(recommended) AND w.rating >= 7")
             .With("recommended, count(*) AS count") //spaja seriju sa brojem njenih pojavljivanja "u jedan red"
             .OrderByDescending("count")
             .Limit(10)
             .Return((recommended) => recommended.As<Show>());

        var result = await query.ResultsAsync;

        return result.ToList();
    }

    public async Task<List<Show>> WhatFriendsAreWatching(string username)
    {

        using var client = new GraphClient(new Uri("http://localhost:7474"), "neo4j", "8vR@JaRJU-SL7Hr");
        await client.ConnectAsync();

        var query = client.Cypher
             .Match("(u:User {username: $username})-[f:FOLLOWING]->(friend:User)")
             .WithParam("username", username)
             .With("u, friend")
             .Match("(friend)-[w:WATCHED]->(s:Show)")
             .Where("NOT (u)-[w:WATCHED]->(s) AND w.rating >= 8")
             .With("s, count(*) AS count") //spaja seriju sa brojem njenih pojavljivanja "u jedan red"
             .OrderByDescending("count")
             .Limit(10)
             .Return((recommended) => recommended.As<Show>());

        var result = await query.ResultsAsync;

        return result.ToList();
    }
    public async Task<List<Show>> SearchShowsByGenre(List<string> genres)
    {

        using var client = new GraphClient(new Uri("http://localhost:7474"), "neo4j", "8vR@JaRJU-SL7Hr");
        await client.ConnectAsync();

        var genreNames = genres.Select(g => char.ToUpper(g[0]) + g[1..].ToLower()).ToList();

        var query = client.Cypher
         .Match("(s:Show)-[:IN_GENRE]->(g:Genre)")
         .Where("g.name IN $names")
         .WithParam("names", genreNames)
         .With("s, count(g) AS genreCount")
         .OrderByDescending("genreCount") // Prioritet serijama koje pripadaju više traženih žanrova
         .Limit(30)
         .Return(s => s.As<Show>()); //  izgleda ne mora distinct zbog count jer su tu vec grupise

        var result = await query.ResultsAsync;

        return result.ToList();
    }

    public async Task<List<Show>> SearchShowsByActor(string actorName)
    {

        using var client = new GraphClient(new Uri("http://localhost:7474"), "neo4j", "8vR@JaRJU-SL7Hr");
        await client.ConnectAsync();

        var name = actorName.Split();
        var firstName = char.ToUpper(name.First()[0]) + name.First()[1..].ToLower();
        var lastName = char.ToUpper(name.Last()[0]) + name.Last()[1..].ToLower();
        
        var fullName = firstName + " " + lastName;

        Console.WriteLine(fullName);

        var query = client.Cypher
            .Match("(s:Show)<-[:ACTED_IN]-(a:Actor {name: $actorName})")
            .WithParam("actorName", fullName)
            .Limit(30)
            .Return(s => s.As<Show>());

        var result = await query.ResultsAsync;

        return result.ToList();
    }

    /*
        public async Task<List<Show>> SearchShowsAsync(string query)
        {
            var cypher = @"
                MATCH (Show:Show)
                WHERE Show.title CONTAINS $query
                RETURN Show.title AS Title, Show.description AS Description";

            using var session = _driver.AsyncSession();
            var result = await session.RunAsync(cypher, new { query });

            var Shows = new List<Show>();
            await foreach (var record in result)
            {
                Shows.Add(new Show
                {
                    Title = record["Title"].As<string>(),
                    Description = record["Description"].As<string>(),
                    Date = record["Date"].As<string>(),
                    Cast = 
                });
            }

            return Shows;
        }
        */


}
