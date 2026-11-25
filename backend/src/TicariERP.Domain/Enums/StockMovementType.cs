namespace TicariERP.Domain.Enums;

public enum StockMovementType
{
    PurchaseIn = 1,    // Satın alma / Mal kabul (Giriş)
    SalesOut = 2,      // Satış / Sevkiyat (Çıkış)
    TransferIn = 3,    // Depolar arası transfer (Giriş)
    TransferOut = 4,   // Depolar arası transfer (Çıkış)
    AdjustmentIn = 5,  // Sayım fazlası / Düzeltme (Giriş)
    AdjustmentOut = 6, // Sayım eksiği / Fire (Çıkış)
    ReturnIn = 7,      // Müşteri iadesi (Giriş)
    ReturnOut = 8      // Tedarikçiye iade (Çıkış)
}