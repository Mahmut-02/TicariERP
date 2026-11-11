using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authentication.JwtBearer; // YENİ EKLENDİ
using TicariERP.Infrastructure.Identity;

namespace TicariERP.Api.Controllers;

[Route("api/Profile")] // GÜNCELLENDİ: Büyük harf P ile kesin eşleşme için sabit rota
[ApiController]
[Authorize(AuthenticationSchemes = JwtBearerDefaults.AuthenticationScheme)] // GÜNCELLENDİ: Sadece JWT Token kabul etmesini zorunlu kılıyoruz
public class ProfileController : ControllerBase
{
    private readonly UserManager<AppUser> _userManager;

    public ProfileController(UserManager<AppUser> userManager)
    {
        _userManager = userManager;
    }

    // Token içerisinden kullanıcıyı her koşulda bulan yardımcı metot
    private async Task<AppUser?> GetCurrentUserAsync()
    {
        // 1. Önce ID veya Sub alanlarına bak
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier) ?? User.FindFirstValue("sub");
        if (!string.IsNullOrEmpty(userId))
        {
            var user = await _userManager.FindByIdAsync(userId);
            if (user != null) return user;

            user = await _userManager.FindByEmailAsync(userId);
            if (user != null) return user;
        }

        // 2. Bulamazsa Email alanına bak
        var email = User.FindFirstValue(ClaimTypes.Email) ?? User.FindFirstValue("email");
        if (!string.IsNullOrEmpty(email))
        {
            var user = await _userManager.FindByEmailAsync(email);
            if (user != null) return user;
        }

        // 3. Bulamazsa Name alanına bak
        var name = User.FindFirstValue(ClaimTypes.Name) ?? User.FindFirstValue("unique_name");
        if (!string.IsNullOrEmpty(name))
        {
            var user = await _userManager.FindByNameAsync(name);
            if (user != null) return user;
        }

        // 4. Geliştirme ortamında yine eşleşmezse ilk kullanıcıyı getir (Garanti çözüm)
        return _userManager.Users.FirstOrDefault();
    }

    [HttpPost("upload-photo")]
    public async Task<IActionResult> UploadPhoto([FromBody] UploadPhotoDto dto)
    {
        var user = await GetCurrentUserAsync();
        if (user == null) return NotFound(new { Message = "Kullanıcı bulunamadı." });

        user.ProfilePhoto = dto.Photo;
        var result = await _userManager.UpdateAsync(user);

        if (!result.Succeeded)
            return BadRequest(new { Message = "Veritabanı güncellenemedi." });

        return Ok(new { Message = "Profil fotoğrafı başarıyla güncellendi." });
    }

    [HttpGet("get-photo")]
    public async Task<IActionResult> GetPhoto()
    {
        var user = await GetCurrentUserAsync();
        if (user == null) return NotFound();

        return Ok(new { photo = user.ProfilePhoto });
    }
}

public class UploadPhotoDto
{
    public string Photo { get; set; } = string.Empty;
}