using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using TicariERP.Application.DTOs.StockMovements;
using TicariERP.Application.Interfaces;

namespace TicariERP.Api.Controllers;

[Authorize]
[ApiController]
[Route("api/[controller]")]
public class StockMovementsController : ControllerBase
{
    private readonly IStockMovementService _stockMovementService;

    public StockMovementsController(IStockMovementService stockMovementService)
    {
        _stockMovementService = stockMovementService;
    }

    [HttpGet]
    public async Task<IActionResult> GetAll([FromQuery] Guid? productId, [FromQuery] Guid? warehouseId)
    {
        var movements = await _stockMovementService.GetAllAsync(productId, warehouseId);
        return Ok(movements);
    }

    [HttpPost]
    public async Task<IActionResult> Create([FromBody] CreateStockMovementDto dto)
    {
        try
        {
            var movement = await _stockMovementService.CreateMovementAsync(dto);
            return Ok(movement);
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    [HttpPost("transfer")]
    public async Task<IActionResult> Transfer([FromBody] TransferStockDto dto)
    {
        try
        {
            await _stockMovementService.TransferStockAsync(dto);
            return Ok(new { message = "Depolar arası stok transferi başarıyla tamamlandı." });
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }
}