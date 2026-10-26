using Microsoft.EntityFrameworkCore;
using TicariERP.Application.Interfaces;
using TicariERP.Domain.Entities;
using TicariERP.Infrastructure.Persistence;

namespace TicariERP.Infrastructure.Repositories;

public class ProductRepository : IProductRepository
{
    private readonly ErpDbContext _context;

    public ProductRepository(ErpDbContext context)
    {
        _context = context;
    }

    public async Task<List<Product>> GetAllAsync() => await _context.Products.ToListAsync();
    
    public async Task<Product?> GetByIdAsync(Guid id) => await _context.Products.FindAsync(id);
    
    public async Task AddAsync(Product product)
    {
        await _context.Products.AddAsync(product);
        await _context.SaveChangesAsync();
    }

    public async Task DeleteAsync(Product product)
    {
        _context.Products.Remove(product);
        await _context.SaveChangesAsync();
    }

     public async Task UpdateAsync(Product product)
{
    _context.Products.Update(product);
    await _context.SaveChangesAsync();
}
}