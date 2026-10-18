export const OPERATOR_CODES = ["25", "29", "33", "44", "17"] as const;

export type PhoneCheck =
  { ok: true; phone: string } | { ok: false; error: "empty" | "format" | "operator" };

export const PHONE_HINT = "Белорусский номер, например +375 29 123-45-67";

export const PHONE_ERRORS: Record<"empty" | "format" | "operator", string> = {
  empty: "Укажите телефон, чтобы мы могли перезвонить",
  format: "Этот номер не подходит. Нужен белорусский: +375 и 9 цифр, например +375 29 123-45-67",
  operator: "Такого кода нет. Подойдут 25, 29, 33, 44 или городской Минска 17",
};

export function checkPhone(input: string): PhoneCheck {
  const raw = input.trim();
  if (!raw) return { ok: false, error: "empty" };
  if (raw.length > 32 || /[^\d\s()+\-.]/.test(raw)) return { ok: false, error: "format" };

  let digits = raw.replace(/\D/g, "");
  if (digits.length === 11 && digits.startsWith("80")) digits = "375" + digits.slice(2);
  else if (digits.length === 9) digits = "375" + digits;
  if (raw.startsWith("+") && !raw.startsWith("+375")) return { ok: false, error: "format" };
  if (digits.length !== 12 || !digits.startsWith("375")) return { ok: false, error: "format" };

  const code = digits.slice(3, 5);
  if (!(OPERATOR_CODES as readonly string[]).includes(code))
    return { ok: false, error: "operator" };
  return { ok: true, phone: "+" + digits };
}

export function formatPhone(phone: string): string {
  const m = /^\+375(\d{2})(\d{3})(\d{2})(\d{2})$/.exec(phone);
  return m ? `+375 ${m[1]} ${m[2]}-${m[3]}-${m[4]}` : phone;
}
