using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using TicariERP.Infrastructure.Identity;

namespace TicariERP.Api.Controllers;

[Route("api/[controller]")]
[ApiController]
[Authorize] // Güvenlik mührü: Sadece token'ı olan (giriş yapmış) kullanıcılar buraya istek atabilir.
public class ProfileController : ControllerBase
{
    private readonly UserManager<AppUser> _userManager;

    // Identity'nin kullanıcı yöneticisini (UserManager) içeri alıyoruz
    public ProfileController(UserManager<AppUser> userManager)
    {
        _userManager = userManager;
    }

    [HttpPost("upload-photo")]
    public async Task<IActionResult> UploadPhoto([FromBody] UploadPhotoDto dto)
    {
        // 1. Token'ın içinden o anki kullanıcının kimliğini (ID) buluyoruz
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (userId == null) return Unauthorized(new { Message = "Yetkisiz erişim." });

        // 2. Veritabanından kullanıcıyı getiriyoruz
        var user = await _userManager.FindByIdAsync(userId);
        if (user == null) return NotFound(new { Message = "Kullanıcı bulunamadı." });

        // 3. React'ten gelen Base64 metin (Fotoğraf) verisini veritabanı sütununa yazıyoruz
        user.ProfilePhoto = dto.Photo;

        var result = await _userManager.UpdateAsync(user);

        if (!result.Succeeded)
            return BadRequest(new { Message = "Fotoğraf kaydedilirken bir hata oluştu." });

        return Ok(new { Message = "Profil fotoğrafı başarıyla güncellendi." });
    }

    [HttpGet("get-photo")]
    public async Task<IActionResult> GetPhoto()
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (userId == null) return Unauthorized();

        var user = await _userManager.FindByIdAsync(userId);
        if (user == null) return NotFound();

        // Kullanıcının fotoğrafını React'e (Navbar'da göstermesi için) gönderiyoruz
        return Ok(new { Photo = user.ProfilePhoto });
    }
}

// React'ten gelecek JSON verisini karşılayacak küçük taşıyıcı model
public class UploadPhotoDto
{
    public string Photo { get; set; } = string.Empty;
}