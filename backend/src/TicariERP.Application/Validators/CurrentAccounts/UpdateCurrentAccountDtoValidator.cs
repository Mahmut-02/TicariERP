using FluentValidation;
using TicariERP.Application.DTOs.CurrentAccounts;

namespace TicariERP.Application.Validators.CurrentAccounts;

public class UpdateCurrentAccountDtoValidator : AbstractValidator<UpdateCurrentAccountDto>
{
    public UpdateCurrentAccountDtoValidator()
    {
        RuleFor(x => x.Id)
            .NotEmpty().WithMessage("Güncellenecek cari hesap bulunamadı.");

        RuleFor(x => x.Code)
            .NotEmpty().WithMessage("Cari kodu boş bırakılamaz.")
            .MaximumLength(50).WithMessage("Cari kodu en fazla 50 karakter olabilir.");

        RuleFor(x => x.Name)
            .NotEmpty().WithMessage("Cari adı veya unvanı boş bırakılamaz.")
            .MaximumLength(200).WithMessage("Cari adı en fazla 200 karakter olabilir.");
    }
}