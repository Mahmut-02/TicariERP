using Microsoft.EntityFrameworkCore;
using TicariERP.Application.Interfaces;
using TicariERP.Domain.Entities;
using TicariERP.Infrastructure.Persistence;

namespace TicariERP.Infrastructure.Repositories;

public class OrderRepository : IOrderRepository
{
    private readonly ErpDbContext _context;

    public OrderRepository(ErpDbContext context)
    {
        _context = context;
    }

    public async Task<IEnumerable<Order>> GetAllOrdersWithDetailsAsync()
    {
        // Include ve ThenInclude kullanarak, veritabanından Siparişi çekerken yanına Müşteri ve Ürün bilgilerini de "Join" (birleştirme) yaparak getiriyorum.
        return await _context.Orders
            .Include(o => o.CurrentAccount)
            .Include(o => o.OrderDetails)
                .ThenInclude(od => od.Product)
            .OrderByDescending(o => o.OrderDate)
            .ToListAsync();
    }

    public async Task<Order?> GetOrderByIdWithDetailsAsync(Guid id)
    {
        return await _context.Orders
            .Include(o => o.CurrentAccount)
            .Include(o => o.OrderDetails)
                .ThenInclude(od => od.Product)
            .FirstOrDefaultAsync(o => o.Id == id);
    }

    public async Task AddAsync(Order order)
    {
        await _context.Orders.AddAsync(order);
        await _context.SaveChangesAsync();
    }

    public async Task DeleteAsync(Order order)
    {
        _context.Orders.Remove(order);
        await _context.SaveChangesAsync();
    }

    public async Task<Order> GetByIdAsync(Guid id)
    {
        return await _context.Orders.FindAsync(id);
    }
}