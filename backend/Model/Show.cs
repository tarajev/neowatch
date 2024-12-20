using System.Text.Json.Serialization;

namespace NeoWatch.Model;

public class Show {
    public required string title {get; set;} //ponasamo se kao da je ovo jedinstveno
    public required string desc {get; set;}
    public required string year {get; set;}
    public double? rating {get; set;} 
    public string? imageUrl {get; set;} 
    public required List<Genre> genres {get; set;} 
    public List<Actor>? cast {get; set;} 

}
