using Microsoft.EntityFrameworkCore;

namespace TicariERP.Infrastructure.Persistence;

public class ErpDbContext : DbContext
{
    public ErpDbContext(DbContextOptions<ErpDbContext> options) : base(options)
    {
    }
}