using TicariERP.Application.DTOs.Products;

namespace TicariERP.Application.Interfaces;

public interface IProductService
{
    Task<List<ProductResponseDto>> GetAllAsync();
    Task<ProductResponseDto?> GetByIdAsync(Guid id);
    Task<ProductResponseDto> CreateAsync(CreateProductDto dto);
    Task<bool> DeleteAsync(Guid id);
}