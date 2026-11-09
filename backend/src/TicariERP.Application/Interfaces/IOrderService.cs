using TicariERP.Application.DTOs.Orders;
using TicariERP.Domain.Entities;

namespace TicariERP.Application.Interfaces;

public interface IOrderService
{
    Task<IEnumerable<Order>> GetAllAsync();
    Task AddAsync(CreateOrderDto dto);
    Task DeleteAsync(Guid id);
}