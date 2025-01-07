using System.Text.Json.Serialization;

namespace NeoWatch.Model;

public class User {
    public required string username { get; set; }
    public required string email { get; set; }
    public required string password { get; set; }
    public required DateTime joinedDate { get; set; }
    public string? picture { get; set; }
    public string? bio { get; set; }
    public required string role {get; set;}  //moramo da čuvamo i ovo

    //ovo se ne čuva 
    public long seriesWatchedCount { get; set; } 
    public long currentlyWatchingCount { get; set; }
    public long followersCount { get; set; }
    
    // JsonIgnore za Swagger
    [JsonIgnore] public List<User> following { get; set; } = [];
    [JsonIgnore] public List<User> followers { get; set; } = [];
    [JsonIgnore] public List<Show> yetToWatch { get; set; } = [];
    [JsonIgnore] public List<Watched> watched { get; set; } = [];
}