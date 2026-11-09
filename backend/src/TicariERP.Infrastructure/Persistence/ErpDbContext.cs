using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;
using TicariERP.Infrastructure.Identity;
using TicariERP.Domain.Entities;

namespace TicariERP.Infrastructure.Persistence;

public class ErpDbContext : IdentityDbContext<AppUser, IdentityRole, string>
{
    public ErpDbContext(DbContextOptions<ErpDbContext> options) : base(options)
    {
    }

    public DbSet<Product> Products { get; set; }
    
    // YENİ: Cari Hesaplar tablosunu veritabanına tanıtıyoruz
    public DbSet<CurrentAccount> CurrentAccounts { get; set; }

    // YENİ EKLENENLER: Sipariş ve Sipariş Detay tablolarımı veritabanına tanıtıyorum.
    public DbSet<Order> Orders { get; set; }
    public DbSet<OrderDetail> OrderDetails { get; set; }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        // ÖNEMLİ: Identity (Kullanıcı/Rol) tablolarının sorunsuz oluşması için base metodu mutlaka çağırmalıyız.
        base.OnModelCreating(modelBuilder);

        // YENİ: Configurations klasörüne yazdığımız kısıtlamaları (CurrentAccountConfiguration) otomatik uygular.
        modelBuilder.ApplyConfigurationsFromAssembly(typeof(ErpDbContext).Assembly);
    }
}