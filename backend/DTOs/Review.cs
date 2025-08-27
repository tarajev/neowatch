namespace NeoWatch.Dtos;

public class ReviewDto
{
    public string Username { get; set; } = null!;
    public int Rating { get; set; }
    public string? Comment { get; set; }
    public string? ProfilePicture { get; set; }
    public DateTime Timestamp { get; set; }
}