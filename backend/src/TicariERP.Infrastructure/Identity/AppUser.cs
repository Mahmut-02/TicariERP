using Microsoft.AspNetCore.Identity;

namespace TicariERP.Infrastructure.Identity;

public class AppUser : IdentityUser
{
    // Kendi eklediğimiz özel alanlar
    public string FirstName { get; set; } = string.Empty;
    public string LastName { get; set; } = string.Empty;

    // YENİ EKLENEN ALAN: Profil fotoğrafını Base64 (Metin) olarak tutacak sütun
    public string? ProfilePhoto { get; set; }
}