using TicariERP.Domain.Enums;

namespace TicariERP.Domain.Entities;

public class StockMovement
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public Guid ProductId { get; set; }
    public Guid WarehouseId { get; set; }
    public StockMovementType MovementType { get; set; }

    // Toptan satışta adet dışında kg/metre gibi küsüratlı birimler olabileceği için decimal kullanıyoruz
    public decimal Quantity { get; set; }
    public string? ReferenceNo { get; set; }                // İlgili Sipariş / İrsaliye / Fiş No
    public string? Description { get; set; }
    public DateTime MovementDate { get; set; } = DateTime.UtcNow;

    // Navigation Properties
    public Product Product { get; set; } = null!;
    public Warehouse Warehouse { get; set; } = null!;
}