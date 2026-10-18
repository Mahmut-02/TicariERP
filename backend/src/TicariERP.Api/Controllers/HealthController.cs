using Microsoft.AspNetCore.Mvc;

namespace TicariERP.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class HealthController : ControllerBase
{
    [HttpGet]
    public IActionResult Get()
    {
        return Ok(new { message = "TicariERP API çalışıyor!", timestamp = System.DateTime.UtcNow });
    }
}