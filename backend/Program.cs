
using System.Text;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using Neo4j.Driver;
using NeoWatch.Services;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.
builder.Services.AddMvc();
builder.Services.AddControllers();
// Learn more about configuring Swagger/OpenAPI at https://aka.ms/aspnetcore/swashbuckle
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

builder.Services.AddDirectoryBrowser();

builder.Services.AddSingleton<IDriver>(provider =>
{
    return GraphDatabase.Driver(
        "bolt://localhost:7687", 
        AuthTokens.Basic("neo4j", "8vR@JaRJU-SL7Hr")); 
});
builder.Services.AddScoped<ShowService>();
builder.Services.AddScoped<UserService>();

builder.Services.AddCors(options =>
    {
        options.AddPolicy("CORS", policy =>
        {
            policy.AllowAnyHeader()
                  .AllowAnyMethod()
                  .WithOrigins("http://localhost:5500", // TODO: Srediti CORS.
                            "https://localhost:5500",
                            "http://127.0.0.1:5500",
                            "https://127.0.0.1:5500",
                            "http://localhost:3000",
                            "https://localhost:3000",
                            "http://192.168.56.1:3000",
                            "http://127.0.0.1:3000",
                            "https://127.0.0.1:3000")
                  .AllowCredentials();
        });
    });


var app = builder.Build();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseRouting();

app.UseCors("CORS");

app.UseHttpsRedirection();

app.MapControllers();

app.Run();
