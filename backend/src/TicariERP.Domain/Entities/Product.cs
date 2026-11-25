namespace TicariERP.Domain.Entities;

public class Product
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public string Name { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public string? Barcode { get; set; }
    public string Unit { get; set; } = "Adet";
    public decimal Price { get; set; }
    public int StockQuantity { get; set; }
    public DateTime CreatedDate { get; set; } = DateTime.UtcNow;

    // Navigation Property
    public ICollection<StockMovement> StockMovements { get; set; } = new List<StockMovement>();
}