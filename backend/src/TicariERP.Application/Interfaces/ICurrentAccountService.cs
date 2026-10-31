using TicariERP.Application.DTOs.CurrentAccounts;
using TicariERP.Domain.Entities;

namespace TicariERP.Application.Interfaces;

// İş mantığı (Business Logic) katmanının dış dünyaya (Controller) sunduğu sözleşmedir.
// Gelen isteklerin DTO (Data Transfer Object) üzerinden alınmasını ve işlenmesini tanımlar.
public interface ICurrentAccountService
{
    Task<IEnumerable<CurrentAccount>> GetAllAsync();
    Task<CurrentAccount?> GetByIdAsync(Guid id);
    Task AddAsync(CreateCurrentAccountDto dto);
    Task UpdateAsync(UpdateCurrentAccountDto dto);
    Task DeleteAsync(Guid id);
}