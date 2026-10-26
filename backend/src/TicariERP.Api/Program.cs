using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using System.Text;
using TicariERP.Infrastructure;
using FluentValidation;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddInfrastructureServices(builder.Configuration);
builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();
builder.Services.AddScoped<TicariERP.Application.Interfaces.IProductRepository, TicariERP.Infrastructure.Repositories.ProductRepository>();
builder.Services.AddScoped<TicariERP.Application.Interfaces.IProductService, TicariERP.Application.Services.ProductService>();
builder.Services.AddValidatorsFromAssemblyContaining<TicariERP.Application.Validators.CreateProductDtoValidator>();

// YENİ EKLENEN: Güvenlik Görevlisi (JWT Doğrulama Ayarları)
builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = true,
            ValidateAudience = true,
            ValidateLifetime = true,
            ValidateIssuerSigningKey = true,
            ValidIssuer = builder.Configuration["Jwt:Issuer"],
            ValidAudience = builder.Configuration["Jwt:Audience"],
            IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(builder.Configuration["Jwt:Key"]!))
        };
    });

var app = builder.Build();

if (app.Environment.IsDevelopment())
{
    app.UseSwagger(c =>
{
    c.SerializeAsV2 = true;
});
    app.UseSwaggerUI(c => 
    {
        c.SwaggerEndpoint("/swagger/v1/swagger.json", "TicariERP API V1");
    });
}

// YENİ EKLENEN: Kimlik kontrolü ve yetki duvarını aktif et
app.UseAuthentication(); 
app.UseAuthorization();

app.MapControllers();

app.Run();