namespace NeoWatch.Model;

public class Watched
{
    public required Show Show;
    public required User User;
    public double? rating;
    public string? comment;
}