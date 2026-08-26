// общие
export const UNCOMPLETED_HINT = `Прежде чем перейти на следующую страницу, закончи эту.`

// интро
export const REPLY = `Reply // 2026`;
export const GREETING = `Привет!
Позволь тебе сразу рассказать, что такое Reply и зачем я его скинул тебе. 😋
Reply — это наши итоги года (а-ля Spotify Wrapped, YouTube Recap, и всё в этом духе). Ты узнаешь о некоторых интересных вещах из наших отношений. Надеюсь, ты поняла.
Ну что, интересно? 😎`;
export const LETS_GO = `Вперёд!`;

// 2-й слайд - всего сообщений
export const TOTAL_TITLE = `Так, а сколько мы вообще общались?`;
export const TOTAL_BOTTOMTEXT = `Неплохая цифра. Было бы круто, если бы такую тебе скинули на карту, правда?`;
export const TOTAL_ME = `сообщений написал Миша`;
export const TOTAL_SHE = `сообщений написала Ксюша`;
export const TOTAL_ETC = ({ photos, videos, voices, roundVideo }) =>
    `(из них ${photos} фоток, ${videos} видео, ${voices} голосовых и ${roundVideo} кружка.)`;
export const TOTAL_MERGE = `Слить воедино!`;
export const TOTAL_MSGS = (count) => `${count} сообщений всего за 2026-й год!`
