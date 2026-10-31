using Microsoft.EntityFrameworkCore;
using TicariERP.Application.Interfaces;
using TicariERP.Domain.Entities;
using TicariERP.Infrastructure.Persistence;

namespace TicariERP.Infrastructure.Repositories;

// ICurrentAccountRepository arayüzünün Entity Framework Core kullanılarak uygulandığı (implemente edildiği) somut sınıftır.
// Yalnızca veritabanı CRUD (Create, Read, Update, Delete) işlemlerinden sorumludur; iş kuralı içermez.
public class CurrentAccountRepository : ICurrentAccountRepository
{
    private readonly ErpDbContext _context;

    public CurrentAccountRepository(ErpDbContext context)
    {
        _context = context;
    }

    public async Task<IEnumerable<CurrentAccount>> GetAllAsync()
    {
        return await _context.CurrentAccounts.ToListAsync();
    }

    public async Task<CurrentAccount?> GetByIdAsync(Guid id)
    {
        return await _context.CurrentAccounts.FindAsync(id);
    }

    public async Task AddAsync(CurrentAccount currentAccount)
    {
        await _context.CurrentAccounts.AddAsync(currentAccount);
        await _context.SaveChangesAsync();
    }

    public async Task UpdateAsync(CurrentAccount currentAccount)
    {
        _context.CurrentAccounts.Update(currentAccount);
        await _context.SaveChangesAsync();
    }

    public async Task DeleteAsync(Guid id)
    {
        var entity = await _context.CurrentAccounts.FindAsync(id);
        if (entity != null)
        {
            _context.CurrentAccounts.Remove(entity);
            await _context.SaveChangesAsync();
        }
    }
}