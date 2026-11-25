namespace TicariERP.Domain.Entities;

public class Warehouse
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public string Code { get; set; } = string.Empty;        // Örn: DEPO-01
    public string Name { get; set; } = string.Empty;        // Örn: Merkez Depo
    public string? Address { get; set; }
    public bool IsDefault { get; set; }                     // Varsayılan depo mu?
    public bool IsActive { get; set; } = true;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    // Navigation Property
    public ICollection<StockMovement> StockMovements { get; set; } = new List<StockMovement>();
}