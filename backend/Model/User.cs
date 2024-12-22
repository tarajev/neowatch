using System.Text.Json.Serialization;

namespace NeoWatch.Model;

public class User {
    public required string username { get; set; }
    public required string email { get; set; }
    public required string password { get; set; }
    public required DateTime joinedDate { get; set; }
    public string? picture { get; set; }
    public string? bio { get; set; }
    
    // JsonIgnore za Swagger
    [JsonIgnore] public List<User>? following { get; set; }
    [JsonIgnore] public List<User>? followers { get; set; }
    [JsonIgnore] public List<Show>? yetToWatch { get; set; }
    [JsonIgnore] public List<Watched>? watched { get; set; }
    [JsonIgnore] public List<Review>? reviews { get; set; }
}