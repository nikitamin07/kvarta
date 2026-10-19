"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import { useOrder } from "@/context/OrderProvider";
import { sendLead, type LeadBody } from "@/lib/api";
import { captureSource } from "@/lib/attribution";
import { CATALOG, findProduct } from "@/lib/catalog";
import { SHOP_PHONE, SHOP_PHONE_DISPLAY } from "@/lib/contacts";
import { NAME_MAX, TEXT_MAX, validateLead, type FieldErrors, type LeadSource } from "@/lib/lead";
import { lineLabel, priceOrder } from "@/lib/order";
import { formatPhone, PHONE_HINT } from "@/lib/phone";
import styles from "./leadForm.module.css";
import { LeadChoice, slide } from "./LeadChoice";
import { useSlideHeight } from "./useSlideHeight";

type Message = { ok: boolean; text: string; call?: boolean };

const STEP_FIELDS = ["name", "phone"] as const;

export function LeadForm() {
  const { qty, subs, interest, step, setStep } = useOrder();
  const [question, setQuestion] = useState("");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [comment, setComment] = useState("");
  const [tried, setTried] = useState(false);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [message, setMessage] = useState<Message | null>(null);

  const busy = useRef(false);
  const startedAt = useRef(0);
  const source = useRef<LeadSource | null>(null);
  const website = useRef<HTMLInputElement>(null);
  const nameRef = useRef<HTMLInputElement>(null);
  const phoneRef = useRef<HTMLInputElement>(null);
  const pickedRef = useRef<HTMLButtonElement>(null);
  const focusAfter = useRef<"name" | "picked" | null>(null);

  useEffect(() => {
    startedAt.current = Date.now();
    source.current = captureSource();
  }, []);

  useEffect(() => {
    const target = focusAfter.current === "name" ? nameRef : pickedRef;
    if (focusAfter.current) target.current?.focus({ preventScroll: true });
    focusAfter.current = null;
  }, [step]);

  const items = CATALOG.map((p) => ({ id: p.id, qty: qty[p.id] })).filter((i) => i.qty > 0);
  const { lines, total } = priceOrder(items);

  const stepError =
    interest === "order" && total === 0
      ? "Добавьте хотя бы одну пачку плюсом"
      : interest === "subscription" && !subs.length
        ? "Отметьте хотя бы один сорт"
        : interest === "question" && !question.trim()
          ? "Напишите вопрос, чтобы менеджер подготовился к звонку"
          : "";

  // ошибки и сообщения тоже двигают высоту
  const stepsRef = useSlideHeight<HTMLDivElement>(
    [step, tried && stepError, message?.text, errors.name?.[0], errors.phone?.[0]].join("|"),
  );

  const subsText = subs.map((id) => findProduct(id)!.short).join(" + ");
  const summary =
    interest === "order"
      ? `Заказ: ${lines.map(lineLabel).join(", ")}, ${total} BYN`
      : interest === "subscription"
        ? `Подписка: ${subs.length === 1 ? `${subsText} × 2` : subsText}`
        : `Вопрос: ${question.slice(0, 80)}`;

  function next() {
    setTried(!!stepError);
    if (stepError) return;
    focusAfter.current = "name";
    setStep(2);
  }

  function back() {
    focusAfter.current = "picked";
    setStep(1);
  }

  function showErrors(found: FieldErrors) {
    setErrors(found);
    const other = Object.entries(found)
      .filter(([field]) => !(STEP_FIELDS as readonly string[]).includes(field))
      .flatMap(([, texts]) => texts ?? []);
    setMessage(other.length ? { ok: false, text: other.join(". ") } : null);
    if (found.name || found.phone) (found.name ? nameRef : phoneRef).current?.focus();
  }

  async function submit(e: FormEvent) {
    e.preventDefault();
    if (step !== 2 || sent || busy.current) return;
    const body: LeadBody = {
      name,
      phone,
      interest,
      items: interest === "order" ? items : [],
      subs: interest === "subscription" ? subs : [],
      question: interest === "question" ? question : "",
      comment,
      source: source.current,
      website: website.current?.value ?? "",
      startedAt: startedAt.current,
    };
    const check = validateLead(body);
    if (!check.ok) return showErrors(check.errors);

    busy.current = true;
    setSending(true);
    setMessage(null);
    try {
      const result = await sendLead(body);
      const ph = formatPhone(check.data.phone);
      if (result.kind === "sent") {
        setSent(true);
        setMessage({ ok: true, text: `Спасибо, заявка у нас. Перезвоним на ${ph}.` });
      } else if (result.kind === "duplicate") {
        setSent(true);
        setMessage({
          ok: true,
          text: `Заявка с номера ${ph} уже у нас, повторять не нужно. Изменить детали можно по телефону`,
          call: true,
        });
      } else if (result.kind === "invalid") {
        showErrors(result.errors);
      } else {
        setMessage({
          ok: false,
          text:
            result.kind === "rate-limited"
              ? "Слишком много попыток. Попробуйте через несколько минут или позвоните:"
              : "Не получилось отправить заявку. Попробуйте ещё раз или позвоните:",
          call: true,
        });
      }
    } finally {
      busy.current = false;
      setSending(false);
    }
  }

  const phoneBad = !!errors.phone;

  return (
    <form className={styles.form} noValidate onSubmit={submit}>
      <div className={styles.progress} aria-hidden="true">
        <i className={styles.on} />
        <i className={step === 2 ? styles.on : undefined} />
      </div>
      <p className={styles.stepL}>Шаг {step} из 2</p>

      <div ref={stepsRef} className={styles.slides}>
        <div {...slide(0, step - 1)}>
          <div className={styles.foldIn}>
            <LeadChoice
              total={total}
              question={question}
              onQuestion={setQuestion}
              error={tried ? stepError : ""}
              onPick={() => setTried(false)}
              onNext={next}
              pickedRef={pickedRef}
            />
          </div>
        </div>

        <div {...slide(1, step - 1)}>
          <div className={styles.foldIn}>
            <p className={styles.note}>{summary}</p>
            <div className={styles.field}>
              <label className={styles.lbl} htmlFor="k-name">
                Ваше имя
              </label>
              <input
                ref={nameRef}
                className={errors.name ? `${styles.inp} ${styles.bad}` : styles.inp}
                id="k-name"
                autoComplete="given-name"
                maxLength={NAME_MAX}
                value={name}
                aria-invalid={!!errors.name}
                aria-describedby={errors.name ? "k-name-err" : undefined}
                onChange={(e) => {
                  setName(e.target.value);
                  setErrors((prev) => ({ ...prev, name: undefined }));
                }}
              />
              {errors.name && (
                <span className={`${styles.hint} ${styles.bad}`} id="k-name-err">
                  {errors.name[0]}
                </span>
              )}
            </div>
            <div className={styles.field}>
              <label className={styles.lbl} htmlFor="k-phone">
                Телефон
              </label>
              <input
                ref={phoneRef}
                className={phoneBad ? `${styles.inp} ${styles.bad}` : styles.inp}
                id="k-phone"
                type="tel"
                inputMode="tel"
                autoComplete="tel"
                placeholder="+375 29 123-45-67"
                value={phone}
                aria-invalid={phoneBad}
                aria-describedby="k-hint"
                onChange={(e) => {
                  setPhone(e.target.value);
                  setErrors((prev) => ({ ...prev, phone: undefined }));
                }}
              />
              <span className={phoneBad ? `${styles.hint} ${styles.bad}` : styles.hint} id="k-hint">
                {errors.phone?.[0] ?? PHONE_HINT}
              </span>
            </div>
            <div className={styles.field}>
              <label className={styles.lbl} htmlFor="k-comment">
                Комментарий
              </label>
              <textarea
                className={styles.inp}
                id="k-comment"
                maxLength={TEXT_MAX}
                placeholder="Помол, удобное время звонка, адрес доставки"
                value={comment}
                onChange={(e) => setComment(e.target.value)}
              />
            </div>
            <div className={styles.trap} aria-hidden="true">
              <label htmlFor="k-website">Сайт</label>
              <input ref={website} id="k-website" tabIndex={-1} autoComplete="off" />
            </div>
            {message && (
              <p
                className={message.ok ? styles.msg : styles.err}
                role={message.ok ? "status" : "alert"}
              >
                {message.text}
                {message.call && (
                  <>
                    {" "}
                    <a href={`tel:${SHOP_PHONE}`}>{SHOP_PHONE_DISPLAY}</a>
                  </>
                )}
              </p>
            )}
            <div className={styles.btns}>
              <button className="btn" type="submit" disabled={sending || sent}>
                {sending ? "Отправляем…" : sent ? "Заявка отправлена" : "Отправить заявку"}
              </button>
              <button className={styles.back} type="button" onClick={back}>
                Назад
              </button>
            </div>
            <p className={styles.consent}>
              Отправляя заявку, вы соглашаетесь на обработку телефона для обратного звонка.
            </p>
          </div>
        </div>
      </div>
    </form>
  );
}
