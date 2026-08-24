"""
Парсер метрик для Telegram Wrapped.
Читает result.json (экспорт Telegram Desktop) и считает все метрики,
нужные для 9 карточек. Результат пишется в metrics.json.
"""

import json
import re
from collections import Counter, defaultdict
from datetime import datetime, timedelta


INPUT_PATH = "chat.json"
OUTPUT_PATH = "public/metrics.json"

SENDER_MAP = {
    "секс": "me",
    "🐈🌸": "her",
}

STOPWORDS = set("""
и в не на я ты он она они мы вы с что как это то у за из а но да нет
я мне меня мой моя моё мои себя тебя тебе твой твоя твоё твои
он его ему она её ей они их им же бы ли или уже еще ещё вот там тут
так такой такая только просто очень тоже там все всё был была было были
буду будешь будет будем будете будут кто что чем чём где когда почему
для от до по об о при без под над между через при может можно надо
блять чё ну типа просто короче кароч слушай сюда блин
если чтобы потому нужно нужна нужны могу можешь может знаю знаешь
знает есть был была нет тебя себя своих своё свою свои
хочу хочешь хочет буду было было было было было
это этот эта эти того той тому тем той тех этого этой этому
чтоб кароч типо щас сейчас потом теперь опять снова
меня тебя него неё них нём ней них мной тобой собой
просто вообще короч наверн наверное вроде типо кстати
которые который которая которое кто-то что-то куда-то
""".split())

EMOJI_PATTERN = re.compile(
    "["
    "\U0001F300-\U0001FAFF"
    "\U00002600-\U000027BF"
    "\U0001F1E6-\U0001F1FF"
    "\u2764\uFE0F\u200D"
    "]+",
    flags=re.UNICODE,
)

WORD_PATTERN = re.compile(r"[а-яёa-z]+", re.IGNORECASE)


def extract_text(msg):
    """text field can be a string or a list of mixed strings/dicts."""
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


def load_messages(path):
    with open(path, encoding="utf-8") as f:
        data = json.load(f)
    return data["messages"]


def role_of(msg):
    return SENDER_MAP.get(msg.get("from"))


def main():
    raw = load_messages(INPUT_PATH)
    messages = [m for m in raw if m.get("type") == "message" and role_of(m)]
    print(f"Всего сообщений в анализе: {len(messages)}")

    for m in messages:
        m["_dt"] = datetime.fromisoformat(m["date"])

    messages.sort(key=lambda m: m["_dt"])

    counts = {"me": 0, "her": 0}
    media_counts = {
        "me": Counter(), "her": Counter(), "total": Counter()
    }
    MEDIA_KEYS = {
        "photo": lambda m: "photo" in m,
        "video_message": lambda m: m.get("media_type") == "video_message",
        "voice_message": lambda m: m.get("media_type") == "voice_message",
        "video_file": lambda m: m.get("media_type") == "video_file",
        "animation": lambda m: m.get("media_type") == "animation",
        "sticker": lambda m: "sticker_emoji" in m,
    }

    for m in messages:
        r = role_of(m)
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
        "total_messages": len(messages),
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

    peak = {
        "peak_hour": peak_hour,
        "hour_histogram": hour_histogram,
    }

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

    sticker_counter = Counter(
        m["sticker_emoji"] for m in messages if "sticker_emoji" in m
    )

    top = {
        "top_emojis": emoji_counter.most_common(10),
        "top_sticker_emoji": sticker_counter.most_common(5),
    }

    night_hours = set(range(0, 6))
    morning_hours = set(range(6, 12))
    owl_lark = {}
    for role in ("me", "her"):
        role_msgs = [m for m in messages if role_of(m) == role]
        night = sum(1 for m in role_msgs if m["_dt"].hour in night_hours)
        morning = sum(1 for m in role_msgs if m["_dt"].hour in morning_hours)
        owl_lark[role] = {
            "night_count": night,
            "morning_count": morning,
            "night_share": round(night / len(role_msgs), 3) if role_msgs else 0,
        }

    days_with_messages = sorted(set(m["_dt"].date() for m in messages))
    longest_streak = 1
    current_streak = 1
    streak_end = days_with_messages[0]
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
        "longest_pause_broken_by": role_of(longest_gap_end) if longest_gap_end else None,
    }

    word_counters = {"me": Counter(), "her": Counter()}
    for m in messages:
        role = role_of(m)
        text = extract_text(m).lower()
        words = WORD_PATTERN.findall(text)
        for w in words:
            if len(w) < 3 or w in STOPWORDS:
                continue
            word_counters[role][w] += 1

    top_words = {
        "me": word_counters["me"].most_common(15),
        "her": word_counters["her"].most_common(15),
    }

    MIN_USES = 15
    total_me = sum(word_counters["me"].values())
    total_her = sum(word_counters["her"].values())

    all_words = set(word_counters["me"]) | set(word_counters["her"])
    distinct_me = []
    distinct_her = []
    for w in all_words:
        c_me = word_counters["me"][w]
        c_her = word_counters["her"][w]
        if c_me + c_her < MIN_USES:
            continue

        rate_me = c_me / total_me
        rate_her = c_her / total_her
        if rate_me == 0 and rate_her == 0:
            continue

        CAP = 999
        if rate_her == 0:
            ratio = CAP
        else:
            ratio = min(rate_me / rate_her, CAP)
        if ratio > 1:
            distinct_me.append((w, c_me, round(ratio, 2)))
        elif ratio < 1 and ratio > 0:
            distinct_her.append((w, c_her, round(min(1 / ratio, CAP), 2)))
        elif ratio == 0:
            distinct_her.append((w, c_her, CAP))

    distinct_me.sort(key=lambda x: (-x[2], -x[1]))
    distinct_her.sort(key=lambda x: (-x[2], -x[1]))

    top_words["distinctive_me"] = distinct_me[:15]
    top_words["distinctive_her"] = distinct_her[:15]

    GAP_MINUTES = 30
    initiations = Counter()
    response_times = {"me": [], "her": []}

    prev_msg = None
    for m in messages:
        role = role_of(m)
        if prev_msg is None:
            initiations[role] += 1
        else:
            gap = (m["_dt"] - prev_msg["_dt"]).total_seconds() / 60
            prev_role = role_of(prev_msg)
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
    for m in messages:
        key = m["_dt"].strftime("%Y-%m")
        monthly[key] += 1
    monthly_sorted = sorted(monthly.items())
    peak_month = max(monthly.items(), key=lambda kv: kv[1])

    pulse = {
        "monthly_counts": monthly_sorted,
        "peak_month": peak_month[0],
        "peak_month_count": peak_month[1],
    }

    metrics = {
        "score": score,
        "peak_hour": peak,
        "top_emoji_sticker": top,
        "owl_lark": owl_lark,
        "streak": streak,
        "top_words": top_words,
        "who_misses_more": who_misses_more,
        "pulse": pulse,
    }

    with open(OUTPUT_PATH, "w", encoding="utf-8") as f:
        json.dump(metrics, f, ensure_ascii=False, indent=2)

    print(f"Готово. Метрики сохранены в {OUTPUT_PATH}")
    print(json.dumps(metrics, ensure_ascii=False, indent=2)[:3000])


if __name__ == "__main__":
    main()
