namespace NeoWatch.Model;

public class Watched
{
    public Show? Show { get; set; }
    public User? User { get; set; }
    public required int rating { get; set; }
    public string? comment { get; set; }
}