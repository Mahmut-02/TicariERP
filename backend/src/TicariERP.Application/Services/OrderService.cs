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
            // Tarih boş (01.01.0001) gelirse otomatik şu anki UTC tarihini ata
            OrderDate = dto.OrderDate == default ? DateTime.UtcNow : dto.OrderDate,
            OrderNumber = $"SP-{DateTime.Now:yyyyMMdd}-{Guid.NewGuid().ToString().Substring(0, 4).ToUpper()}",
            TotalAmount = 0
        };

        decimal calculatedTotal = 0;

        // 2. DTO'nun içindeki sepet kalemlerini (satılan ürünleri) tek tek dönüyorum
        foreach (var detailDto in dto.Details)
        {
            var product = await _productRepository.GetByIdAsync(detailDto.ProductId);
            if (product == null)
                throw new Exception("Siparişteki ürünlerden biri sistemde bulunamadı.");

            // 3. Stok Kontrolü
            if (product.StockQuantity < detailDto.Quantity)
                throw new Exception($"'{product.Name}' adlı ürün için yeterli stok yok. Mevcut Stok: {product.StockQuantity}");

            // 4. Stok Düşme
            product.StockQuantity -= detailDto.Quantity;
            await _productRepository.UpdateAsync(product);

            // Güvenlik gereği birim fiyatı veritabanındaki gerçek ürün fiyatından alıyoruz
            var unitPrice = product.Price;
            calculatedTotal += (detailDto.Quantity * unitPrice);

            order.OrderDetails.Add(new OrderDetail
            {
                Id = Guid.NewGuid(),
                OrderId = orderId,
                ProductId = detailDto.ProductId,
                Quantity = detailDto.Quantity,
                UnitPrice = unitPrice
            });
        }

        // 5. Arka planda güvenli şekilde hesaplanan genel toplam
        order.TotalAmount = calculatedTotal;

        // 6. Kaydet
        await _orderRepository.AddAsync(order);
    }

    public async Task DeleteAsync(Guid id)
    {
        var order = await _orderRepository.GetByIdAsync(id);
        if (order != null)
        {
            await _orderRepository.DeleteAsync(order);
        }
    }
}