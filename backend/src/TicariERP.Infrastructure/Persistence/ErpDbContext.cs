using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;

namespace TicariERP.Infrastructure.Persistence;

// Normal DbContext yerine artık IdentityDbContext'ten miras alıyoruz
public class ErpDbContext : IdentityDbContext<IdentityUser>
{
    public ErpDbContext(DbContextOptions<ErpDbContext> options) : base(options)
    {
    }
}