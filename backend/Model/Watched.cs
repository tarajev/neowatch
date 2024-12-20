namespace NeoWatch.Model;

public class Watched { //ovo ce biti veza izmedju korisinika i serije
    public required Show Show;
    public required User User;
    public double? rating;
    public string? comment;

}