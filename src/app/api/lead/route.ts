import { after } from "next/server";
import { looksLikeBot, validateLead, type FieldErrors } from "@/lib/lead";
import { insertLead, toLeadRecord } from "@/lib/leads";
import { leadMessage, sendToTelegram } from "@/lib/telegram";

const MAX_BODY = 16_000;
const SAVE_FAILED =
  "Не получилось сохранить заявку. Попробуйте ещё раз через минуту или позвоните нам";

function reply(status: number, body: object) {
  return Response.json(body, { status, headers: { "Cache-Control": "no-store" } });
}

function fail(status: number, message: string, errors: FieldErrors = {}) {
  return reply(status, { message, errors });
}

export async function POST(request: Request) {
  const bytes = await request.arrayBuffer();
  if (bytes.byteLength > MAX_BODY) return fail(413, "Заявка слишком большая");

  let body: unknown;
  try {
    // не utf8 даст ошибку, а не знаки вопроса
    body = JSON.parse(new TextDecoder("utf-8", { fatal: true }).decode(bytes));
  } catch {
    return fail(400, "Не удалось прочитать заявку");
  }

  // боту отвечаем как человеку и ничего не пишем
  if (looksLikeBot(body, Date.now())) return reply(200, { ok: true, duplicate: false });

  const result = validateLead(body);
  if (!result.ok) return fail(422, "Проверьте поля формы", result.errors);

  const record = toLeadRecord(result.data, request.headers.get("user-agent"));
  try {
    const saved = await insertLead(record);
    if (!saved) return reply(200, { ok: true, duplicate: true });
    after(() => sendToTelegram(leadMessage(record, saved.id)));
    return reply(200, { ok: true, duplicate: false });
  } catch (error) {
    console.error("lead: insert failed", error);
    return fail(500, SAVE_FAILED);
  }
}
