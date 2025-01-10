namespace NeoWatch.Model;

public class Watched
{
    public required Show Show;
    public required User User;
    public required int rating;
    public string? comment;
}