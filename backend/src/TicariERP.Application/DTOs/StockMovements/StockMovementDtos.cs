using TicariERP.Domain.Enums;

namespace TicariERP.Application.DTOs.StockMovements;

public class StockMovementDto
{
    public Guid Id { get; set; }
    public Guid ProductId { get; set; }
    public string ProductName { get; set; } = string.Empty;
    public string Unit { get; set; } = string.Empty;
    public Guid WarehouseId { get; set; }
    public string WarehouseName { get; set; } = string.Empty;
    public StockMovementType MovementType { get; set; }
    public string MovementTypeName { get; set; } = string.Empty;
    public decimal Quantity { get; set; }
    public string? ReferenceNo { get; set; }
    public string? Description { get; set; }
    public DateTime MovementDate { get; set; }
}

public class CreateStockMovementDto
{
    public Guid ProductId { get; set; }
    public Guid WarehouseId { get; set; }
    public StockMovementType MovementType { get; set; }
    public decimal Quantity { get; set; }
    public string? ReferenceNo { get; set; }
    public string? Description { get; set; }
}

public class TransferStockDto
{
    public Guid ProductId { get; set; }
    public Guid SourceWarehouseId { get; set; }
    public Guid TargetWarehouseId { get; set; }
    public decimal Quantity { get; set; }
    public string? ReferenceNo { get; set; }
    public string? Description { get; set; }
}