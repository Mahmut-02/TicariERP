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

    public DbSet<Warehouse> Warehouses { get; set; }
    public DbSet<StockMovement> StockMovements { get; set; }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        // ÖNEMLİ: Identity (Kullanıcı/Rol) tablolarının sorunsuz oluşması için base metodu mutlaka çağırmalıyız.
        base.OnModelCreating(modelBuilder);

        // YENİ: Configurations klasörüne yazdığımız kısıtlamaları (CurrentAccountConfiguration) otomatik uygular.
        modelBuilder.ApplyConfigurationsFromAssembly(typeof(ErpDbContext).Assembly);

        modelBuilder.Entity<Warehouse>(entity =>
{
    entity.HasKey(w => w.Id);
    entity.Property(w => w.Code).IsRequired().HasMaxLength(30);
    entity.Property(w => w.Name).IsRequired().HasMaxLength(150);
    entity.HasIndex(w => w.Code).IsUnique();
});

        modelBuilder.Entity<StockMovement>(entity =>
        {
            entity.HasKey(sm => sm.Id);
            entity.Property(sm => sm.Quantity).HasPrecision(18, 2);
            entity.Property(sm => sm.ReferenceNo).HasMaxLength(50);

            entity.HasOne(sm => sm.Product)
                  .WithMany(p => p.StockMovements)
                  .HasForeignKey(sm => sm.ProductId)
                  .OnDelete(DeleteBehavior.Restrict);

            entity.HasOne(sm => sm.Warehouse)
                  .WithMany(w => w.StockMovements)
                  .HasForeignKey(sm => sm.WarehouseId)
                  .OnDelete(DeleteBehavior.Restrict);
        });
    }
}