using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;
using TicariERP.Infrastructure.Identity;
using TicariERP.Domain.Entities; // YENİ: Domain katmanındaki Entity'leri kullanabilmek için ekledik

namespace TicariERP.Infrastructure.Persistence;

public class ErpDbContext : IdentityDbContext<AppUser, IdentityRole, string>
{
    public ErpDbContext(DbContextOptions<ErpDbContext> options) : base(options)
    {
    }

    // YENİ: Ürünler tablomuzu veritabanına tanıtıyoruz
    public DbSet<Product> Products { get; set; }
}