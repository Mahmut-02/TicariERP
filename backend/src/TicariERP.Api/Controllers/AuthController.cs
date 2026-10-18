using Microsoft.AspNetCore.Mvc;
using TicariERP.Application.Interfaces;

namespace TicariERP.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AuthController : ControllerBase
{
    private readonly IAuthService _authService;

    public AuthController(IAuthService authService)
    {
        _authService = authService;
    }

    [HttpPost("register")]
    public async Task<IActionResult> Register([FromBody] RegisterRequest request)
    {
        var isSuccess = await _authService.RegisterAsync(
            request.Email, 
            request.Password, 
            request.FirstName, 
            request.LastName);

        if (isSuccess)
        {
            return Ok(new { message = "Kullanıcı başarıyla oluşturuldu." });
        }

        return BadRequest(new { message = "Kullanıcı oluşturulamadı. E-posta adresi zaten kayıtlı veya şifre kurallara uymuyor olabilir." });
    }

    // YENİ EKLENEN GİRİŞ (LOGIN) METODU
    [HttpPost("login")]
    public async Task<IActionResult> Login([FromBody] LoginRequest request)
    {
        // Gelen e-posta ve şifreyi mutfağa (AuthService) gönderip Token istiyoruz
        var token = await _authService.LoginAsync(request.Email, request.Password);

        // Eğer dönen token boşsa, şifre/email yanlış demektir
        if (string.IsNullOrEmpty(token))
        {
            return Unauthorized(new { message = "E-posta veya şifre hatalı." }); // HTTP 401
        }

        // Başarılıysa üretilen uzun şifreli metni (JWT) JSON olarak geri dönüyoruz
        return Ok(new { token = token }); // HTTP 200
    }
}

public class RegisterRequest
{
    public string Email { get; set; } = string.Empty;
    public string Password { get; set; } = string.Empty;
    public string FirstName { get; set; } = string.Empty;
    public string LastName { get; set; } = string.Empty;
}

// YENİ EKLENEN GİRİŞ TAŞIYICI SINIFI
public class LoginRequest
{
    public string Email { get; set; } = string.Empty;
    public string Password { get; set; } = string.Empty;
}