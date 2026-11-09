using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using TicariERP.Domain.Entities;

namespace TicariERP.Infrastructure.Persistence.Configurations;

// Veritabanımdaki 'Orders' (Siparişler) tablosunun yapısını ve ilişkilerini belirliyorum.
public class OrderConfiguration : IEntityTypeConfiguration<Order>
{
    public void Configure(EntityTypeBuilder<Order> builder)
    {
        builder.ToTable("Orders");
        builder.HasKey(x => x.Id);
        builder.Property(x => x.OrderNumber).IsRequired().HasMaxLength(50);
        
        // Parasal değerlerde virgülden sonra kaç hane olacağını (18 hane toplam, 2'si ondalık) belirtiyorum.
        builder.Property(x => x.TotalAmount).HasColumnType("decimal(18,2)");

        // İLİŞKİ 1: Sipariş - Cari Hesap (N'e 1)
        // Bir sipariş sadece bir Cari'ye aittir. 
        // OnDelete(Restrict) diyerek şunu garantiye alıyorum: Eğer bir Müşterinin geçmiş siparişi varsa, sistem o müşterinin silinmesine izin vermesin!
        builder.HasOne(x => x.CurrentAccount)
               .WithMany() 
               .HasForeignKey(x => x.CurrentAccountId)
               .OnDelete(DeleteBehavior.Restrict);

        // İLİŞKİ 2: Sipariş - Sipariş Kalemleri (1'e N)
        // Bir siparişin birden fazla kalemi olabilir.
        // OnDelete(Cascade) ile şunu söylüyorum: Eğer ana sipariş fişini silersem, altındaki tüm kalemleri de otomatik olarak çöpe at.
        builder.HasMany(x => x.OrderDetails)
               .WithOne(x => x.Order)
               .HasForeignKey(x => x.OrderId)
               .OnDelete(DeleteBehavior.Cascade);
    }
}