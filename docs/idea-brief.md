---
status: Draft
owner: "Bohdan Sokhatiuk"
updated_at: "2026-10-30"
depth: "medium"
---

# Idea brief — telegram-booking

## 1. Raw idea

Source: `idea.md` (repo root), supplied by the owner with the request "запусти інтервью по ідеї D:\github\agent_workflow\idea.md". Copied verbatim:

`````markdown
# Ідея: онлайн-запис для малого бізнесу в Telegram → каталог послуг

## Суть

Сервіс онлайн-запису для підприємців, які працюють за попереднім записом: стоматології, салони краси, перукарні, масажисти, приватні клініки тощо. Бізнес підключає свого Telegram-бота, налаштовує послуги, працівників і їхні графіки. Клієнти записуються прямо в Telegram, не встановлюючи окремого застосунку й не дзвонячи адміністратору.

**Довгострокова мета:** коли на сервісі буде достатньо бізнесів, на основі їхніх даних (послуги, ціни, адреси, спеціалісти, вільний час) зробити **каталог**, де клієнт шукає не конкретний салон, а потрібну послугу поруч із вільним часом і записується в один клік.

## Ролі

| Роль | Хто це | Що робить |
|---|---|---|
| **Власник / адміністратор бізнесу** | Той, хто підключив бота | Реєструє організацію, веде каталог послуг і список працівників |
| **Працівник (спеціаліст)** | Лікар, майстер, перукар | Веде свій профіль, обирає послуги, які надає, задає робочий графік, бачить і змінює свої записи |
| **Клієнт** | Користувач Telegram | Записується на послугу, бачить свої записи, переносить або скасовує їх |

Роль визначається автоматично під час входу: якщо Telegram-акаунт прив'язаний до працівника організації, людина потрапляє в кабінет працівника, інакше вона клієнт.

## Сутності

- **Організація**: назва, контактний телефон, адреса (місто, вулиця, будинок). Одна організація відповідає одному боту, і всі дані ізольовані в межах організації.
- **Послуга**: назва (унікальна в межах організації), ціна, тривалість у годинах з кроком 0,5 год.
- **Працівник**: ПІБ, телефон (ідентифікатор у межах організації), email, спеціалізація, опис «про себе», фото, перелік послуг, які він надає (зв'язок «багато до багатьох» з послугами).
- **Клієнт**: Telegram-ідентифікатор, ім'я, прізвище, телефон (можна поділитися контактом з Telegram), дата першого й останнього візиту в бот.
- **Робочий графік працівника**: години змін і циклічний шаблон робочих днів (див. нижче).
- **Запис (візит)**: клієнт (ім'я, телефон), працівник, послуга, початок, кінець, коментар, дата створення, статус.

## Онбординг бізнесу

1. Власник відкриває бота й проходить покрокову форму: назва і телефон організації → адреса → пароль.
2. Додає послуги (назва, ціна, тривалість).
3. Додає працівників (ім'я, телефон, спеціалізація).
4. Кожен працівник заходить у свій профіль, обирає свої послуги, додає фото й опис та налаштовує графік.

## Робочий графік: ключова логіка

- **Зміни.** У працівника є одна або дві зміни на день, кожна зі своїми годинами (наприклад, 09:00–14:00 і 15:00–20:00). Система перевіряє, що початок зміни раніше за її кінець.
- **Циклічний шаблон днів.** Працівник позначає в календарі робочі дні на кілька тижнів наперед (до 4). З цього будується шаблон: тиждень 1, тиждень 2, … з робочими днями тижня. Далі шаблон повторюється по колу від дати початку. Так покриваються графіки на кшталт «2 через 2», «тиждень так, тиждень інакше», ковзні вихідні.
- **Окремий шаблон для кожної зміни.** Друга зміна має власний цикл і власну дату старту.
- **Неробочі дні.** Свята, лікарняні, відпустки повністю закривають день (у старій версії це було лише заготовкою).
- **Сітка слотів 30 хв.** Кожен день ділиться на 30-хвилинні слоти зі статусами: `вільний`, `зайнятий` (з прив'язкою до запису), `неробочий час`, `вихідний`.

## Пошук вільного часу

- Горизонт для клієнта становить найближчий тиждень, починаючи з поточного моменту. Минулий час не пропонується.
- Слот підходить, якщо від нього поспіль іде достатньо вільних 30-хвилинних слотів, щоб вмістити тривалість послуги (послуга на 1,5 год потребує трьох вільних слотів підряд).
- Зайнятість рахується лише за активними записами, скасовані й перенесені не блокують час.
- Кінець запису = початок + тривалість послуги.

## Запис клієнта

Покроковий майстер:

1. **Вибір точки входу:** спочатку послуга або спочатку спеціаліст.
   - Через послугу: список послуг з цінами → список спеціалістів, які її надають (фото, ім'я, спеціалізація).
   - Через спеціаліста: список спеціалістів → лише ті послуги, які він надає.
2. **Вибір вільного часу:** дні тижня зі списком доступних стартових слотів.
3. **Підтвердження деталей візиту:** адреса, спеціаліст, послуга, ціна, час.
4. **Контактні дані:** прізвище, ім'я, телефон (підставляються з профілю, якщо вже відомі), коментар.
5. Запис створено, клієнт повертається в головне меню.

## Кабінет клієнта

- Меню: «Запис», «Мої записи», «Про мене», «Про організацію».
- «Мої записи» поділено на **майбутні** й **минулі** та згруповано по днях. Для кожного запису видно спеціаліста, послугу, ціну й час.
- Деталі запису: ім'я, телефон, дата й час, адреса, спеціаліст, послуга, коментар.
- Для майбутнього запису доступні дії **«Перенести»** (вибір нового вільного часу в того ж спеціаліста на ту ж послугу) і **«Скасувати»**, обидві з підтвердженням.

## Кабінет працівника

- Профіль: ПІБ, телефон, email, спеціалізація, опис, фото, вибір своїх послуг.
- **Календар-розклад** у вигляді тижневої сітки «дні × 30-хвилинні слоти» з навігацією по тижнях (півроку назад і вперед). Вільні, зайняті та неробочі слоти розрізняються візуально.
- **Ручне додавання запису** у вільний слот, наприклад коли клієнт подзвонив або прийшов без запису: ім'я, телефон, послуга, час, коментар.
- **Редагування запису:** зміна часу, послуги, даних клієнта.
- **Скасування запису.**
- **Список записів** від сьогодні вперед, згрупований по днях.

## Життєвий цикл запису

```
створено (активний) ──► скасовано (клієнтом або працівником)
        │
        └──► перенесено: старий запис отримує статус «перенесено»,
             створюється новий активний запис з новим часом
```

Записи ніколи не видаляються фізично, лише змінюють статус. Так зберігається історія, з якої пізніше можна будувати аналітику.

## Сповіщення (заплановано, не доведено до кінця)

- Повідомлення працівнику, коли клієнт створив, переніс або скасував запис.
- Повідомлення клієнту, коли працівник скасував або змінив запис.
- Нагадування клієнту перед візитом.
- Канал доставки: той самий Telegram-бот організації.

## Що було задумано, але не реалізовано

- Звіти для власника: завантаження спеціалістів, популярні послуги, виручка, скасування.
- Нагадування про візит.
- Керування неробочими днями (свята, лікарняні) через інтерфейс.
- QR-код на бота, щоб розмістити його в закладі для швидкого запису.
- Аналітика переходів користувачів по екранах.

## Відомі прогалини бізнес-логіки (виправити в новій версії)

- Немає перевірки на накладання записів, коли працівник додає запис вручну або переносить його.
- Немає перевірки, що ціна й тривалість послуги додатні та кратні 30 хв.
- Немає повноцінної авторизації власника й працівника: пароль задається, але не перевіряється.
- Видалення послуги чи працівника не враховує майбутні записи, які на них посилаються.
- Немає правил скасування, наприклад «не пізніше ніж за N годин».
- Часовий пояс організації не враховується.

## Вектор розвитку: каталог

1. **Сервіс запису (MVP):** одна організація = один бот, усе описане вище.
2. **Публічний профіль організації:** адреса, послуги з цінами, спеціалісти, рейтинг.
3. **Каталог:** спільна вітрина всіх підключених організацій.
   - пошук за послугою, містом або районом, ціною;
   - фільтр «є вільний час сьогодні / завтра / у вибраний день»;
   - запис напряму з каталогу через той самий механізм вільних слотів;
   - відгуки й рейтинги після завершеного візиту.
4. **Монетизація (гіпотези):** підписка для бізнесу, просування в каталозі, комісія за запис з каталогу.
`````

## 2. Problem

This is a learning problem, not a market problem. The owner wants to find out how this idea can be built **faster and with better quality**, in both design and services, than the earlier attempt (owner-reported, Q1). That attempt left gaps that the raw idea records: missing overlap checks, unchecked passwords, ignored timezone, and unbuilt notifications and day-off management (raw idea, "Відомі прогалини" and "Що було задумано, але не реалізовано").

The desired outcome is observable. Within one month the owner, working alone, produces four things:
- a working Telegram booking service for the core flow;
- clean architecture and services;
- a deliberately designed UX;
- tests with CI and a deployment.

All four are required (owner-reported, Q2).

Not part of this problem: whether businesses would pay for or adopt the service. The earlier version never had real users (owner-reported, Q1), and no demand evidence is sought in this pass.

## 3. Users

- **Primary actor of this project: the owner as a solo builder** (owner-reported, Q1–Q3). The project succeeds when the owner can show it was built faster and better than the previous attempt.
- **Product actors, as described in the raw idea:** business owner/administrator, employee (specialist), and client (a Telegram user). These are design personas only. No real businesses or clients are involved: the previous version had no real users (owner-reported, Q1), and none are planned for this pass (assumption, not discussed).

## 4. Why now

No market trigger. The owner wants to build the idea as a pet project during a course, to see how it could be implemented faster and with better quality in both design and services (owner-reported, Q1). The previous version never had real business users (owner-reported, Q1), so no usage history or feedback exists.

Constraints from the course (owner-reported, Q2):
- time budget: under one month;
- team: solo;
- definition of success, all four required: a working Telegram bot; clean architecture and services; high-quality UX/design; tests, CI and deployment.

## 5. Out of scope

Agreed with the owner in Q5, which chose the "core booking" option:
- **Catalog, public organization profile, ratings and reviews, monetization.** The long-term vector stays in §1 but is not part of this course pass, because the time budget is under one month and the owner works solo.
- **Notifications and reminders.** Deferred so the time goes into quality, tests and deployment. Reminders would need a background scheduler.
- **Owner reports, screen-transition analytics, QR code.**
- **Real businesses and real client data.** The deployed demo is closed: only the owner, course peers and reviewers can reach it, and they use synthetic or test data (owner decision, Q8). This is why the "never delete" rule needs no erasure or anonymization mechanism in this pass.

Constraints to preserve:
- Every actor uses the product inside Telegram (owner-reported, raw idea).
- The interface is a Telegram Mini App for all three roles. The chat bot stays the entry point (owner decision, Q6).
- **One shared service bot**, not one bot per business. An organization is selected through a direct link with a start parameter. The role is decided server-side from the validated Telegram user, never from the link (owner decision, Q9). This changes the raw idea's "одна організація відповідає одному боту". In Q7 the owner first chose to defer the question; Q9 reopened it after the critique (finding F2, §6).
- Records are never physically deleted; they only change status (raw idea).

## 6. Risks

Weakest consequential assumption first:

1. **The scope may not fit one solo month alongside all four success criteria.** This is an assumption, and it is the weakest one. The schedule engine has two shifts, each with its own cyclic template of up to 4 weeks and its own start date. On top of that come the timezone, the slot search and the 30-minute grid. Building it alongside three role UIs and fixing six known gaps could squeeze out tests, CI and deployment.
   - The cut-line is not yet defined. Neither in-scope nor out-of-scope says where non-working days go.
   - The fully reversible mitigation is to set up CI and deployment early and keep a ranked cut list.
2. **Role binding is unspecified.** The raw idea says the role follows the link between a Telegram account and an employee, but not how that link is created. If the link were made by matching a phone number the user types in, or taken from a client-supplied start parameter, a stranger could open an employee cabinet. The chosen shared-bot model makes a single validation rule possible. The binding rule itself goes to specify (§8).
3. **"Faster and better" has no baseline.** Without the earlier attempt's duration and defects, the comparison can only be qualitative.
4. **No-delete plus personal data.** Mitigated by the closed demo (Q8). It comes back as a risk if the demo is ever opened to the public.

Evidence ledger:

| Claim / question | Class | Source / origin | Finding / limit |
|---|---|---|---|
| The earlier version had no real business users | owner-reported | Q1 | No usage data exists to learn from |
| Purpose is a course pet project; goal is faster and better design and services | owner-reported | Q1 | — |
| Under 1 month, solo, all four criteria required | owner-reported | Q2–Q4 | — |
| Scope is core booking; interface is a Mini App for all roles | owner decision | Q5, Q6 | — |
| Closed demo with synthetic data; one shared bot | owner decision | Q8, Q9 | — |
| A Mini App backend can verify the Telegram user via signed `initData` (`user.id`, `auth_date`, HMAC-SHA-256 keyed from the bot token, or Ed25519 with Telegram's public key) | source-verified | https://core.telegram.org/bots/webapps, retrieved 2026-10-30 (first 100k chars read) | Supports dropping the unchecked password in favour of Telegram identity. That is an inference, not yet a decision |
| Direct links `t.me/<bot>/<app>?startapp=<param>` pass `start_param` to the Mini App | source-verified | same page, 2026-10-30 | The page states no length limit for `startapp`. `start_param` is client-visible, so it must not carry authority |
| The scope fits in one month | assumption | interviewer inference | Not verified; see risk 1 |

Critique: an **independent** clean-context devils-advocate pass (interview mode, 2026-10-30) returned three findings: F1 scope vs the success bar plus the missing baseline, F2 role binding and bot topology, F3 no-delete plus personal data. They are hypotheses, not incidents. The owner resolved F3 (Q8) and F2's topology part (Q9); the rest is in §8.

## 7. Recommendation

**Direction (owner-accepted, Q10).** Build the core booking service as a course pet project, solo, in under one month. It covers:
- a single organization with services and employees;
- shift schedules with cyclic templates;
- client booking, reschedule and cancel;
- the employee calendar and manual booking;
- fixes for the known gaps: overlap checks, price and duration validation, timezone, auth.

Delivery choices:
- one Telegram Mini App for all three roles, with a single shared bot as the entry point;
- identity from Telegram, validated server-side;
- a closed demo with synthetic data.

**Intended observable result.** At the end of the month there are four pieces of evidence, one per success criterion: a deployed bot and Mini App where a test client can book, reschedule and cancel; a documented architecture; designed screens; and a green CI pipeline with tests.

**Major tradeoff.** The Mini App gives a real UI for the weekly slot grid and something to show for design. In return it adds a frontend and a second deployment to a solo month. The shared bot departs from the raw idea's per-business bot: businesses lose a branded bot, but the project gains one auth rule and a natural path to the catalog.

**Rejected alternatives:**
- *Core plus notifications.* Needs a background scheduler, and the time is better spent on quality.
- *Thin slice without cyclic templates.* Drops the most interesting part of the idea.
- *Chat-only UI.* A weekly grid is impractical in chat buttons, and it leaves little design to show.
- *Per-business bots.* Token storage, per-bot validation and more work, and the catalog would still need a shared entry point.

**Owner's next step (Q10):** go to `roadmap` first, to lay out the stages (core, then notifications, then public profile and catalog) and set the cut-line for the course month before `specify`.

Outcome: ready-for-roadmap

## 8. Open questions

| Question | Consequence | Blocking? | Verification action | Owner |
|---|---|---|---|---|
| Rule for binding each role: how an employee's Telegram account is linked (owner invite vs verified contact), and how the first owner of an organization is established | Decides access to clients' personal data; without it the auth gap stays open | Non-blocking for specify; must be resolved there | Decide in `specify` acceptance criteria; add tests for forged or stale `initData` and for a crafted `start_param` | Bohdan Sokhatiuk |
| Do non-working days (holidays, sick leave) stay in the core, and is there a ranked cut list if time runs short? | Without a cut-line, tests and CI get squeezed out at the end | Non-blocking | Rank the core features in `specify` or `roadmap`; mark what gets dropped first | Bohdan Sokhatiuk |
| Baseline for "faster and better": how long the earlier attempt took and which defects it had | Without it the result can only be compared qualitatively | Non-blocking | Owner writes down an approximate duration and the known-gap list (already in §1) as the baseline | Bohdan Sokhatiuk |
| Is the unchecked password replaced by Telegram identity alone? | Simplifies the auth scope | Non-blocking | Confirm in `specify`; the evidence in §6 supports it | Bohdan Sokhatiuk |
