using System.Text.Json.Serialization;

namespace NeoWatch.Model;

public class Genre {
    public required string name {get; set;}
    [JsonIgnore]
    public List<Show>? shows {get; set;} 
}