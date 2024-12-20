namespace NeoWatch.Model;

public class Actor {
    public required string name {get; set;}
    public string? bio {get; set;}
    public string? dob {get; set;}
    public List<Show>? shows {get; set;}
}