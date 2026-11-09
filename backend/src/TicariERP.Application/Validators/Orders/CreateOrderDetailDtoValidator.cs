using FluentValidation;
using TicariERP.Application.DTOs.Orders;

namespace TicariERP.Application.Validators.Orders;

// Alt sepetin (ürün satırlarının) kuralları
public class CreateOrderDetailDtoValidator : AbstractValidator<CreateOrderDetailDto>
{
    public CreateOrderDetailDtoValidator()
    {
        RuleFor(x => x.ProductId)
            .NotEmpty().WithMessage("Ürün seçimi zorunludur.");

        RuleFor(x => x.Quantity)
            .GreaterThan(0).WithMessage("Satış miktarı 0'dan büyük olmalıdır.");

        RuleFor(x => x.UnitPrice)
            .GreaterThanOrEqualTo(0).WithMessage("Birim fiyat 0'dan küçük olamaz.");
    }
}