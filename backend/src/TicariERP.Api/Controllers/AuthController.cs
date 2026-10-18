using Microsoft.AspNetCore.Mvc;
using TicariERP.Application.Interfaces;

namespace TicariERP.Api.Controllers;

[ApiController]
[Route("api/[controller]")] // Bu, adresin "api/auth" olmasını sağlar
public class AuthController : ControllerBase
{
    private readonly IAuthService _authService;

    // Dependency Injection: Sistemin oluşturduğu AuthService'i garsonumuza (Controller'a) veriyoruz
    public AuthController(IAuthService authService)
    {
        _authService = authService;
    }

    [HttpPost("register")] // Bu metodun adresi: POST /api/auth/register olacak
    public async Task<IActionResult> Register([FromBody] RegisterRequest request)
    {
        // Gelen veriyi (request) mutfağa (AuthService) gönderiyoruz
        var isSuccess = await _authService.RegisterAsync(
            request.Email, 
            request.Password, 
            request.FirstName, 
            request.LastName);

        if (isSuccess)
        {
            // İşlem başarılıysa HTTP 200 (OK) dönüyoruz
            return Ok(new { message = "Kullanıcı başarıyla oluşturuldu." });
        }

        // Başarısızsa HTTP 400 (Bad Request) dönüyoruz
        return BadRequest(new { message = "Kullanıcı oluşturulamadı. E-posta adresi zaten kayıtlı veya şifre kurallara uymuyor olabilir." });
    }
}

// Dışarıdan (React'tan) gelecek JSON verisini karşılayacak taşıyıcı şablonumuz
public class RegisterRequest
{
    public string Email { get; set; } = string.Empty;
    public string Password { get; set; } = string.Empty;
    public string FirstName { get; set; } = string.Empty;
    public string LastName { get; set; } = string.Empty;
}