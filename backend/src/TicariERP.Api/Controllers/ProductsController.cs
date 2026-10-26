using Microsoft.AspNetCore.Mvc;
using FluentValidation;
using TicariERP.Application.DTOs.Products;
using TicariERP.Application.Interfaces;

namespace TicariERP.Api.Controllers;

[Route("api/[controller]")]
[ApiController]
public class ProductsController : ControllerBase
{
    private readonly IProductService _productService;
    private readonly IValidator<CreateProductDto> _validator;

    public ProductsController(IProductService productService, IValidator<CreateProductDto> validator)
    {
        _productService = productService;
        _validator = validator; // Garson artık kural kitabını biliyor
    }

    [HttpPost]
    public async Task<IActionResult> Create(CreateProductDto dto)
    {
        // 1. Gelen siparişi kural kitabına göre denetle
        var validationResult = await _validator.ValidateAsync(dto);
        if (!validationResult.IsValid)
        {
            return BadRequest(validationResult.Errors); // Hatalıysa mutfağa sokma, hatayı geri fırlat
        }

        var result = await _productService.CreateAsync(dto);
        return Ok(result);
    }

    [HttpGet]
    public async Task<IActionResult> GetAll()
    {
        var result = await _productService.GetAllAsync();
        return Ok(result);
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> GetById(Guid id)
    {
        var result = await _productService.GetByIdAsync(id);
        if (result == null) return NotFound();
        return Ok(result);
    }

    [HttpPut]
    public async Task<IActionResult> Update(UpdateProductDto dto)
    {
        var result = await _productService.UpdateAsync(dto);
        if (result == null) return NotFound();
        return Ok(result);
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(Guid id)
    {
        var result = await _productService.DeleteAsync(id);
        if (!result) return NotFound();
        return NoContent(); // 204 No Content (Başarıyla silindi)
    }

}