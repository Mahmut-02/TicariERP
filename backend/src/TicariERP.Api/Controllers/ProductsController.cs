using Microsoft.AspNetCore.Mvc;
using TicariERP.Application.DTOs.Products;
using TicariERP.Application.Interfaces;

namespace TicariERP.Api.Controllers;

[Route("api/[controller]")]
[ApiController]
public class ProductsController : ControllerBase
{
    private readonly IProductService _productService;

    public ProductsController(IProductService productService)
    {
        _productService = productService; // Garson, aşçının kim olduğunu öğreniyor
    }

    [HttpPost]
    public async Task<IActionResult> Create(CreateProductDto dto)
    {
        var result = await _productService.CreateAsync(dto);
        return Ok(result);
    }

    [HttpGet]
    public async Task<IActionResult> GetAll()
    {
        var result = await _productService.GetAllAsync();
        return Ok(result);
    }
}