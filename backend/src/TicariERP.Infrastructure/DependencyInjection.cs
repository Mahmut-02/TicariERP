using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using TicariERP.Application.Interfaces; // EKLENDİ: Arayüzü bulabilmesi için
using TicariERP.Infrastructure.Identity;
using TicariERP.Infrastructure.Persistence;
using TicariERP.Infrastructure.Services; // EKLENDİ: Gerçek servisi bulabilmesi için

namespace TicariERP.Infrastructure;

public static class DependencyInjection
{
    public static IServiceCollection AddInfrastructureServices(this IServiceCollection services, IConfiguration configuration)
    {
        // 1. Veritabanı bağlantımız
        services.AddDbContext<ErpDbContext>(options =>
            options.UseNpgsql(configuration.GetConnectionString("DefaultConnection")));

        // 2. Identity (Kimlik) ayarları
        services.AddIdentityCore<AppUser>(options =>
        {
            options.Password.RequireDigit = true;
            options.Password.RequiredLength = 6;
            options.Password.RequireNonAlphanumeric = false;
            options.Password.RequireUppercase = false;
            options.Password.RequireLowercase = false;
        })
        .AddRoles<IdentityRole>()
        .AddEntityFrameworkStores<ErpDbContext>();

        // 3. Servis Kayıtları (YENİ EKLENEN KISIM)
        services.AddScoped<IAuthService, AuthService>();

        return services;
    }
}