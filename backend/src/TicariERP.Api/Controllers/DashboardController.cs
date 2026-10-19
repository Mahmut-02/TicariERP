using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace TicariERP.Api.Controllers;

[Authorize] // İŞTE KİLİT BU! Bu etiket olmadan kimse bu sınıfa giremez.
[ApiController]
[Route("api/[controller]")]
public class DashboardController : ControllerBase
{
    [HttpGet("my-profile")]
    public IActionResult GetMyProfile()
    {
        // Güvenlik görevlimiz (API), Token'ın içindeki bilgileri okuyup bize veriyor
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        var email = User.FindFirstValue(ClaimTypes.Email);
        var name = User.FindFirstValue(ClaimTypes.Name);

        return Ok(new 
        { 
            message = "Güvenli alana başarıyla giriş yaptınız!",
            userInfo = new 
            { 
                Id = userId, 
                Name = name, 
                Email = email 
            }
        });
    }
}