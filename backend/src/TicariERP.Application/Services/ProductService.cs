using TicariERP.Application.DTOs.Products;
using TicariERP.Application.Interfaces;
using TicariERP.Domain.Entities;

namespace TicariERP.Application.Services;

public class ProductService : IProductService
{
    private readonly IProductRepository _repository;

    public ProductService(IProductRepository repository)
    {
        _repository = repository; // Yamak (Repository) aşçıya teslim ediliyor
    }

    public async Task<ProductResponseDto> CreateAsync(CreateProductDto dto)
    {
        // 1. Dışarıdan gelen DTO'yu gerçek Domain iskeletine çevir
        var product = new Product
        {
            Name = dto.Name,
            Description = dto.Description,
            Price = dto.Price,
            StockQuantity = dto.StockQuantity
        };

        // 2. Yamak aracılığıyla veritabanına kaydet
        await _repository.AddAsync(product);

        // 3. Controller'a dönecek olan yanıtı hazırla
        return new ProductResponseDto
        {
            Id = product.Id, Name = product.Name, Description = product.Description,
            Price = product.Price, StockQuantity = product.StockQuantity, CreatedDate = product.CreatedDate
        };
    }

    public async Task<List<ProductResponseDto>> GetAllAsync()
    {
        var products = await _repository.GetAllAsync();
        return products.Select(p => new ProductResponseDto
        {
            Id = p.Id, Name = p.Name, Description = p.Description, 
            Price = p.Price, StockQuantity = p.StockQuantity, CreatedDate = p.CreatedDate
        }).ToList();
    }

    public async Task<ProductResponseDto?> GetByIdAsync(Guid id)
    {
        var product = await _repository.GetByIdAsync(id);
        if (product == null) return null;

        return new ProductResponseDto
        {
            Id = product.Id, Name = product.Name, Description = product.Description, 
            Price = product.Price, StockQuantity = product.StockQuantity, CreatedDate = product.CreatedDate
        };
    }

    public async Task<bool> DeleteAsync(Guid id)
    {
        var product = await _repository.GetByIdAsync(id);
        if (product == null) return false;

        await _repository.DeleteAsync(product);
        return true;
    }
}