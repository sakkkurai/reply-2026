// общие
export const UNCOMPLETED_HINT = `Прежде чем перейти на следующую страницу, закончи эту.`;

// интро
export const REPLY = `Reply // 2026`;
export const GREETING = `Привет!
Позволь тебе сразу рассказать, что такое Reply и зачем я его скинул тебе. 😋
Reply — это наши итоги года (а-ля Spotify Wrapped, YouTube Recap, и всё в этом духе). Ты узнаешь о некоторых интересных вещах из наших отношений. Надеюсь, ты поняла.
Ну что, интересно? 😎`;
export const LETS_GO = `Вперёд!`;
export const COVERAGE_DATES = (from, to) => `Данные в этом Reply учитываются, начиная с ${from} до ${to}.`

// 1-й слайд - всего сообщений
export const TOTAL_TITLE = `Так, а сколько мы вообще общались?`;
export const TOTAL_BOTTOMTEXT = `Неплохая цифра. Было бы круто, если бы такую тебе скинули на карту, правда?`;
export const TOTAL_ME = `сообщений написал Миша`;
export const TOTAL_SHE = `сообщений написала Ксюша`;
export const TOTAL_ETC = ({ photos, videos, voices, roundVideo }) =>
    `(из них ${photos} фоток, ${videos} видео, ${voices} голосовых и ${roundVideo} кружка.)`;
export const TOTAL_MERGE = `Слить воедино!`;
export const TOTAL_MSGS = (count) => `${count} сообщений всего за 2026-й год!`;
export const TOTAL_DESCIRPTION = `Неплохая цифра. Было бы круто, если бы такую тебе скинули на карту, правда?`;
export const TOTAL_BUTTON_NEXT = `Вперёд!`;

// 2-й слайд - пиковые часы общения
export const HOURPEEK_QUESTION = `Как ты думаешь: мы чаще общаемся до заката или после? ⛅`
export const HOURPEEK_BUTTON_BEFORE = `Наверное, до...`;
export const HOURPEEK_BUTTON_AFTER = `Уверена, после!`;
export const HOURPEEK_RIGHT_TITLE = `Умничка!🎊`;
export const HOURPEEK_WRONG_TITLE = `А вот и нет ☹️`;
export const HOURPEEK_DESCRIPTION = (peak_time) => `Основная часть нашего общения приходилась на ~${peak_time}:00.`;
export const HOURPEEK_BUTTON_NEXT = `Давай дальше!`;

// 3-й слайд - серия общения
export const STREAK_TITLE = `Серия общения`;
export const STREAK_CAPTION = (time, pause_start, pause_end, who_breaked_pause) => `Самое большое время, что мы не общались: ${time} часов.
Это было с ${pause_start} до ${pause_end}. Эта пауза была прервана ${who_breaked_pause === 'me' ? 'мной' : 'тобой'}.`;
export const STREAK_BUTTON_NEXT = `К следующему слайду`;
export const STREAK_DAYS_LONGEST = `дней подряд`;

// 4-й слайд - топ слов
export const TOPWORDS_TITLE = `Топ слов`;
export const TOPWORDS_DESCRIPTION = `Так, позволь мне сразу объяснить, что тут стоит делать.
Перед тобой появятся две колонки и слова, которые мы использовали в общении чаще всего. Твоя задача - угадать чьё это слово и передвинуть в соответствующую колонку. 👅`;
export const TOPWORDS_BUTTON_INTRO_NEXT = `Приступим?`;
export const TOPWORDS_ME_LABEL = `Миша`;
export const TOPWORDS_HER_LABEL = `Ксюша`;
export const TOPWORDS_CORRECT = `Умничка!`;
export const TOPWORDS_WRONG = `Неправильно :(`;
export const TOPWORDS_FINAL_RESULT = (score, length) => `${score}/${length} слов угадано правильно!`
export const TOPWORDS_FINAL = `О, а это ты, кстати! ❤️`;
export const TOPWORDS_NEXT = `Дальше? Сюда.`

// 5-й слайд - кто скучает больше?
export const WHOMISSMORE_TITLE = `Кто скучает больше?`;
export const MISS_BUTTON_START = "Узнать";
export const WHOMISSMORE_RESULT = (who, ending) => `${who} чаще пишет ${ending}!`;
export const WHOMISSMORE_CAPTION = (meTime, herTime) =>
    `К слову, в среднем Миша отвечает за ${meTime}, а Ксюша — за ${herTime}.`;
export const WHOMISSMORE_NEXT = "Некст";
export const WHOMISSMORE_BUTTON_START = `Узнать!`

// 6-й слайд - пульс отношений
export const PULSE_TITLE = `Пульс Отношений`;
export const PULSE_DESCRIPTION = `Здесь ты можешь навести на квадратик и увидеть, сколько мы общались в тот или иной день!`;
export const PULSE_DAY = (day, messages) => `${day} мы отправили друг другу ${messages} сообщений!`
export const PULSE_NEXT = `Что же дальше?`;
export const PULSE_LESS = `Меньше`;
export const PULSE_GREATER = `Больше`;

// 7-й слайд - ии овервью
export const OVERVIEW_TITLE = `ИИ-Обзор`;

// 8-й слайд - личное
export const PERSONAL_TITLE = `И напоследок...`;
