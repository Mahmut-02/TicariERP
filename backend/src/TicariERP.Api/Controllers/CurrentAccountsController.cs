using Microsoft.AspNetCore.Mvc;
using TicariERP.Application.DTOs.CurrentAccounts;
using TicariERP.Application.Interfaces;

namespace TicariERP.Api.Controllers;

[Route("api/[controller]")]
[ApiController]
// React (Frontend) uygulamasından gelen HTTP isteklerini karşılayan ve ilgili Service katmanına yönlendiren API denetleyicisidir.
public class CurrentAccountsController : ControllerBase
{
    private readonly ICurrentAccountService _currentAccountService;

    // IoC Container, constructor (yapıcı metot) aracılığıyla ICurrentAccountService örneğini buraya enjekte eder.
    public CurrentAccountsController(ICurrentAccountService currentAccountService)
    {
        _currentAccountService = currentAccountService;
    }

    [HttpGet]
    public async Task<IActionResult> GetAll()
    {
        // Tüm cari hesapları getirir ve 200 OK HTTP durum koduyla JSON olarak döner.
        var currentAccounts = await _currentAccountService.GetAllAsync();
        return Ok(currentAccounts);
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> GetById(Guid id)
    {
        var currentAccount = await _currentAccountService.GetByIdAsync(id);
        if (currentAccount == null)
            return NotFound(new { Message = "Kayıt bulunamadı." }); // 404 Not Found döner.

        return Ok(currentAccount);
    }

    [HttpPost]
    public async Task<IActionResult> Create([FromBody] CreateCurrentAccountDto dto)
    {
        // FluentValidation (Kural Denetleyicisi) bu metoda girmeden önce DTO'yu otomatik kontrol eder.
        // Kurallara uyuyorsa işleme devam edilir, uymuyorsa sistem otomatik 400 Bad Request döner.
        await _currentAccountService.AddAsync(dto);
        return Ok(new { Message = "Cari hesap başarıyla eklendi." });
    }

    // 1. DÜZELTME: React'ten gelen URL'deki "{id}" parametresi eklendi
    [HttpPut("{id}")]
    public async Task<IActionResult> Update(Guid id, [FromBody] UpdateCurrentAccountDto dto)
    {
        // Gelen id'yi DTO içindeki Id'ye eşitliyoruz ki servis hangi kaydı güncelleyeceğini bilsin
        dto.Id = id;
        await _currentAccountService.UpdateAsync(dto);
        return Ok(new { Message = "Cari hesap başarıyla güncellendi." });
    }

    // 2. DÜZELTME: 500 Hatasını önlemek için Try-Catch bloğu eklendi
    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(Guid id)
    {
        try
        {
            await _currentAccountService.DeleteAsync(id);
            return Ok(new { Message = "Cari hesap başarıyla silindi." });
        }
        catch (Exception)
        {
            // Veritabanı "Silinemez!" diye bağırırsa sistem çökmeyecek, Frontend'e bu uyarıyı gönderecek:
            return BadRequest(new { Message = "Bu müşteriye ait kesilmiş faturalar var! Silmek için önce faturaları iptal etmelisiniz." });
        }
    }
}