using Microsoft.AspNetCore.Mvc;
using TicariERP.Application.DTOs.Orders;
using TicariERP.Application.Interfaces;
using System;

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

    // YENİ EKLENEN KISIM: React (Frontend) tarafındaki "İptal Et / Sil" butonunu karşılayacak olan metot
    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(Guid id)
    {
        try
        {
            // Siparişi silmek için servise yönlendiriyoruz (Serviste DeleteAsync metodu eklenmiş olmalı)
            await _orderService.DeleteAsync(id);
            return Ok(new { Message = "Sipariş / Fatura başarıyla silindi." });
        }
        catch (Exception ex)
        {
            // Silme işleminde bir hata oluşursa Frontend'i kitlemeden uyarı veriyoruz
            return BadRequest(new { Message = "Sipariş silinirken hata oluştu: " + ex.Message });
        }
    }
}