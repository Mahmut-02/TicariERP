using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;
using TicariERP.Infrastructure.Identity; // Yeni sınıfımızın adresini ekledik

namespace TicariERP.Infrastructure.Persistence;

// Artık IdentityUser yerine kendi AppUser sınıfımızı (Ad ve Soyad içeren) kullanıyoruz
public class ErpDbContext : IdentityDbContext<AppUser>
{
    public ErpDbContext(DbContextOptions<ErpDbContext> options) : base(options)
    {
    }
}