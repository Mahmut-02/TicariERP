using Microsoft.AspNetCore.Identity;
using TicariERP.Application.Interfaces;
using TicariERP.Infrastructure.Identity;

namespace TicariERP.Infrastructure.Services;

// Sınıfımızın IAuthService sözleşmesine uyacağını belirtiyoruz ( : IAuthService )
public class AuthService : IAuthService
{
    private readonly UserManager<AppUser> _userManager;

    // Dependency Injection (Bağımlılık Enjeksiyonu) ile UserManager'ı sistemden istiyoruz
    public AuthService(UserManager<AppUser> userManager)
    {
        _userManager = userManager;
    }

    public async Task<bool> RegisterAsync(string email, string password, string firstName, string lastName)
    {
        // 1. Kendi oluşturduğumuz AppUser sınıfından yeni bir kullanıcı nesnesi hazırlıyoruz
        var user = new AppUser
        {
            UserName = email, // Giriş için e-posta kullanılacak
            Email = email,
            FirstName = firstName,
            LastName = lastName
        };

        // 2. Identity'nin UserManager motoruna bu kullanıcıyı ve şifresini verip kaydetmesini söylüyoruz.
        // UserManager şifreyi otomatik olarak hash'leyip (şifreleyip) veritabanına yazacak.
        var result = await _userManager.CreateAsync(user, password);

        // 3. İşlem başarılı olduysa true, olmadıysa false döndürüyoruz.
        return result.Succeeded;
    }
}