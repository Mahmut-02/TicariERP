using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using TicariERP.Domain.Entities;

namespace TicariERP.Infrastructure.Persistence.Configurations;

public class CurrentAccountConfiguration : IEntityTypeConfiguration<CurrentAccount>
{
    public void Configure(EntityTypeBuilder<CurrentAccount> builder)
    {
        builder.ToTable("CurrentAccounts");
        builder.HasKey(x => x.Id);
        builder.Property(x => x.Code).IsRequired().HasMaxLength(50);
        builder.Property(x => x.Name).IsRequired().HasMaxLength(200);
        builder.Property(x => x.Type).IsRequired().HasMaxLength(50);
        builder.Property(x => x.TaxOffice).HasMaxLength(100);
        builder.Property(x => x.TaxNumber).HasMaxLength(50);
    }
}