using TicariERP.Application.DTOs.CurrentAccounts;
using TicariERP.Application.Interfaces;
using TicariERP.Domain.Entities;

namespace TicariERP.Application.Services;

// Uygulamanın ana iş kurallarının işletildiği, DTO - Entity dönüşümlerinin yapıldığı servis sınıfıdır.
// Controller'dan gelen veriyi işler, doğrular ve kalıcılık (persistence) işlemi için Repository'e aktarır.
public class CurrentAccountService : ICurrentAccountService
{
    private readonly ICurrentAccountRepository _repository;

    // Dependency Injection (Bağımlılık Enjeksiyonu) ile Repository arayüzü içeri alınır.
    // Böylece Service katmanı, veritabanının SQL mi yoksa başka bir sistem mi olduğunu bilmez, sadece Interface'e güvenir.
    public CurrentAccountService(ICurrentAccountRepository repository)
    {
        _repository = repository;
    }

    public async Task<IEnumerable<CurrentAccount>> GetAllAsync()
    {
        return await _repository.GetAllAsync();
    }

    public async Task<CurrentAccount?> GetByIdAsync(Guid id)
    {
        return await _repository.GetByIdAsync(id);
    }

    public async Task AddAsync(CreateCurrentAccountDto dto)
    {
        // 1. Controller'dan gelen DTO (Taşıma Nesnesi), veritabanına yazılacak asıl Entity'e dönüştürülür (Mapping).
        var currentAccount = new CurrentAccount
        {
            Id = Guid.NewGuid(),
            Code = dto.Code,
            Name = dto.Name,
            Type = dto.Type,
            TaxOffice = dto.TaxOffice,
            TaxNumber = dto.TaxNumber,
            Address = dto.Address
        };

        // 2. Dönüştürülen nesne, veritabanına eklenmesi için Repository'e iletilir.
        await _repository.AddAsync(currentAccount);
    }

    public async Task UpdateAsync(UpdateCurrentAccountDto dto)
    {
        // 1. Güncellenmek istenen kaydın veritabanında var olup olmadığı kontrol edilir.
        var existingAccount = await _repository.GetByIdAsync(dto.Id);
        if (existingAccount == null) throw new Exception("Cari hesap bulunamadı!");

        // 2. DTO'dan gelen yeni değerler, mevcut Entity üzerine yazılır.
        existingAccount.Code = dto.Code;
        existingAccount.Name = dto.Name;
        existingAccount.Type = dto.Type;
        existingAccount.TaxOffice = dto.TaxOffice;
        existingAccount.TaxNumber = dto.TaxNumber;
        existingAccount.Address = dto.Address;

        // 3. Güncellenen nesne Repository'e iletilir.
        await _repository.UpdateAsync(existingAccount);
    }

    public async Task DeleteAsync(Guid id)
    {
        await _repository.DeleteAsync(id);
    }
}