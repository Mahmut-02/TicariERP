using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using Microsoft.AspNetCore.Identity;
using Microsoft.Extensions.Configuration;
using Microsoft.IdentityModel.Tokens;
using TicariERP.Application.Interfaces;
using TicariERP.Infrastructure.Identity;

namespace TicariERP.Infrastructure.Services;

public class AuthService : IAuthService
{
    private readonly UserManager<AppUser> _userManager;
    private readonly IConfiguration _configuration;

    // IConfiguration aracını da Dependency Injection ile sisteme dahil ettik
    public AuthService(UserManager<AppUser> userManager, IConfiguration configuration)
    {
        _userManager = userManager;
        _configuration = configuration;
    }

    public async Task<bool> RegisterAsync(string email, string password, string firstName, string lastName)
    {
        var user = new AppUser
        {
            UserName = email,
            Email = email,
            FirstName = firstName,
            LastName = lastName
        };

        var result = await _userManager.CreateAsync(user, password);
        return result.Succeeded;
    }

    public async Task<string> LoginAsync(string email, string password)
    {
        // 1. Veritabanından e-posta adresine sahip kullanıcıyı bul
        var user = await _userManager.FindByEmailAsync(email);
        if (user == null) return string.Empty; // Kullanıcı yoksa boş dön

        // 2. Kullanıcının şifresi doğru mu kontrol et
        var isPasswordValid = await _userManager.CheckPasswordAsync(user, password);
        if (!isPasswordValid) return string.Empty; // Şifre yanlışsa boş dön

        // 3. Şifre doğruysa JWT Token (Kimlik Kartı) oluşturma işlemine başla
        var tokenHandler = new JwtSecurityTokenHandler();
        
        // appsettings.json içindeki gizli anahtarımızı (Secret Key) byte dizisine çeviriyoruz
        var key = Encoding.ASCII.GetBytes(_configuration["Jwt:Key"]!);

        // Token'ın içine koyacağımız bilgiler (Kimlik üzerinde yazacaklar)
        var tokenDescriptor = new SecurityTokenDescriptor
        {
            Subject = new ClaimsIdentity(new[]
            {
                new Claim(ClaimTypes.NameIdentifier, user.Id),
                new Claim(ClaimTypes.Email, user.Email!),
                new Claim(ClaimTypes.Name, $"{user.FirstName} {user.LastName}")
            }),
            Expires = DateTime.UtcNow.AddHours(2), // Token 2 saat sonra iptal olacak
            Issuer = _configuration["Jwt:Issuer"],
            Audience = _configuration["Jwt:Audience"],
            SigningCredentials = new SigningCredentials(new SymmetricSecurityKey(key), SecurityAlgorithms.HmacSha256Signature)
        };

        // 4. Token'ı yarat ve metin (string) formatında geri döndür
        var token = tokenHandler.CreateToken(tokenDescriptor);
        return tokenHandler.WriteToken(token);
    }
}