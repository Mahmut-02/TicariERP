namespace TicariERP.Application.Interfaces;

public interface IAuthService
{
    // Sadece metodun imzasını (adını ve parametrelerini) yazıyoruz, içini doldurmuyoruz.
    // Kullanıcı kayıt işleminin başarılı olup olmadığını (bool) döndürecek bir sözleşme.
    Task<bool> RegisterAsync(string email, string password, string firstName, string lastName);
}