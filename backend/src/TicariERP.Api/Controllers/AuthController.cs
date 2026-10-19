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
        var isSuccess = await _authService.RegisterAsync(request.Email, request.Password, request.FirstName, request.LastName);
        if (isSuccess) return Ok(new { message = "Kullanıcı başarıyla oluşturuldu." });
        return BadRequest(new { message = "Kullanıcı oluşturulamadı. E-posta kayıtlı veya şifre zayıf." });
    }

    [HttpPost("login")]
    public async Task<IActionResult> Login([FromBody] LoginRequest request)
    {
        var token = await _authService.LoginAsync(request.Email, request.Password);
        if (string.IsNullOrEmpty(token)) return Unauthorized(new { message = "E-posta veya şifre hatalı." });
        return Ok(new { token = token });
    }

    // YENİ: Rol Oluşturma Metodu
    [HttpPost("create-role")]
    public async Task<IActionResult> CreateRole([FromBody] CreateRoleRequest request)
    {
        var isSuccess = await _authService.CreateRoleAsync(request.RoleName);
        if (isSuccess) return Ok(new { message = $"'{request.RoleName}' rolü başarıyla oluşturuldu." });
        return BadRequest(new { message = "Rol oluşturulurken bir hata oluştu." });
    }

    // YENİ: Kullanıcıya Rol Atama Metodu
    [HttpPost("assign-role")]
    public async Task<IActionResult> AssignRole([FromBody] AssignRoleRequest request)
    {
        var isSuccess = await _authService.AssignRoleAsync(request.Email, request.RoleName);
        if (isSuccess) return Ok(new { message = $"'{request.RoleName}' rolü, {request.Email} kullanıcısına atandı." });
        return BadRequest(new { message = "Rol atanamadı. Kullanıcı veya rol bulunamadı." });
    }
}

public class RegisterRequest
{
    public string Email { get; set; } = string.Empty;
    public string Password { get; set; } = string.Empty;
    public string FirstName { get; set; } = string.Empty;
    public string LastName { get; set; } = string.Empty;
}

public class LoginRequest
{
    public string Email { get; set; } = string.Empty;
    public string Password { get; set; } = string.Empty;
}

// YENİ: Rol Taşıyıcı Sınıfları
public class CreateRoleRequest
{
    public string RoleName { get; set; } = string.Empty;
}

public class AssignRoleRequest
{
    public string Email { get; set; } = string.Empty;
    public string RoleName { get; set; } = string.Empty;
}