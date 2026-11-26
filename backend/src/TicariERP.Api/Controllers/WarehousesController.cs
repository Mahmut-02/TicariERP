using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using TicariERP.Application.DTOs.Warehouses;
using TicariERP.Application.Interfaces;

namespace TicariERP.Api.Controllers;

[Authorize]
[ApiController]
[Route("api/[controller]")]
public class WarehousesController : ControllerBase
{
    private readonly IWarehouseService _warehouseService;

    public WarehousesController(IWarehouseService warehouseService)
    {
        _warehouseService = warehouseService;
    }

    [HttpGet]
    public async Task<IActionResult> GetAll()
    {
        var warehouses = await _warehouseService.GetAllAsync();
        return Ok(warehouses);
    }

    [HttpGet("{id:guid}")]
    public async Task<IActionResult> GetById(Guid id)
    {
        var warehouse = await _warehouseService.GetByIdAsync(id);
        if (warehouse == null)
            return NotFound(new { message = "Depo bulunamadı." });

        return Ok(warehouse);
    }

    [HttpPost]
    public async Task<IActionResult> Create([FromBody] CreateWarehouseDto dto)
    {
        try
        {
            var created = await _warehouseService.CreateAsync(dto);
            return CreatedAtAction(nameof(GetById), new { id = created.Id }, created);
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    [HttpPut("{id:guid}")]
    public async Task<IActionResult> Update(Guid id, [FromBody] UpdateWarehouseDto dto)
    {
        try
        {
            var updated = await _warehouseService.UpdateAsync(id, dto);
            if (!updated)
                return NotFound(new { message = "Depo bulunamadı." });

            return NoContent();
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    [HttpDelete("{id:guid}")]
    public async Task<IActionResult> Delete(Guid id)
    {
        try
        {
            var deleted = await _warehouseService.DeleteAsync(id);
            if (!deleted)
                return NotFound(new { message = "Depo bulunamadı." });

            return NoContent();
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }
}