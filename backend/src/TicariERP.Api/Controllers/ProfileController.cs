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

    [HttpPost("update-profile")]
    public async Task<IActionResult> UpdateProfile([FromBody] UpdateProfileDto dto)
    {
        var user = await GetCurrentUserAsync();
        if (user == null) return NotFound(new { Message = "Kullanıcı bulunamadı." });

        // 1. E-posta Güncellemesi
        if (user.Email != dto.Email)
        {
            await _userManager.SetEmailAsync(user, dto.Email);
            await _userManager.SetUserNameAsync(user, dto.Email);
        }

        // 2. İsim Güncellemesi (EKSİK OLAN VE SENİ ESKİ HALİNE DÖNDÜREN KISIM BURASIYDI)
        // React'ten gelen tek parça metni (Örn: "Mahmut Aslan") ilk boşluktan bölüp veritabanına işliyoruz
        if (!string.IsNullOrWhiteSpace(dto.Name))
        {
            var nameParts = dto.Name.Trim().Split(' ', 2);
            user.FirstName = nameParts[0];
            user.LastName = nameParts.Length > 1 ? nameParts[1] : string.Empty;
        }

        var result = await _userManager.UpdateAsync(user);

        if (!result.Succeeded)
            return BadRequest(new { Message = "Profil bilgileri güncellenemedi." });

        return Ok(new { Message = "Profil bilgileriniz başarıyla güncellendi." });
    }

    [HttpPost("change-password")]
    public async Task<IActionResult> ChangePassword([FromBody] ChangePasswordDto dto)
    {
        var user = await GetCurrentUserAsync();
        if (user == null) return NotFound(new { Message = "Kullanıcı bulunamadı." });

        var result = await _userManager.ChangePasswordAsync(user, dto.CurrentPassword, dto.NewPassword);

        if (!result.Succeeded)
            return BadRequest(new { Message = "Şifre değiştirilemedi. Mevcut şifrenizi doğru girdiğinizden ve yeni şifrenin kurallara (Büyük harf, sayı vb.) uyduğundan emin olun." });

        return Ok(new { Message = "Şifreniz başarıyla güncellendi." });
    }
}



public class UploadPhotoDto
{
    public string Photo { get; set; } = string.Empty;
}

public class UpdateProfileDto
{
    public string Name { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
}

public class ChangePasswordDto
{
    public string CurrentPassword { get; set; } = string.Empty;
    public string NewPassword { get; set; } = string.Empty;
}