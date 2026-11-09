using TicariERP.Domain.Entities;

namespace TicariERP.Application.Interfaces;

public interface IOrderRepository
{
    // Siparişleri çekerken, içindeki kalemleri (ürünleri) ve cari hesap (müşteri) bilgilerini de getirmesi için özel metotlar.
    Task<IEnumerable<Order>> GetAllOrdersWithDetailsAsync();
    Task<Order?> GetOrderByIdWithDetailsAsync(Guid id);
    Task AddAsync(Order order);
}