using Microsoft.EntityFrameworkCore;
using TicariERP.Application.DTOs.Warehouses;
using TicariERP.Application.Interfaces;
using TicariERP.Domain.Entities;
using TicariERP.Infrastructure.Persistence;

namespace TicariERP.Infrastructure.Services;

public class WarehouseService : IWarehouseService
{
    private readonly ErpDbContext _context;

    public WarehouseService(ErpDbContext context)
    {
        _context = context;
    }

    public async Task<List<WarehouseDto>> GetAllAsync()
    {
        return await _context.Warehouses
            .OrderByDescending(w => w.IsDefault)
            .ThenBy(w => w.Name)
            .Select(w => new WarehouseDto
            {
                Id = w.Id,
                Code = w.Code,
                Name = w.Name,
                Address = w.Address,
                IsDefault = w.IsDefault,
                IsActive = w.IsActive
            })
            .ToListAsync();
    }

    public async Task<WarehouseDto?> GetByIdAsync(Guid id)
    {
        return await _context.Warehouses
            .Where(w => w.Id == id)
            .Select(w => new WarehouseDto
            {
                Id = w.Id,
                Code = w.Code,
                Name = w.Name,
                Address = w.Address,
                IsDefault = w.IsDefault,
                IsActive = w.IsActive
            })
            .FirstOrDefaultAsync();
    }

    public async Task<WarehouseDto> CreateAsync(CreateWarehouseDto dto)
    {
        var normalizedCode = dto.Code.Trim().ToUpperInvariant();

        if (await _context.Warehouses.AnyAsync(w => w.Code == normalizedCode))
            throw new InvalidOperationException($"'{normalizedCode}' kodlu depo zaten mevcut.");

        var hasAnyWarehouse = await _context.Warehouses.AnyAsync();
        var shouldBeDefault = dto.IsDefault || !hasAnyWarehouse;

        if (shouldBeDefault)
        {
            var currentDefaults = await _context.Warehouses.Where(w => w.IsDefault).ToListAsync();
            foreach (var item in currentDefaults)
                item.IsDefault = false;
        }

        var warehouse = new Warehouse
        {
            Code = normalizedCode,
            Name = dto.Name.Trim(),
            Address = dto.Address?.Trim(),
            IsDefault = shouldBeDefault,
            IsActive = true
        };

        _context.Warehouses.Add(warehouse);
        await _context.SaveChangesAsync();

        return new WarehouseDto
        {
            Id = warehouse.Id,
            Code = warehouse.Code,
            Name = warehouse.Name,
            Address = warehouse.Address,
            IsDefault = warehouse.IsDefault,
            IsActive = warehouse.IsActive
        };
    }

    public async Task<bool> UpdateAsync(Guid id, UpdateWarehouseDto dto)
    {
        var warehouse = await _context.Warehouses.FindAsync(id);
        if (warehouse == null) return false;

        var normalizedCode = dto.Code.Trim().ToUpperInvariant();
        var codeExists = await _context.Warehouses
            .AnyAsync(w => w.Code == normalizedCode && w.Id != id);

        if (codeExists)
            throw new InvalidOperationException($"'{normalizedCode}' kodlu başka bir depo zaten mevcut.");

        if (dto.IsDefault && !warehouse.IsDefault)
        {
            var currentDefaults = await _context.Warehouses
                .Where(w => w.IsDefault && w.Id != id)
                .ToListAsync();

            foreach (var item in currentDefaults)
                item.IsDefault = false;
        }

        warehouse.Code = normalizedCode;
        warehouse.Name = dto.Name.Trim();
        warehouse.Address = dto.Address?.Trim();
        warehouse.IsDefault = dto.IsDefault;
        warehouse.IsActive = dto.IsActive;

        await _context.SaveChangesAsync();
        return true;
    }

    public async Task<bool> DeleteAsync(Guid id)
    {
        var warehouse = await _context.Warehouses.FindAsync(id);
        if (warehouse == null) return false;

        var hasMovements = await _context.StockMovements.AnyAsync(sm => sm.WarehouseId == id);
        if (hasMovements)
            throw new InvalidOperationException("Stok hareketi bulunan bir depo silinemez. Bunun yerine pasife alabilirsiniz.");

        _context.Warehouses.Remove(warehouse);
        await _context.SaveChangesAsync();
        return true;
    }
}