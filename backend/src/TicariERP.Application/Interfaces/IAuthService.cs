namespace TicariERP.Application.Interfaces;

public interface IAuthService
{
    Task<bool> RegisterAsync(string email, string password, string firstName, string lastName);
    Task<string> LoginAsync(string email, string password);
    
    // YENİ EKLENENLER: Rol Yönetimi
    Task<bool> CreateRoleAsync(string roleName);
    Task<bool> AssignRoleAsync(string email, string roleName);
}