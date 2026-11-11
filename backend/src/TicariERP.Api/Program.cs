using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using System.Text;
using TicariERP.Infrastructure;
using FluentValidation;
using TicariERP.Application.Interfaces;
using TicariERP.Application.Services;
using TicariERP.Infrastructure.Repositories;
using Microsoft.AspNetCore.Identity;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddInfrastructureServices(builder.Configuration);
builder.Services.AddControllers().AddJsonOptions(options =>
{
    // API'nin JSON oluştururken sonsuz döngüye girip çökmesini engeller
    options.JsonSerializerOptions.ReferenceHandler = System.Text.Json.Serialization.ReferenceHandler.IgnoreCycles;
});

builder.Services.AddCors(options =>
{
    options.AddPolicy("ReactApp", policy =>
        policy.WithOrigins("http://localhost:5173").AllowAnyHeader().AllowAnyMethod());
});

builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

builder.Services.AddScoped<TicariERP.Application.Interfaces.IProductRepository, TicariERP.Infrastructure.Repositories.ProductRepository>();
builder.Services.AddScoped<TicariERP.Application.Interfaces.IProductService, TicariERP.Application.Services.ProductService>();
builder.Services.AddValidatorsFromAssemblyContaining<TicariERP.Application.Validators.CreateProductDtoValidator>();

// Cari Hesaplar modülü bağımlılık kayıtları (IoC Container)
builder.Services.AddScoped<ICurrentAccountRepository, CurrentAccountRepository>();
builder.Services.AddScoped<ICurrentAccountService, CurrentAccountService>();

// Siparişler modülü bağımlılık kayıtları
builder.Services.AddScoped<IOrderRepository, OrderRepository>();
builder.Services.AddScoped<IOrderService, OrderService>();

// Auth (Güvenlik) servisini kaydediyoruz
builder.Services.AddScoped<IAuthService, TicariERP.Infrastructure.Services.AuthService>();

// 1. ÖNCE IDENTITY EKLENİR (Cookie ayarlarının JWT'yi ezmesini engellemek için yer değiştirdik)
builder.Services.AddIdentity<TicariERP.Infrastructure.Identity.AppUser, Microsoft.AspNetCore.Identity.IdentityRole>()
    .AddEntityFrameworkStores<TicariERP.Infrastructure.Persistence.ErpDbContext>()
    .AddDefaultTokenProviders();

// 2. SONRA AUTHENTICATION (JWT) EKLENİR VE ZORUNLU KILINIR
builder.Services.AddAuthentication(options =>
{
    // Identity'nin Cookie aramasını ezip, API için sadece JWT (Bearer Token) kullanılmasını emrediyoruz
    options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
    options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
    options.DefaultScheme = JwtBearerDefaults.AuthenticationScheme;
})
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

app.UseCors("ReactApp");
app.UseMiddleware<TicariERP.Api.Middlewares.ExceptionMiddleware>();

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

// Kimlik kontrolü ve yetki duvarını aktif et
app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();

app.Run();