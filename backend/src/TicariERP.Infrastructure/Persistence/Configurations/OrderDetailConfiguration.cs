using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using TicariERP.Domain.Entities;

namespace TicariERP.Infrastructure.Persistence.Configurations;

// Fişin içindeki satırların (Kalemlerin) veritabanı kurallarını belirliyorum.
public class OrderDetailConfiguration : IEntityTypeConfiguration<OrderDetail>
{
    public void Configure(EntityTypeBuilder<OrderDetail> builder)
    {
        builder.ToTable("OrderDetails");
        builder.HasKey(x => x.Id);
        builder.Property(x => x.UnitPrice).HasColumnType("decimal(18,2)");

        // İLİŞKİ 3: Kalem - Ürün
        // Bu satırda satılan bir ürün var.
        // OnDelete(Restrict) kuralı çok önemli: Eğer bu ürünü bir faturada sattıysam, yarın öbür gün Ürünler sayfasından bunu silmeye çalıştığımda sistem beni durdursun ki geçmiş faturalarım bozulmasın.
        builder.HasOne(x => x.Product)
               .WithMany()
               .HasForeignKey(x => x.ProductId)
               .OnDelete(DeleteBehavior.Restrict);
    }
}