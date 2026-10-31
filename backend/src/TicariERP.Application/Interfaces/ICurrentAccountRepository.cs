using TicariERP.Domain.Entities;

namespace TicariERP.Application.Interfaces;

// Veri erişim katmanının (Data Access Layer) soyutlamasıdır.
// İş mantığı (Service) katmanı, veritabanı teknolojisinden (EF Core, SQL vb.) bağımsız olmak için doğrudan bu arayüzü kullanır.
public interface ICurrentAccountRepository
{
    Task<IEnumerable<CurrentAccount>> GetAllAsync();
    Task<CurrentAccount?> GetByIdAsync(Guid id);
    Task AddAsync(CurrentAccount currentAccount);
    Task UpdateAsync(CurrentAccount currentAccount);
    Task DeleteAsync(Guid id);
}