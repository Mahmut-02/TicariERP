using TicariERP.Application.DTOs.StockMovements;

namespace TicariERP.Application.Interfaces;

public interface IStockMovementService
{
    Task<List<StockMovementDto>> GetAllAsync(Guid? productId = null, Guid? warehouseId = null);
    Task<StockMovementDto> CreateMovementAsync(CreateStockMovementDto dto);
    Task TransferStockAsync(TransferStockDto dto);
}