namespace TicariERP.Application.Interfaces;

public interface IAuthService
{
    // Önceki adımda yazdığımız Kayıt olma sözleşmesi
    Task<bool> RegisterAsync(string email, string password, string firstName, string lastName);

    // YENİ EKLENEN: Giriş yapma sözleşmesi. 
    // İşlem başarılıysa Token (string) dönecek, başarısızsa boş dönecek.
    Task<string> LoginAsync(string email, string password);
}