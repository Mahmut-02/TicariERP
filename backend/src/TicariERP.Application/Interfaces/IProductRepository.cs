using TicariERP.Domain.Entities;

namespace TicariERP.Application.Interfaces;

public interface IProductRepository
{
    Task<List<Product>> GetAllAsync();
    Task<Product?> GetByIdAsync(Guid id);
    Task AddAsync(Product product);
    Task DeleteAsync(Product product);
    Task UpdateAsync(Product product);
}