namespace TicariERP.Domain.Entities;

public class CurrentAccount
{
    public Guid Id { get; set; }
    public string Code { get; set; } = string.Empty; // Örn: 120.001 (Müşteri kodu)
    public string Name { get; set; } = string.Empty; // Unvan / Ad Soyad
    public string Type { get; set; } = string.Empty; // "Müşteri" veya "Tedarikçi"
    public string? TaxOffice { get; set; } // Vergi Dairesi
    public string? TaxNumber { get; set; } // Vergi No veya TCKN
    public string? Address { get; set; } // Adres
}