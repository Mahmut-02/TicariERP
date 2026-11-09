namespace TicariERP.Application.DTOs.Orders;

// React'ten bize gelecek olan Ana Sipariş sepeti
public class CreateOrderDto
{
    // Siparişi hangi müşteriye kestik?
    public Guid CurrentAccountId { get; set; }
    
    // Fiş tarihi
    public DateTime OrderDate { get; set; }
    
    // DİKKAT: Toplam tutarı (TotalAmount) bilerek React'ten almıyoruz! 
    // Güvenlik gereği miktar * fiyat hesabını arka planda biz (Service katmanı) yapacağız ki kimse arayüzden hackleyip 0 TL'ye sipariş geçemesin.

    // İç içe sepet mantığı: Bu siparişin içindeki ürün satırlarının listesi
    public List<CreateOrderDetailDto> Details { get; set; } = new();
}