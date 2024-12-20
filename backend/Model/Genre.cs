namespace NeoWatch.Model;

public class Genre {
    public required string name {get; set;}
    public List<Show>? shows {get; set;} 
}