using TicariERP.Application.DTOs.Orders;
using TicariERP.Application.Interfaces;
using TicariERP.Domain.Entities;

namespace TicariERP.Application.Services;

// Sistemin beyni: Sipariş tutarını hesaplar, stokları düşer ve siparişi oluşturur.
public class OrderService : IOrderService
{
    private readonly IOrderRepository _orderRepository;
    // Stokları kontrol edip düşebilmek için Ürünler Kiler Sorumlusunu da buraya çağırıyorum.
    private readonly IProductRepository _productRepository;

    public OrderService(IOrderRepository orderRepository, IProductRepository productRepository)
    {
        _orderRepository = orderRepository;
        _productRepository = productRepository;
    }

    public async Task<IEnumerable<Order>> GetAllAsync()
    {
        return await _orderRepository.GetAllOrdersWithDetailsAsync();
    }

    public async Task AddAsync(CreateOrderDto dto)
    {
        // 1. Ana Sipariş fişini oluşturuyorum
        var orderId = Guid.NewGuid();
        var order = new Order
        {
            Id = orderId,
            CurrentAccountId = dto.CurrentAccountId,
            OrderDate = dto.OrderDate,
            // SP-2026-1031-ABCD formatında rastgele, benzersiz bir sipariş numarası üretiyorum.
            OrderNumber = $"SP-{DateTime.Now:yyyyMMdd}-{Guid.NewGuid().ToString().Substring(0, 4).ToUpper()}",
            TotalAmount = 0 // Toplamı birazdan kalemleri dönerken hesaplayacağım
        };

        decimal calculatedTotal = 0;

        // 2. DTO'nun içindeki sepet kalemlerini (satılan ürünleri) tek tek dönüyorum
        foreach (var detailDto in dto.Details)
        {
            // Ürünü veritabanından buluyorum
            var product = await _productRepository.GetByIdAsync(detailDto.ProductId);
            if (product == null)
                throw new Exception("Siparişteki ürünlerden biri sistemde bulunamadı.");

            // 3. İŞ KURALI (Stok Kontrolü): Adamın istediği miktar elimde var mı?
            if (product.StockQuantity < detailDto.Quantity)
                throw new Exception($"'{product.Name}' adlı ürün için yeterli stok yok. Mevcut Stok: {product.StockQuantity}");

            // 4. İŞ KURALI (Stok Düşme): Ürün satıldığına göre stoğu azaltıyorum
            product.StockQuantity -= detailDto.Quantity;
            await _productRepository.UpdateAsync(product);

            // Kalem toplamını (Miktar * Fiyat) genel toplama ekliyorum
            calculatedTotal += (detailDto.Quantity * detailDto.UnitPrice);

            // Sipariş satırını (OrderDetail) oluşturup Ana Siparişin listesine ekliyorum
            order.OrderDetails.Add(new OrderDetail
            {
                Id = Guid.NewGuid(),
                OrderId = orderId,
                ProductId = detailDto.ProductId,
                Quantity = detailDto.Quantity,
                UnitPrice = detailDto.UnitPrice
            });
        }

        // 5. Arka planda güvenli şekilde hesapladığım genel toplamı fişe yazıyorum
        order.TotalAmount = calculatedTotal;

        // 6. Hazırlanan dolu fişi kaydetmesi için kilerciye yolluyorum
        await _orderRepository.AddAsync(order);
    }
}