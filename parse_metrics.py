import json
import os
import re
import sys
from collections import Counter
from datetime import datetime, timedelta

import questionary

_MORPH = None
try:
    import pymorphy3
    _MORPH = pymorphy3.MorphAnalyzer()
except ImportError:
    try:
        import pymorphy2
        _MORPH = pymorphy2.MorphAnalyzer()
    except (ImportError, AttributeError):
        _MORPH = None

STOPWORDS = set("""
и в не на я ты он она они мы вы с что как это то у за из а но да нет
мне меня мой моя моё мои себя тебя тебе твой твоя твоё твои
его ему её ей их им же бы ли или уже еще ещё вот там тут
такой такая только очень тоже всё был была было были
буду будешь будет будем будете будут кто чем чём где когда почему
для от до по об о при без под над между через может можно надо
если чтобы потому нужно нужна нужны могу можешь может знаю знаешь
знает есть хочу хочешь хочет
этот эта эти того той тому тем тех этого этой этому
чтоб сейчас потом теперь опять снова
него неё них нём ней мной тобой собой
вообще наверное вроде кстати
который которая которое кто-то что-то куда-то
хорошо спасибо прости пожалуйста ничего нравится быть рядом
пока раз лучше больше сколько тогда оно дома плохо делать
давай большое хорошая хороший хорошее плохой плохая плохое
нельзя есть был была были будет
опять снова кажется
короче типа блин ладно ага угу окей ок хм ммм эм
такое такие такого такую совсем немного чуть
самое самый самая себе своего своей своим этим этой этому
через тоже также иначе именно
блять чё ну слушай сюда
""".split())

# слова, которые не несут содержательного смысла даже после лемматизации —
# держим отдельно от сырых форм в STOPWORDS (это уже ЛЕММЫ, не словоформы)
LEMMA_STOPWORDS = set("""
хороший спасибо простить пожалуйста ничто нравиться быть рядом
пока раз хорошо больший сколько тогда оно дом плохой делать
давать большой мочь хотеть знать
так сказать говорить сделать какой думать выйти идти сам один весь
просто знать мочь хотеть стать пойти прийти видеть смотреть
это тот этот весь свой самый который
тип
""".split())

# слова, которые по факту одно и то же слово в разных написаниях,
# но лемматизатор их не схлопывает (не словоформы, а разные слова) —
# приводим вручную к единой канонической форме перед подсчётом в общем топе
MANUAL_LEMMA_MERGE = {
    "бля": "блядь",
}

WORD_PATTERN = re.compile(r"[а-яё]+", re.IGNORECASE)

# слово состоит только из латиницы — почти всегда технический мусор
# (ссылки, названия форматов, английские вставки без контекста)
LATIN_ONLY = re.compile(r"^[a-z]+$", re.IGNORECASE)

# повторяющийся смех: ах(а)х(а)... / хах(а)х(а)... в любых пропорциях,
# плюс "шумные" варианты вроде "ахсхвха" — считаем смехом, если почти все
# буквы слова принадлежат "смеховому" алфавиту
LAUGH_PATTERN = re.compile(r"^(?:ха|ах){2,}а?$", re.IGNORECASE)
LAUGH_CHARS = set("ахс")


def is_laughter(w):
    if LAUGH_PATTERN.match(w):
        return True
    if len(w) >= 5:
        laugh_ratio = sum(1 for ch in w if ch in LAUGH_CHARS) / len(w)
        if laugh_ratio >= 0.7:
            return True
    return False

EMOJI_PATTERN = re.compile(
    "["
    "\U0001F300-\U0001FAFF"
    "\U00002600-\U000027BF"
    "\U0001F1E6-\U0001F1FF"
    "\u2764\uFE0F\u200D"
    "]+",
    flags=re.UNICODE,
)


def detect_senders(raw_messages):
    names = Counter()
    for m in raw_messages:
        if m.get("type") == "message" and m.get("from"):
            names[m["from"]] += 1
    return names.most_common()


def extract_text(msg):
    t = msg.get("text")
    if isinstance(t, str):
        return t
    if isinstance(t, list):
        parts = []
        for chunk in t:
            if isinstance(chunk, str):
                parts.append(chunk)
            elif isinstance(chunk, dict):
                parts.append(chunk.get("text", ""))
        return "".join(parts)
    return ""


def load_raw(path):
    with open(path, encoding="utf-8") as f:
        data = json.load(f)
    return data["messages"]


def normalize_word(w):
    """Схлопывает варианты смеха в одну форму и фильтрует латиницу/мусор."""
    if LATIN_ONLY.match(w):
        return None
    if is_laughter(w):
        return "ахах"
    return w


def lemmatize_confident(w):
    """
    Приводит слово к начальной форме, но ТОЛЬКО если pymorphy нашёл его
    в словаре (is_known), а не предсказал по шаблону морфологии.
    Для слов вне словаря (сленг/опечатки/сокращения вроде "пздц")
    предсказание часто даёт мусорную форму — в этом случае просто
    возвращаем слово как есть, не портим его.
    """
    if _MORPH is None:
        return w
    parses = _MORPH.parse(w)
    best = parses[0]
    if not getattr(best, "is_known", False):
        return w
    return best.normal_form


def gather_settings():
    print("=== Парсер метрик Reply 2026 ===\n")

    if _MORPH is None:
        print("Внимание: pymorphy не установлен — слова не будут")
        print("приводиться к начальной форме (см. подсказку по pip в конце).\n")

    while True:
        input_path = questionary.text(
            "Путь к экспорту Telegram (JSON):", default="chat.json"
        ).ask()
        if input_path is None:
            sys.exit(0)  # Ctrl+C
        if os.path.exists(input_path):
            break
        print(f"Файл '{input_path}' не найден, попробуй ещё раз.\n")

    output_path = questionary.text(
        "Куда сохранить metrics.json:", default="public/metrics.json"
    ).ask()

    raw_messages = load_raw(input_path)
    senders = detect_senders(raw_messages)

    if not senders:
        raise SystemExit("В файле не найдено ни одного отправителя сообщений.")

    sender_choices = [f"{name} — {count} сообщений" for name, count in senders]

    me_choice = questionary.select(
        "Кто из них — ты (me)?", choices=sender_choices
    ).ask()
    me_name = senders[sender_choices.index(me_choice)][0]

    her_choices = [c for c in sender_choices if not c.startswith(me_name + " —")]
    her_choice = questionary.select(
        "Кто из них — она (her)?", choices=her_choices
    ).ask()
    her_name = senders[sender_choices.index(her_choice)][0]

    sender_map = {me_name: "me", her_name: "her"}

    include_animation = questionary.confirm(
        "Учитывать гифки/анимации в медиа-статистике?", default=True
    ).ask()

    exclude_forwarded = questionary.confirm(
        "Исключить пересланные сообщения из топа слов?", default=True
    ).ask()

    print(f"\nГотово: {me_name} → me, {her_name} → her")
    print(f"Вход: {input_path}\nВыход: {output_path}\n")

    return {
        "output_path": output_path,
        "sender_map": sender_map,
        "raw_messages": raw_messages,
        "include_animation": include_animation,
        "exclude_forwarded": exclude_forwarded,
    }


def role_of(msg, sender_map):
    return sender_map.get(msg.get("from"))


def main():
    settings = gather_settings()
    sender_map = settings["sender_map"]
    raw = settings["raw_messages"]
    output_path = settings["output_path"]
    exclude_forwarded = settings["exclude_forwarded"]

    messages = [m for m in raw if m.get("type") == "message" and role_of(m, sender_map)]
    total = len(messages)
    print(f"Всего сообщений в анализе: {total}")

    for i, m in enumerate(messages, start=1):
        m["_dt"] = datetime.fromisoformat(m["date"])
        if i % 10000 == 0 or i == total:
            print(f"  обработано {i}/{total}...", end="\r", flush=True)
    print()

    messages.sort(key=lambda m: m["_dt"])

    counts = {"me": 0, "her": 0}
    media_counts = {"me": Counter(), "her": Counter(), "total": Counter()}
    MEDIA_KEYS = {
        "photo": lambda m: "photo" in m,
        "video_message": lambda m: m.get("media_type") == "video_message",
        "voice_message": lambda m: m.get("media_type") == "voice_message",
        "video_file": lambda m: m.get("media_type") == "video_file",
        "animation": lambda m: m.get("media_type") == "animation",
        "sticker": lambda m: "sticker_emoji" in m,
    }
    if not settings["include_animation"]:
        MEDIA_KEYS.pop("animation")

    for m in messages:
        r = role_of(m, sender_map)
        counts[r] += 1
        for key, check in MEDIA_KEYS.items():
            if check(m):
                media_counts[r][key] += 1
                media_counts["total"][key] += 1

    first_date = messages[0]["_dt"].date().isoformat()
    last_date = messages[-1]["_dt"].date().isoformat()
    total_days = (messages[-1]["_dt"].date() - messages[0]["_dt"].date()).days + 1

    score = {
        "date_from": first_date,
        "date_to": last_date,
        "total_days": total_days,
        "total_messages": total,
        "messages_me": counts["me"],
        "messages_her": counts["her"],
        "who_more": "me" if counts["me"] > counts["her"] else "her",
        "media_me": dict(media_counts["me"]),
        "media_her": dict(media_counts["her"]),
        "media_total": dict(media_counts["total"]),
    }

    hour_counts = Counter(m["_dt"].hour for m in messages)
    peak_hour = hour_counts.most_common(1)[0][0]
    hour_histogram = [hour_counts.get(h, 0) for h in range(24)]
    peak = {"peak_hour": peak_hour, "hour_histogram": hour_histogram}

    SKIN_TONES = set("\U0001F3FB\U0001F3FC\U0001F3FD\U0001F3FE\U0001F3FF")
    JUNK_CHARS = {"\uFE0F", "\u200D"} | SKIN_TONES

    emoji_counter = Counter()
    for m in messages:
        text = extract_text(m)
        for ch in text:
            if ch in JUNK_CHARS:
                continue
            if EMOJI_PATTERN.match(ch):
                emoji_counter[ch] += 1
        for reaction in m.get("reactions", []):
            if reaction.get("type") == "emoji":
                emoji_counter[reaction["emoji"]] += reaction.get("count", 1)

    sticker_counter = Counter(m["sticker_emoji"] for m in messages if "sticker_emoji" in m)

    top = {
        "top_emojis": emoji_counter.most_common(10),
        "top_sticker_emoji": sticker_counter.most_common(5),
    }

    days_with_messages = sorted(set(m["_dt"].date() for m in messages))
    longest_streak = 1
    current_streak = 1
    best_end = days_with_messages[0]
    for i in range(1, len(days_with_messages)):
        if (days_with_messages[i] - days_with_messages[i - 1]).days == 1:
            current_streak += 1
        else:
            current_streak = 1
        if current_streak > longest_streak:
            longest_streak = current_streak
            best_end = days_with_messages[i]
    best_start = best_end - timedelta(days=longest_streak - 1)

    longest_gap = timedelta(0)
    longest_gap_start = None
    longest_gap_end = None
    for i in range(1, len(messages)):
        gap = messages[i]["_dt"] - messages[i - 1]["_dt"]
        if gap > longest_gap:
            longest_gap = gap
            longest_gap_start = messages[i - 1]
            longest_gap_end = messages[i]

    streak = {
        "longest_streak_days": longest_streak,
        "streak_start": best_start.isoformat(),
        "streak_end": best_end.isoformat(),
        "longest_pause_hours": round(longest_gap.total_seconds() / 3600, 1),
        "longest_pause_start": longest_gap_start["_dt"].isoformat() if longest_gap_start else None,
        "longest_pause_end": longest_gap_end["_dt"].isoformat() if longest_gap_end else None,
        "longest_pause_broken_by": role_of(longest_gap_end, sender_map) if longest_gap_end else None,
    }

    lemma_word_counters = {"me": Counter(), "her": Counter()}

    for m in messages:
        if exclude_forwarded and m.get("forwarded_from"):
            continue
        role = role_of(m, sender_map)
        text = extract_text(m).lower()
        raw_words = WORD_PATTERN.findall(text)
        for w in raw_words:
            if len(w) < 3:
                continue
            normalized = normalize_word(w)
            if normalized is None:
                continue

            if normalized == "ахах":
                lemma_word_counters[role]["ахах"] += 1
                continue

            lemma = lemmatize_confident(normalized)
            lemma = MANUAL_LEMMA_MERGE.get(lemma, lemma)
            if lemma in STOPWORDS or lemma in LEMMA_STOPWORDS:
                continue
            lemma_word_counters[role][lemma] += 1

    combined_counts = Counter()
    for w in set(lemma_word_counters["me"]) | set(lemma_word_counters["her"]):
        combined_counts[w] = lemma_word_counters["me"][w] + lemma_word_counters["her"][w]

    SHARED_MIN_EACH = 20
    SHARED_MAX_RATIO = 1.6
    shared_frequent = set()
    for w, total in combined_counts.items():
        c_me = lemma_word_counters["me"][w]
        c_her = lemma_word_counters["her"][w]
        if c_me < SHARED_MIN_EACH or c_her < SHARED_MIN_EACH:
            continue
        ratio = max(c_me, c_her) / min(c_me, c_her)
        if ratio <= SHARED_MAX_RATIO:
            shared_frequent.add(w)

    top_words = {
        "me": [
            (w, c) for w, c in lemma_word_counters["me"].most_common(50)
            if w not in shared_frequent
        ][:15],
        "her": [
            (w, c) for w, c in lemma_word_counters["her"].most_common(50)
            if w not in shared_frequent
        ][:15],
    }

    GAP_MINUTES = 30
    initiations = Counter()
    response_times = {"me": [], "her": []}

    prev_msg = None
    for m in messages:
        role = role_of(m, sender_map)
        if prev_msg is None:
            initiations[role] += 1
        else:
            gap = (m["_dt"] - prev_msg["_dt"]).total_seconds() / 60
            prev_role = role_of(prev_msg, sender_map)
            if gap >= GAP_MINUTES:
                initiations[role] += 1
            elif role != prev_role:
                response_times[role].append(gap * 60)
        prev_msg = m

    def median(lst):
        if not lst:
            return None
        s = sorted(lst)
        n = len(s)
        mid = n // 2
        return s[mid] if n % 2 else (s[mid - 1] + s[mid]) / 2

    who_misses_more = {
        "initiations_me": initiations["me"],
        "initiations_her": initiations["her"],
        "initiates_more": "me" if initiations["me"] > initiations["her"] else "her",
        "median_response_seconds_me": median(response_times["me"]),
        "median_response_seconds_her": median(response_times["her"]),
    }

    monthly = Counter()
    daily = Counter()
    for m in messages:
        monthly[m["_dt"].strftime("%Y-%m")] += 1
        daily[m["_dt"].strftime("%Y-%m-%d")] += 1

    monthly_sorted = sorted(monthly.items())
    peak_month = max(monthly.items(), key=lambda kv: kv[1])
    daily_sorted = sorted(daily.items())
    peak_day = max(daily.items(), key=lambda kv: kv[1])

    pulse = {
        "monthly_counts": monthly_sorted,
        "peak_month": peak_month[0],
        "peak_month_count": peak_month[1],
        "daily_counts": daily_sorted,
        "peak_day": peak_day[0],
        "peak_day_count": peak_day[1],
    }

    metrics = {
        "score": score,
        "peak_hour": peak,
        "top_emoji_sticker": top,
        "streak": streak,
        "top_words": top_words,
        "who_misses_more": who_misses_more,
        "pulse": pulse,
    }

    out_dir = os.path.dirname(output_path)
    if out_dir:
        os.makedirs(out_dir, exist_ok=True)

    with open(output_path, "w", encoding="utf-8") as f:
        json.dump(metrics, f, ensure_ascii=False, indent=2)

    # проверка, что записанный файл — валидный JSON и не пустой
    try:
        with open(output_path, encoding="utf-8") as f:
            check = json.load(f)
        assert check.get("score", {}).get("total_messages", 0) > 0
        print(f"\nГотово. Метрики сохранены и проверены: {output_path}")
    except Exception as e:
        print(f"\nОШИБКА: файл записан, но не прошёл проверку валидности: {e}")
        sys.exit(1)


if __name__ == "__main__":
    main()
