using Microsoft.AspNetCore.Mvc;
using TicariERP.Application.DTOs.Orders;
using TicariERP.Application.Interfaces;

namespace TicariERP.Api.Controllers;

[Route("api/[controller]")]
[ApiController]
public class OrdersController : ControllerBase
{
    private readonly IOrderService _orderService;

    public OrdersController(IOrderService orderService)
    {
        _orderService = orderService;
    }

    [HttpGet]
    public async Task<IActionResult> GetAll()
    {
        // Tüm siparişleri, içindeki ürün kalemleri ve cari hesap (müşteri) detaylarıyla birlikte getirir.
        var orders = await _orderService.GetAllAsync();
        return Ok(orders);
    }

    [HttpPost]
    public async Task<IActionResult> Create([FromBody] CreateOrderDto dto)
    {
        // FluentValidation bu aşamada devreye girip hem ana siparişi hem de içindeki ürün kalemlerini kontrol eder.
        // Hata yoksa sipariş oluşturulur, stoklar düşülür ve veritabanına kaydedilir.
        await _orderService.AddAsync(dto);
        
        return Ok(new { Message = "Sipariş başarıyla oluşturuldu ve stoklar güncellendi." });
    }
}