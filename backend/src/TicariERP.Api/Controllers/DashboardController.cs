using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace TicariERP.Api.Controllers;

// YENİ KİLİT: Artık sadece Token'ında "Admin" rolü olanlar girebilir!
[Authorize(Roles = "Admin")] 
[ApiController]
[Route("api/[controller]")]
public class DashboardController : ControllerBase
{
    [HttpGet("my-profile")]
    public IActionResult GetMyProfile()
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        var email = User.FindFirstValue(ClaimTypes.Email);
        var name = User.FindFirstValue(ClaimTypes.Name);
        
        // Kimlik kartındaki rolleri de okuyup ekrana yazdıralım
        var roles = User.FindAll(ClaimTypes.Role).Select(r => r.Value);

        return Ok(new 
        { 
            message = "Yönetici (Admin) özel alanına başarıyla giriş yaptınız!",
            userInfo = new 
            { 
                Id = userId, 
                Name = name, 
                Email = email,
                Roles = roles
            }
        });
    }
}