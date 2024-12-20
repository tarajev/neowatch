
using NeoWatch.Model;

public class Review { //mora ovako ako zelimo da prikazemo sve recenzije za jednu seriju 
    public required Show Show;
    public required User User;
    public double? rating;
    public string? comment;
}