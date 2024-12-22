namespace NeoWatch.Model;

public class ActedIn { //ovo ce biti veza izmedju glumca i serije serija sadrzi listu objekata ovog tipa i tako unosimo podatke o glumcu i koja je njegova uloga bila
    //public required Show show;
    public Actor? actor {get; set;}
    public required string role {get; set;}
}