using TicariERP.Application.DTOs.Warehouses;

namespace TicariERP.Application.Interfaces;

public interface IWarehouseService
{
    Task<List<WarehouseDto>> GetAllAsync();
    Task<WarehouseDto?> GetByIdAsync(Guid id);
    Task<WarehouseDto> CreateAsync(CreateWarehouseDto dto);
    Task<bool> UpdateAsync(Guid id, UpdateWarehouseDto dto);
    Task<bool> DeleteAsync(Guid id);
}