using FluentValidation;
using TicariERP.Application.DTOs.Products;

namespace TicariERP.Application.Validators;

public class UpdateProductDtoValidator : AbstractValidator<UpdateProductDto>
{
    public UpdateProductDtoValidator()
    {
        RuleFor(x => x.Id).NotEmpty().WithMessage("Ürün ID boş olamaz.");
        
        RuleFor(x => x.Name)
            .NotEmpty().WithMessage("Ürün adı boş bırakılamaz.")
            .MaximumLength(100).WithMessage("Ürün adı en fazla 100 karakter olabilir.");

        RuleFor(x => x.Price)
            .GreaterThan(0).WithMessage("Ürün fiyatı 0'dan büyük olmalıdır.");

        RuleFor(x => x.StockQuantity)
            .GreaterThanOrEqualTo(0).WithMessage("Stok adedi negatif bir değer olamaz.");
    }
}