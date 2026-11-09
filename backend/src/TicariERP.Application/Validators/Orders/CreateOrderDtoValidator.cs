using FluentValidation;
using TicariERP.Application.DTOs.Orders;

namespace TicariERP.Application.Validators.Orders;

// Ana sepetin kuralları
public class CreateOrderDtoValidator : AbstractValidator<CreateOrderDto>
{
    public CreateOrderDtoValidator()
    {
        RuleFor(x => x.CurrentAccountId)
            .NotEmpty().WithMessage("Siparişe ait bir cari hesap (müşteri) seçilmelidir.");

        RuleFor(x => x.OrderDate)
            .NotEmpty().WithMessage("Sipariş tarihi boş bırakılamaz.");

        // Kalemler listesi boş olamaz (En az 1 ürün satılmalı)
        RuleFor(x => x.Details)
            .NotEmpty().WithMessage("Siparişte en az bir ürün kalemi bulunmalıdır.");

        // EFSANE ÖZELLİK: Ana sepeti kontrol ederken, içindeki alt sepetleri de diğer kural dosyamıza (CreateOrderDetailDtoValidator) gönderip tek tek denetletiyoruz!
        RuleForEach(x => x.Details)
            .SetValidator(new CreateOrderDetailDtoValidator());
    }
}