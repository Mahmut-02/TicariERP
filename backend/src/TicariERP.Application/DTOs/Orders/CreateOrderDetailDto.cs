namespace TicariERP.Application.DTOs.Orders;

// Ana sepetin içine koyacağımız küçük sepet (Siparişteki her bir ürün satırını temsil eder)
public class CreateOrderDetailDto
{
    // Hangi üründen satıyoruz?
    public Guid ProductId { get; set; }
    
    // Kaç adet satıyoruz?
    public int Quantity { get; set; }
    
    // Hangi fiyattan satıyoruz?
    public decimal UnitPrice { get; set; }
}