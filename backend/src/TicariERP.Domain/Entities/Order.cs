namespace TicariERP.Domain.Entities;

// Bu sınıf, sipariş fişimin "Başlık" (Header) kısmını temsil ediyor.
public class Order
{
    public Guid Id { get; set; }
    
    // Siparişi takip edebilmem için benzersiz bir numara (Örn: SP-2026-0001)
    public string OrderNumber { get; set; } = string.Empty;
    
    // Siparişin oluşturulma tarihi
    public DateTime OrderDate { get; set; }
    
    // İlişki: Bu siparişi hangi Cariye (Müşteriye/Tedarikçiye) kestim?
    // Veritabanında (Foreign Key) olarak tutacağım kolon:
    public Guid CurrentAccountId { get; set; }
    // Entity Framework'ün ilişkileri (Join) otomatik çözmesi için kullanacağım navigasyon özelliği:
    public CurrentAccount? CurrentAccount { get; set; }

    // Fişin genel toplam tutarı (Kalemlerin toplamı buraya yansıyacak)
    public decimal TotalAmount { get; set; }

    // Bir siparişin içinde birden fazla ürün kalemi olabilir (1'den Çoğa İlişki)
    // Bu listeyi boş bir liste ile başlatıyorum ki sonradan "Null Reference" hatası almayayım.
    public ICollection<OrderDetail> OrderDetails { get; set; } = new List<OrderDetail>();
}