using TicariERP.Infrastructure;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddInfrastructureServices(builder.Configuration);
builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

var app = builder.Build();

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    // Swagger'a JSON dosyasının tam yerini açıkça belirtiyoruz
    app.UseSwaggerUI(c => 
    {
        c.SwaggerEndpoint("/swagger/v1/swagger.json", "TicariERP API V1");
    });
}

// Terminaldeki sarı HTTPS uyarısını kaldırmak için bu satırı kapattık
// app.UseHttpsRedirection(); 

app.MapControllers();

app.Run();