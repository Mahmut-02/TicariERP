using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using TicariERP.Infrastructure.Identity;
using TicariERP.Infrastructure.Persistence;

namespace TicariERP.Infrastructure;

public static class DependencyInjection
{
    public static IServiceCollection AddInfrastructureServices(this IServiceCollection services, IConfiguration configuration)
    {
        // 1. Veritabanı bağlantımız (Önceden eklemiştik)
        services.AddDbContext<ErpDbContext>(options =>
            options.UseNpgsql(configuration.GetConnectionString("DefaultConnection")));

        // 2. Yeni eklediğimiz Identity (Kimlik) ayarları
        services.AddIdentityCore<AppUser>(options =>
        {
            options.Password.RequireDigit = true; // Rakam zorunlu mu?
            options.Password.RequiredLength = 6;  // En az kaç karakter?
            options.Password.RequireNonAlphanumeric = false; // Özel karakter (*,!,?) zorunlu mu?
            options.Password.RequireUppercase = false; // Büyük harf zorunlu mu?
            options.Password.RequireLowercase = false; // Küçük harf zorunlu mu?
        })
        .AddRoles<IdentityRole>()
        .AddEntityFrameworkStores<ErpDbContext>();

        return services;
    }
}