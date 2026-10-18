using TicariERP.Infrastructure; // Infrastructure katmanını kullanabilmek için ekledik

var builder = WebApplication.CreateBuilder(args);

// Kendi yazdığımız altyapı servislerini (veritabanı bağlantısı vb.) sisteme kaydediyoruz
builder.Services.AddInfrastructureServices(builder.Configuration);

// Controller desteğini servislere ekliyoruz
builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

var app = builder.Build();

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection();

// Gelen istekleri Controller'lara yönlendiriyoruz
app.MapControllers();

app.Run();