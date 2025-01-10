using Microsoft.IdentityModel.Tokens;
using Neo4j.Driver;
using Neo4jClient;
using Neo4jClient.Cypher;
using NeoWatch.Model;

namespace NeoWatch.Services;
public class GenreService
{
    public async Task<List<Genre>?> GetAllGenres()
    {
        using var client = new GraphClient(new Uri("http://localhost:7474"), "neo4j", "8vR@JaRJU-SL7Hr");
        await client.ConnectAsync();

        var query = client.Cypher
            .Match("(g:Genre)")
            .Return((g) => g.CollectAs<Genre>());

        var result = await query.ResultsAsync;

        return result.FirstOrDefault()?.ToList() ?? null;
    }
}