namespace NeoWatch.Model;

public class User {
    public required string Username;
    public required string Email;
    public required string Password;
    public string? Bio;
    public List<User>? Following;
    public List<User>? Followers;
    public List<Show>? YetToWatch;
    public List<Watched>? Watched;
}