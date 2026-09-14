(function (root) {
  'use strict';

  const reserved = new Set(('await break case catch class const continue debugger default delete do else enum export extends false finally for function if implements import in instanceof interface let new null package private protected public return static super switch this throw true try typeof var void while with yield arguments eval').split(' '));
  const validName = name => typeof name === 'string' && name.length <= 64 && /^[a-zA-Z_$][\w$]*$/.test(name) && !reserved.has(name);
  const upperFirst = value => value[0].toUpperCase() + value.slice(1);

  // A small, explicit bilingual dictionary, not a general-purpose translator.
  const subjects = [
    [/плейлист|playlist/i, 'playlist', 'playlists', 'плейлист', 'плейлисты'],
    [/трек|песн|музык|track|song|music/i, 'track', 'tracks', 'трек', 'треки'],
    [/расход|трат|expense/i, 'expense', 'expenses', 'расход', 'расходы'],
    [/операци|транзакци|transaction/i, 'transaction', 'transactions', 'операция', 'операции'],
    [/пользоват|user/i, 'user', 'users', 'пользователь', 'пользователи'],
    [/задач|task/i, 'task', 'tasks', 'задача', 'задачи'],
    [/ответ|answer/i, 'answer', 'answers', 'ответ', 'ответы'],
    [/вопрос|question/i, 'question', 'questions', 'вопрос', 'вопросы'],
    [/товар|product/i, 'product', 'products', 'товар', 'товары'],
    [/сообщен|message/i, 'message', 'messages', 'сообщение', 'сообщения'],
    [/замет|note/i, 'note', 'notes', 'заметка', 'заметки'],
    [/врем|секунд|time|second/i, 'time', 'times', 'время', 'значения времени'],
    [/тем[ауые]|theme/i, 'theme', 'themes', 'тема', 'темы'],
    [/настрой|settings/i, 'settings', 'settings', 'настройки', 'настройки']
  ];
  const actions = [
    [/формат|format/i, 'format', 'форматирует'],
    [/отображ|отрис|вывод|показ|render|display|show/i, 'render', 'отображает'],
    [/сохран|save|persist/i, 'save', 'сохраняет'],
    [/удал|delete|remove/i, 'remove', 'удаляет'],
    [/добав|add|append/i, 'add', 'добавляет'],
    [/загруз|load|fetch/i, 'load', 'загружает'],
    [/переключ|toggle|switch/i, 'toggle', 'переключает'],
    [/провер|валид|validate|check/i, 'validate', 'проверяет'],
    [/счита|считат|сумм|подсч|calculate|sum|total/i, 'calculate', 'вычисляет'],
    [/фильтр|filter/i, 'filter', 'фильтрует'],
    [/сортир|sort/i, 'sort', 'сортирует'],
    [/обнов|update/i, 'update', 'обновляет']
  ];

  function suggestLocal(description, kind, english = false) {
    const text = String(description).trim();
    const L = (en, ru) => english ? en : ru;
    const subject = subjects.find(([pattern]) => pattern.test(text));
    const result = (name, explanation) => [{ name, explanation }];
    if (kind === 'boolean') {
      if (/загру|loading/i.test(text)) return result('isLoading', L('is introduces a true/false state; Loading means loading is in progress.', 'is обозначает состояние true/false; Loading говорит, что загрузка ещё идёт.'));
      if (/воспроиз|играет|playing/i.test(text)) return result('isPlaying', L('A true/false state: playback is running.', 'Состояние true/false: воспроизведение сейчас идёт.'));
      if (/пуст|empty/i.test(text)) return result('isEmpty', L('A true/false state: the collection or value is empty.', 'Состояние true/false: коллекция или значение пустое.'));
      if (subject && /выбран|selected/i.test(text)) return result('hasSelected' + upperFirst(subject[1]), L('has asks whether a selected ' + subject[1] + ' exists.', 'has означает «есть ли», Selected — «выбранный», ' + subject[1] + ' — «' + subject[3] + '».'));
      return [];
    }
    if (!subject) return [];
    const [, singular, plural, ruSingular, ruPlural] = subject;
    if (kind === 'array') return result(plural, L(plural + ' names the collection in the plural, rather than one item.', plural + ' — «' + ruPlural + '». Множественное число отличает массив от одного элемента.'));
    if (kind === 'function') {
      const action = actions.find(([pattern]) => pattern.test(text));
      if (!action) return [];
      const many = /спис|массив|все |всех|фильтр|сортир|list|array|all\b|filter|sort/i.test(text);
      const noun = many && singular !== 'playlist' ? plural : singular;
      const name = action[1] === 'calculate' && /сумм|всего|total|sum/i.test(text)
        ? 'calculateTotal' + upperFirst(plural) : action[1] + upperFirst(noun);
      return result(name, L(action[1] + ' describes the action, and ' + noun + ' names what it acts on.', action[1] + ' — «' + action[2] + '», ' + noun + ' — «' + (noun === plural ? ruPlural : ruSingular) + '». В имени видно и действие, и его предмет.'));
    }
    let words = [singular];
    let reason = L(singular + ' names one value.', singular + ' — «' + ruSingular + '», одно значение.');
    if (/индекс|номер|index|position/i.test(text)) {
      words = [/текущ|current/i.test(text) ? 'current' : 'selected', singular, 'index'];
      reason = L('Index means an array position, not the item itself. Array indexes start at zero.', 'Index — позиция в массиве, а не сам элемент. Индексы начинаются с нуля.');
      if (!/текущ|current|выбран|selected/i.test(text)) words.shift();
    } else if (/количеств|число|count|number of/i.test(text)) {
      words = [singular, 'count'];
      reason = L('Count means the number of items, not an array index.', 'Count — количество элементов, а не индекс в массиве.');
    } else if (/сумм|общ[а-я]*|всего|total|sum/i.test(text)) {
      words = ['total', plural];
      reason = L('Total means the sum of all ' + plural + '.', 'Total — общая сумма; ' + plural + ' — «' + ruPlural + '».');
    } else if (/текущ|current/i.test(text)) words = ['current', singular];
    else if (/выбран|selected/i.test(text)) words = ['selected', singular];
    const name = kind === 'constant' ? words.join('_').toUpperCase() : words[0] + words.slice(1).map(upperFirst).join('');
    return result(name, reason + (kind === 'constant' ? L(' UPPER_SNAKE_CASE highlights a fixed configuration value; not every const binding needs capitals.', ' UPPER_SNAKE_CASE выделяет фиксированное значение конфигурации; не каждую переменную с const нужно писать заглавными.') : L(' camelCase separates words with capitals.', ' В camelCase следующие слова начинаются с заглавной буквы.')));
  }

  function parseSuggestions(content) {
    if (typeof content !== 'string' || content.length > 20000) throw new Error('invalid-format');
    const raw = content.trim().replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/, '');
    const data = JSON.parse(raw);
    if (!data || !Array.isArray(data.suggestions)) throw new Error('invalid-format');
    const seen = new Set();
    const suggestions = data.suggestions.filter(item => {
      if (!item || !validName(item.name) || seen.has(item.name) || typeof item.explanation !== 'string' || !item.explanation.trim() || item.explanation.length > 1200) return false;
      seen.add(item.name);
      return true;
    }).slice(0, 3).map(({ name, explanation }) => ({ name, explanation: explanation.trim() }));
    if (!suggestions.length) throw new Error('invalid-format');
    return suggestions;
  }

  const engine = Object.freeze({ suggestLocal, parseSuggestions, validName });
  if (typeof module !== 'undefined' && module.exports) module.exports = engine;
  else root.WebDevGymNamingEngine = engine;
})(typeof window !== 'undefined' ? window : globalThis);
