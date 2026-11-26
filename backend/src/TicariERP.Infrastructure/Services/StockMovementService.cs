using Microsoft.EntityFrameworkCore;
using TicariERP.Application.DTOs.StockMovements;
using TicariERP.Application.Interfaces;
using TicariERP.Domain.Entities;
using TicariERP.Domain.Enums;
using TicariERP.Infrastructure.Persistence;

namespace TicariERP.Infrastructure.Services;

public class StockMovementService : IStockMovementService
{
    private readonly ErpDbContext _context;

    public StockMovementService(ErpDbContext context)
    {
        _context = context;
    }

    public async Task<List<StockMovementDto>> GetAllAsync(Guid? productId = null, Guid? warehouseId = null)
    {
        var query = _context.StockMovements
            .Include(sm => sm.Product)
            .Include(sm => sm.Warehouse)
            .AsQueryable();

        if (productId.HasValue)
            query = query.Where(sm => sm.ProductId == productId.Value);

        if (warehouseId.HasValue)
            query = query.Where(sm => sm.WarehouseId == warehouseId.Value);

        var movements = await query
            .OrderByDescending(sm => sm.MovementDate)
            .ToListAsync();

        return movements.Select(sm => new StockMovementDto
        {
            Id = sm.Id,
            ProductId = sm.ProductId,
            ProductName = sm.Product.Name,
            Unit = sm.Product.Unit,
            WarehouseId = sm.WarehouseId,
            WarehouseName = sm.Warehouse.Name,
            MovementType = sm.MovementType,
            MovementTypeName = GetMovementTypeName(sm.MovementType),
            Quantity = sm.Quantity,
            ReferenceNo = sm.ReferenceNo,
            Description = sm.Description,
            MovementDate = sm.MovementDate
        }).ToList();
    }

    public async Task<StockMovementDto> CreateMovementAsync(CreateStockMovementDto dto)
    {
        if (dto.Quantity <= 0)
            throw new InvalidOperationException("Miktar 0'dan büyük olmalıdır.");

        var product = await _context.Products.FindAsync(dto.ProductId)
            ?? throw new InvalidOperationException("Ürün bulunamadı.");

        var warehouse = await _context.Warehouses.FindAsync(dto.WarehouseId)
            ?? throw new InvalidOperationException("Depo bulunamadı.");

        var isInflow = IsInflow(dto.MovementType);
        var intQuantity = Convert.ToInt32(dto.Quantity);

        if (!isInflow && product.StockQuantity < intQuantity)
            throw new InvalidOperationException($"Yetersiz stok. Mevcut toplam stok: {product.StockQuantity}");

        await using var transaction = await _context.Database.BeginTransactionAsync();
        try
        {
            var movement = new StockMovement
            {
                ProductId = dto.ProductId,
                WarehouseId = dto.WarehouseId,
                MovementType = dto.MovementType,
                Quantity = dto.Quantity,
                ReferenceNo = dto.ReferenceNo?.Trim(),
                Description = dto.Description?.Trim(),
                MovementDate = DateTime.UtcNow
            };

            _context.StockMovements.Add(movement);

            product.StockQuantity = isInflow
                ? product.StockQuantity + intQuantity
                : product.StockQuantity - intQuantity;

            await _context.SaveChangesAsync();
            await transaction.CommitAsync();

            return new StockMovementDto
            {
                Id = movement.Id,
                ProductId = movement.ProductId,
                ProductName = product.Name,
                Unit = product.Unit,
                WarehouseId = movement.WarehouseId,
                WarehouseName = warehouse.Name,
                MovementType = movement.MovementType,
                MovementTypeName = GetMovementTypeName(movement.MovementType),
                Quantity = movement.Quantity,
                ReferenceNo = movement.ReferenceNo,
                Description = movement.Description,
                MovementDate = movement.MovementDate
            };
        }
        catch
        {
            await transaction.RollbackAsync();
            throw;
        }
    }

    public async Task TransferStockAsync(TransferStockDto dto)
    {
        if (dto.Quantity <= 0)
            throw new InvalidOperationException("Transfer miktarı 0'dan büyük olmalıdır.");

        if (dto.SourceWarehouseId == dto.TargetWarehouseId)
            throw new InvalidOperationException("Kaynak ve hedef depo aynı olamaz.");

        var productExists = await _context.Products.AnyAsync(p => p.Id == dto.ProductId);
        if (!productExists)
            throw new InvalidOperationException("Ürün bulunamadı.");

        var sourceWarehouse = await _context.Warehouses.FindAsync(dto.SourceWarehouseId)
            ?? throw new InvalidOperationException("Kaynak depo bulunamadı.");

        var targetWarehouse = await _context.Warehouses.FindAsync(dto.TargetWarehouseId)
            ?? throw new InvalidOperationException("Hedef depo bulunamadı.");

        var sourceMovements = await _context.StockMovements
            .Where(sm => sm.ProductId == dto.ProductId && sm.WarehouseId == dto.SourceWarehouseId)
            .ToListAsync();

        var sourceBalance = sourceMovements.Sum(sm => IsInflow(sm.MovementType) ? sm.Quantity : -sm.Quantity);

        if (sourceBalance < dto.Quantity)
            throw new InvalidOperationException($"Kaynak depoda ({sourceWarehouse.Name}) yeterli stok yok. Mevcut depo stoğu: {sourceBalance}");

        await using var transaction = await _context.Database.BeginTransactionAsync();
        try
        {
            var now = DateTime.UtcNow;
            var reference = string.IsNullOrWhiteSpace(dto.ReferenceNo)
                ? $"TRF-{now:yyyyMMddHHmmss}"
                : dto.ReferenceNo.Trim();

            var outMovement = new StockMovement
            {
                ProductId = dto.ProductId,
                WarehouseId = dto.SourceWarehouseId,
                MovementType = StockMovementType.TransferOut,
                Quantity = dto.Quantity,
                ReferenceNo = reference,
                Description = dto.Description ?? $"{targetWarehouse.Name} deposuna transfer çıkışı",
                MovementDate = now
            };

            var inMovement = new StockMovement
            {
                ProductId = dto.ProductId,
                WarehouseId = dto.TargetWarehouseId,
                MovementType = StockMovementType.TransferIn,
                Quantity = dto.Quantity,
                ReferenceNo = reference,
                Description = dto.Description ?? $"{sourceWarehouse.Name} deposundan transfer girişi",
                MovementDate = now
            };

            _context.StockMovements.AddRange(outMovement, inMovement);
            await _context.SaveChangesAsync();
            await transaction.CommitAsync();
        }
        catch
        {
            await transaction.RollbackAsync();
            throw;
        }
    }

    private static bool IsInflow(StockMovementType type) => type is
        StockMovementType.PurchaseIn or
        StockMovementType.TransferIn or
        StockMovementType.AdjustmentIn or
        StockMovementType.ReturnIn;

    private static string GetMovementTypeName(StockMovementType type) => type switch
    {
        StockMovementType.PurchaseIn => "Satın Alma Girişi",
        StockMovementType.SalesOut => "Satış Çıkışı",
        StockMovementType.TransferIn => "Depo Transfer Girişi",
        StockMovementType.TransferOut => "Depo Transfer Çıkışı",
        StockMovementType.AdjustmentIn => "Sayım Fazlası (Giriş)",
        StockMovementType.AdjustmentOut => "Sayım Eksiği / Fire (Çıkış)",
        StockMovementType.ReturnIn => "Müşteri İadesi (Giriş)",
        StockMovementType.ReturnOut => "Tedarikçi İadesi (Çıkış)",
        _ => type.ToString()
    };
}