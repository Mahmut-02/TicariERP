namespace TicariERP.Domain.Entities;

// Bu sınıf, sipariş fişimin "Kalemler" (Satırlar) kısmını temsil ediyor.
public class OrderDetail
{
    public Guid Id { get; set; }
    
    // İlişki 1: Bu kalem hangi Sipariş fişine ait?
    public Guid OrderId { get; set; }
    public Order? Order { get; set; }

    // İlişki 2: Bu satırda hangi Ürün satılıyor?
    public Guid ProductId { get; set; }
    public Product? Product { get; set; }

    // Satış anındaki miktar
    public int Quantity { get; set; }
    
    // Satış anındaki birim fiyat. 
    // (Bunu Product tablosundan alsak da buraya kopyalamak zorundayız. Çünkü ürünün fiyatı yarın değişse bile, geçmiş siparişteki fiyat sabit kalmalıdır.)
    public decimal UnitPrice { get; set; }
}