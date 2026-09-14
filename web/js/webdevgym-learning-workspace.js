(() => {
  'use strict';

  const LEARNING_IDS = new Set([
    'html', 'css', 'js', 'ts', 'react', 'electron', 'vite',
    'node', 'sql', 'pg', 'linux', 'devops', 'git', 'python', 'csharp'
  ]);
  const INDEX_KEY = 'wdgl_lesson_index_v1';
  const NOTE_KEY = 'wdgl_lesson_notes_v1';
  const BREAKDOWN_KEY = 'wdgl_lesson_breakdown_v1';
  const isEnglish = document.documentElement.lang === 'en';
  const copy = isEnglish ? {
    learning: 'Learning', foundations: 'Foundations', important: 'Important', minutes: 'min',
    lesson: 'Lesson', of: 'of', practice: 'Lesson practice',
    task: 'Work through the lesson and complete its checks.', criteria: 'Completion criteria',
    noCriteria: 'Finish the material and explain the idea in your own words.',
    openPlayground: 'Open in Playground', hint: 'Hint', materials: 'Materials', notes: 'My notes',
    notePlaceholder: 'Write a note...', saved: 'Saved locally', previous: 'Back', next: 'Next lesson',
    sectionProgress: 'section progress', collapse: 'Collapse practice', expand: 'Show practice',
    copyCode: 'Code from this lesson', noCode: 'This lesson does not require a code editor.',
    breakdown: 'Break it down on the page', pageStructure: 'Page structure',
    breakdownQuestion: 'Which tag is suitable for an independent article?', checkAnswer: 'Check',
    chooseAnswer: 'Choose an answer first.', correctAnswer: 'Correct: article is an independent, reusable piece of content.',
    wrongAnswer: 'Not quite. Think about which element keeps its meaning outside this page.'
  } : {
    learning: 'Обучение', foundations: 'Основы', important: 'Важно', minutes: 'мин',
    lesson: 'Урок', of: 'из', practice: 'Практика урока',
    task: 'Разбери материал и выполни критерии готовности.', criteria: 'Критерии готовности',
    noCriteria: 'Изучи материал и объясни идею своими словами.',
    openPlayground: 'Открыть в Playground', hint: 'Подсказка', materials: 'Материалы', notes: 'Мои заметки',
    notePlaceholder: 'Запиши мысль...', saved: 'Сохранено локально', previous: 'Назад', next: 'Следующий урок',
    sectionProgress: 'прогресс раздела', collapse: 'Скрыть практику', expand: 'Показать практику',
    copyCode: 'Код из этого урока', noCode: 'Для этого урока редактор кода не требуется.',
    breakdown: 'Разберём на странице', pageStructure: 'Структура страницы',
    breakdownQuestion: 'Какой тег подходит для самостоятельной статьи?', checkAnswer: 'Проверить',
    chooseAnswer: 'Сначала выбери ответ.', correctAnswer: 'Верно: article — самостоятельный материал, который сохраняет смысл отдельно от страницы.',
    wrongAnswer: 'Пока нет. Подумай, какой элемент сохраняет смысл вне этой страницы.'
  };

  const state = {
    indexBySection: readJson(INDEX_KEY, {}),
    notes: readJson(NOTE_KEY, {})
  };

  function icon(name, size = 18) {
    return `<iconify-icon icon="${name}" width="${size}" height="${size}" aria-hidden="true"></iconify-icon>`;
  }

  function escapeHtml(value) {
    return String(value ?? '')
      .replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;')
      .replaceAll('"', '&quot;').replaceAll("'", '&#39;');
  }

  function readJson(key, fallback) {
    try { return JSON.parse(localStorage.getItem(key)) || fallback; }
    catch { return fallback; }
  }

  function writeJson(key, value) {
    try { localStorage.setItem(key, JSON.stringify(value)); }
    catch {}
  }

  function sectionId(section) {
    return section?.id?.replace(/^sec-/, '') || '';
  }

  function learningBlocks(section) {
    return Array.from(section?.querySelectorAll(':scope > .block') || []);
  }

  function cleanTitle(block, index = 0) {
    const title = block?.querySelector('.block-title, h2, h3');
    if (!title) return `${copy.lesson} ${index + 1}`;
    const clone = title.cloneNode(true);
    clone.querySelectorAll('button, .wdgf-deep-actions, iconify-icon, .badge, .anchor-icon, .bm-btn').forEach(node => node.remove());
    return clone.textContent.replace(/\s+/g, ' ').replace(/[??]+$/g, '').trim() || `${copy.lesson} ${index + 1}`;
  }

  function sectionTitle(section) {
    const heroTitle = section.querySelector('.lang-section-hero-title')?.textContent?.trim();
    const labels = {
      html: 'HTML', css: 'CSS', js: 'JavaScript', ts: 'TypeScript', react: 'React', electron: 'Electron', vite: 'Vite',
      node: 'Node.js', sql: 'SQL', pg: 'PostgreSQL', linux: 'Linux',
      devops: isEnglish ? 'Servers' : 'Серверы', git: 'Git & GitHub', python: 'Python', csharp: 'C#'
    };
    return heroTitle || labels[sectionId(section)] || sectionId(section).toUpperCase();
  }

  function sectionChecks(section) {
    const checks = Array.from(section.querySelectorAll('.prog-cb:not([disabled])'));
    const done = checks.filter(check => check.checked).length;
    return { done, total: checks.length, percent: checks.length ? Math.round(done / checks.length * 100) : 0 };
  }

  function blockComplete(block) {
    const checks = Array.from(block.querySelectorAll('.prog-cb:not([disabled])'));
    return checks.length > 0 && checks.every(check => check.checked);
  }

  function estimateMinutes(block) {
    const words = block.textContent.replace(/\s+/g, ' ').trim().split(' ').filter(Boolean).length;
    return Math.max(3, Math.min(18, Math.round(words / 80) + 3));
  }

  function noteId(section, index) {
    return `${sectionId(section)}:${index}`;
  }

  function firstIncompleteIndex(blocks) {
    const index = blocks.findIndex(block => !blockComplete(block));
    return index < 0 ? Math.max(0, blocks.length - 1) : index;
  }

  function currentIndex(section) {
    const blocks = learningBlocks(section);
    const saved = Number(state.indexBySection[sectionId(section)]);
    if (Number.isInteger(saved) && saved >= 0 && saved < blocks.length) return saved;
    return firstIncompleteIndex(blocks);
  }

  function criteriaFrom(block) {
    const labels = Array.from(block.querySelectorAll('label'))
      .map(label => label.textContent.replace(/\s+/g, ' ').trim())
      .filter(text => text && text.length < 180);
    return Array.from(new Set(labels)).slice(0, 3);
  }

  function codeFrom(block) {
    return block.querySelector('pre code, pre, .code')?.textContent?.trim() || '';
  }

  function timelineIndexes(total, current) {
    if (total <= 9) return Array.from({ length: total }, (_, index) => index);
    const start = Math.max(0, Math.min(total - 9, current - 4));
    return Array.from({ length: 9 }, (_, offset) => start + offset);
  }

  function sectionMaterials(section) {
    const materials = {
      python: [
        ['Python Docs', 'https://docs.python.org/3/'],
        ['Python Packaging Guide', 'https://packaging.python.org/']
      ],
      csharp: [
        ['Microsoft Learn C#', 'https://learn.microsoft.com/en-us/dotnet/csharp/'],
        ['ASP.NET Core', 'https://learn.microsoft.com/en-us/aspnet/core/']
      ],
      electron: [
        ['Electron Docs', 'https://www.electronjs.org/docs/latest/'],
        ['Electron Forge', 'https://www.electronforge.io/']
      ]
    };
    return materials[sectionId(section)] || [
      ['MDN Web Docs', 'https://developer.mozilla.org/'],
      ['web.dev Learn', 'https://web.dev/learn/']
    ];
  }

  function renderTimeline(blocks, current) {
    return timelineIndexes(blocks.length, current).map(index => {
      const block = blocks[index];
      const status = index === current ? 'active' : blockComplete(block) ? 'done' : '';
      const marker = status === 'done' ? icon('tabler:check', 14) : index + 1;
      const label = cleanTitle(block, index);
      return `<button class="wdgl-step ${status}" type="button" data-wdgl-index="${index}" title="${escapeHtml(label)}">
        <span>${marker}</span><small>${escapeHtml(label)}</small>
      </button>`;
    }).join('');
  }

  function renderPractice(section, block, index) {
    const criteria = criteriaFrom(block);
    const code = codeFrom(block);
    const noteKey = noteId(section, index);
    const note = state.notes[noteKey] || '';
    const directPlay = block.querySelector('[data-learning-direct-play]:not([disabled])');
    const hintButton = block.querySelector('[data-learning-open]');
    const materials = sectionMaterials(section);
    return `<aside class="wdgl-practice">
      <header class="wdgl-practice-head">
        <div><span>${copy.practice}</span><small>${index + 1} / ${learningBlocks(section).length}</small></div>
        <button type="button" class="wdgl-icon-btn" data-wdgl-collapse title="${copy.collapse}">${icon('tabler:layout-sidebar-right-collapse', 18)}</button>
      </header>
      <section class="wdgl-practice-section">
        <h3>${escapeHtml(cleanTitle(block, index))}</h3>
        <p>${copy.task}</p>
        <div class="wdgl-criteria"><strong>${copy.criteria}</strong>
          ${(criteria.length ? criteria : [copy.noCriteria]).map((item, itemIndex) =>
            `<div><span class="${itemIndex === 0 && blockComplete(block) ? 'done' : ''}">${itemIndex === 0 && blockComplete(block) ? icon('tabler:check', 13) : ''}</span><p>${escapeHtml(item)}</p></div>`
          ).join('')}
        </div>
      </section>
      <section class="wdgl-code-preview">
        <div><strong>${copy.copyCode}</strong><span>${code ? 'CODE' : '?'}</span></div>
        ${code ? `<pre><code>${escapeHtml(code.split('\n').slice(0, 12).join('\n'))}</code></pre>` : `<p>${copy.noCode}</p>`}
        <button type="button" class="wdgl-primary-btn" data-wdgl-play ${directPlay ? '' : 'disabled'}>${icon('tabler:terminal-2', 17)} ${copy.openPlayground}</button>
      </section>
      <button type="button" class="wdgl-drawer-row" data-wdgl-hint ${hintButton ? '' : 'disabled'}>
        <span>${icon('tabler:bulb', 18)} ${copy.hint}</span>${icon('tabler:chevron-right', 16)}
      </button>
      <section class="wdgl-materials">
        <strong>${copy.materials}</strong>
        ${materials.map(material => `<a href="${material[1]}" target="_blank" rel="noopener">${material[0]} ${icon('tabler:external-link', 13)}</a>`).join('')}
      </section>
      <section class="wdgl-notes">
        <label for="wdgl-note-${escapeHtml(noteKey)}">${icon('tabler:pencil', 17)} ${copy.notes}</label>
        <textarea id="wdgl-note-${escapeHtml(noteKey)}" data-wdgl-note placeholder="${copy.notePlaceholder}">${escapeHtml(note)}</textarea>
        <small data-wdgl-note-status>${note ? copy.saved : ''}</small>
      </section>
    </aside>`;
  }

  const BREAKDOWN_TEMPLATES = {
    "semantic": {
      "title": {
        "ru": "Структура страницы",
        "en": "Page structure"
      },
      "layout": "page",
      "points": [
        {
          "term": "header",
          "text": {
            "ru": "шапка сайта: логотип, название и поиск.",
            "en": "site header: logo, name, and search."
          }
        },
        {
          "term": "nav",
          "text": {
            "ru": "основная навигация по разделам.",
            "en": "primary navigation through sections."
          }
        },
        {
          "term": "main",
          "text": {
            "ru": "главное содержимое страницы.",
            "en": "the main content of the page."
          }
        },
        {
          "term": "article",
          "text": {
            "ru": "самостоятельная статья или публикация.",
            "en": "an independent article or post."
          }
        },
        {
          "term": "aside",
          "text": {
            "ru": "дополнительная информация рядом с основным контентом.",
            "en": "supporting information beside the main content."
          }
        },
        {
          "term": "footer",
          "text": {
            "ru": "нижняя часть: авторство, контакты и ссылки.",
            "en": "the closing area: credits, contacts, and links."
          }
        }
      ],
      "quiz": {
        "question": {
          "ru": "Какой тег подходит для самостоятельной статьи?",
          "en": "Which tag is suitable for an independent article?"
        },
        "options": [
          "section",
          "article",
          "div"
        ],
        "correct": "article",
        "ok": {
          "ru": "Верно: article сохраняет смысл отдельно от страницы.",
          "en": "Correct: article keeps its meaning outside the page."
        },
        "bad": {
          "ru": "Подумай, какой элемент можно перенести на другую страницу без потери смысла.",
          "en": "Think about which element can be moved to another page without losing its meaning."
        }
      }
    },
    "form": {
      "title": {
        "ru": "Путь данных формы",
        "en": "Form data flow"
      },
      "layout": "flow",
      "nodes": [
        {
          "label": "label",
          "text": {
            "ru": "объясняет поле",
            "en": "describes the field"
          }
        },
        {
          "label": "input[name]",
          "text": {
            "ru": "хранит значение",
            "en": "holds a value"
          }
        },
        {
          "label": "validation",
          "text": {
            "ru": "проверяет данные",
            "en": "checks the data"
          }
        },
        {
          "label": "submit",
          "text": {
            "ru": "отправляет форму",
            "en": "submits the form"
          }
        }
      ],
      "points": [
        {
          "term": "name",
          "text": {
            "ru": "имя ключа, под которым значение уйдёт на сервер.",
            "en": "the key used to send the value to the server."
          }
        },
        {
          "term": "label",
          "text": {
            "ru": "связывается с полем через for и id.",
            "en": "connects to the field through for and id."
          }
        },
        {
          "term": "required",
          "text": {
            "ru": "останавливает пустую отправку на уровне браузера.",
            "en": "stops an empty submission in the browser."
          }
        }
      ],
      "quiz": {
        "question": {
          "ru": "Что обязательно нужно полю, чтобы значение попало в FormData?",
          "en": "What does a field need for its value to appear in FormData?"
        },
        "options": [
          "class",
          "name",
          "placeholder"
        ],
        "correct": "name",
        "ok": {
          "ru": "Верно: FormData использует атрибут name как ключ.",
          "en": "Correct: FormData uses the name attribute as the key."
        },
        "bad": {
          "ru": "Внешний вид поля не определяет, отправится ли его значение.",
          "en": "A field’s appearance does not decide whether its value is submitted."
        }
      }
    },
    "box": {
      "title": {
        "ru": "Блочная модель",
        "en": "Box model"
      },
      "layout": "stack",
      "nodes": [
        {
          "label": "margin",
          "text": {
            "ru": "внешний отступ",
            "en": "outer space"
          }
        },
        {
          "label": "border",
          "text": {
            "ru": "граница",
            "en": "border"
          }
        },
        {
          "label": "padding",
          "text": {
            "ru": "внутренний отступ",
            "en": "inner space"
          }
        },
        {
          "label": "content",
          "text": {
            "ru": "содержимое",
            "en": "content"
          }
        }
      ],
      "points": [
        {
          "term": "margin",
          "text": {
            "ru": "раздвигает соседние элементы снаружи.",
            "en": "creates space outside the element."
          }
        },
        {
          "term": "padding",
          "text": {
            "ru": "даёт воздух между контентом и границей.",
            "en": "adds space between content and border."
          }
        },
        {
          "term": "box-sizing",
          "text": {
            "ru": "border-box включает padding и border в заданную ширину.",
            "en": "border-box includes padding and border in the declared width."
          }
        }
      ],
      "quiz": {
        "question": {
          "ru": "Что создаёт расстояние между текстом и рамкой элемента?",
          "en": "What creates space between text and the element border?"
        },
        "options": [
          "margin",
          "padding",
          "gap"
        ],
        "correct": "padding",
        "ok": {
          "ru": "Верно: padding работает внутри границы.",
          "en": "Correct: padding works inside the border."
        },
        "bad": {
          "ru": "Смотри на направление: нужен отступ внутри элемента.",
          "en": "Look at the direction: the spacing is needed inside the element."
        }
      }
    },
    "layout": {
      "title": {
        "ru": "Раскладка контейнера",
        "en": "Container layout"
      },
      "layout": "flow",
      "nodes": [
        {
          "label": "container",
          "text": {
            "ru": "родитель",
            "en": "parent"
          }
        },
        {
          "label": "display",
          "text": {
            "ru": "flex или grid",
            "en": "flex or grid"
          }
        },
        {
          "label": "axis / tracks",
          "text": {
            "ru": "ось или линии",
            "en": "axis or tracks"
          }
        },
        {
          "label": "items",
          "text": {
            "ru": "дочерние элементы",
            "en": "child items"
          }
        }
      ],
      "points": [
        {
          "term": "Flexbox",
          "text": {
            "ru": "лучше для одной оси: ряд или колонка.",
            "en": "best for one axis: a row or a column."
          }
        },
        {
          "term": "Grid",
          "text": {
            "ru": "лучше для строк и колонок одновременно.",
            "en": "best for rows and columns together."
          }
        },
        {
          "term": "gap",
          "text": {
            "ru": "задаёт расстояние между элементами без margin-костылей.",
            "en": "sets spacing between items without margin hacks."
          }
        }
      ],
      "quiz": {
        "question": {
          "ru": "Что выбрать для сетки из строк и колонок?",
          "en": "What should you use for a grid with rows and columns?"
        },
        "options": [
          "block",
          "flex",
          "grid"
        ],
        "correct": "grid",
        "ok": {
          "ru": "Верно: Grid управляет двумя измерениями.",
          "en": "Correct: Grid controls two dimensions."
        },
        "bad": {
          "ru": "Нужен инструмент, который одновременно знает о строках и колонках.",
          "en": "You need a tool that understands rows and columns at the same time."
        }
      }
    },
    "cascade": {
      "title": {
        "ru": "Как браузер выбирает стиль",
        "en": "How the browser chooses a style"
      },
      "layout": "flow",
      "nodes": [
        {
          "label": "selector",
          "text": {
            "ru": "находит элемент",
            "en": "matches an element"
          }
        },
        {
          "label": "cascade",
          "text": {
            "ru": "сравнивает правила",
            "en": "compares rules"
          }
        },
        {
          "label": "specificity",
          "text": {
            "ru": "считает вес",
            "en": "calculates weight"
          }
        },
        {
          "label": "computed style",
          "text": {
            "ru": "применяет победителя",
            "en": "applies the winner"
          }
        }
      ],
      "points": [
        {
          "term": "source order",
          "text": {
            "ru": "при равном весе побеждает правило ниже в файле.",
            "en": "when weights match, the later rule wins."
          }
        },
        {
          "term": "specificity",
          "text": {
            "ru": "id сильнее class, class сильнее тега.",
            "en": "an id beats a class, and a class beats a tag."
          }
        },
        {
          "term": "inheritance",
          "text": {
            "ru": "часть свойств приходит от родителя.",
            "en": "some properties come from the parent."
          }
        }
      ],
      "quiz": {
        "question": {
          "ru": "Два одинаковых селектора задают color. Какой победит?",
          "en": "Two identical selectors set color. Which one wins?"
        },
        "options": [
          {
            "ru": "первый",
            "en": "first"
          },
          {
            "ru": "последний",
            "en": "last"
          },
          {
            "ru": "случайный",
            "en": "random"
          }
        ],
        "correct": "last",
        "ok": {
          "ru": "Верно: при одинаковой специфичности побеждает правило ниже.",
          "en": "Correct: with equal specificity, the later rule wins."
        },
        "bad": {
          "ru": "При равном весе решает порядок в источнике.",
          "en": "With equal weight, source order decides."
        }
      }
    },
    "function": {
      "title": {
        "ru": "Как работает функция",
        "en": "How a function works"
      },
      "layout": "flow",
      "nodes": [
        {
          "label": "arguments",
          "text": {
            "ru": "входные значения",
            "en": "input values"
          }
        },
        {
          "label": "parameters",
          "text": {
            "ru": "локальные имена",
            "en": "local names"
          }
        },
        {
          "label": "body",
          "text": {
            "ru": "выполняет шаги",
            "en": "runs the steps"
          }
        },
        {
          "label": "return",
          "text": {
            "ru": "возвращает результат",
            "en": "returns a result"
          }
        }
      ],
      "points": [
        {
          "term": "parameters",
          "text": {
            "ru": "объявляются при создании функции.",
            "en": "are declared when the function is defined."
          }
        },
        {
          "term": "arguments",
          "text": {
            "ru": "передаются во время вызова.",
            "en": "are passed when the function is called."
          }
        },
        {
          "term": "return",
          "text": {
            "ru": "завершает функцию и отдаёт значение наружу.",
            "en": "ends the function and sends a value back."
          }
        }
      ],
      "quiz": {
        "question": {
          "ru": "Что получает код const result = sum(2, 3)?",
          "en": "What does const result = sum(2, 3) receive?"
        },
        "options": [
          "parameters",
          "return",
          "console.log"
        ],
        "correct": "return",
        "ok": {
          "ru": "Верно: в result попадает возвращённое значение.",
          "en": "Correct: result receives the returned value."
        },
        "bad": {
          "ru": "Нужно значение, которое функция отдаёт после выполнения.",
          "en": "You need the value the function sends back after it runs."
        }
      }
    },
    "array": {
      "title": {
        "ru": "Преобразование массива",
        "en": "Array transformation"
      },
      "layout": "flow",
      "nodes": [
        {
          "label": "source[]",
          "text": {
            "ru": "исходные данные",
            "en": "source data"
          }
        },
        {
          "label": "callback",
          "text": {
            "ru": "правило для элемента",
            "en": "rule for each item"
          }
        },
        {
          "label": "map / filter",
          "text": {
            "ru": "преобразует или отбирает",
            "en": "transforms or selects"
          }
        },
        {
          "label": "result[]",
          "text": {
            "ru": "новый массив",
            "en": "new array"
          }
        }
      ],
      "points": [
        {
          "term": "map",
          "text": {
            "ru": "возвращает новый массив той же длины.",
            "en": "returns a new array of the same length."
          }
        },
        {
          "term": "filter",
          "text": {
            "ru": "оставляет только подходящие элементы.",
            "en": "keeps only matching items."
          }
        },
        {
          "term": "reduce",
          "text": {
            "ru": "сводит массив к одному результату.",
            "en": "reduces an array to one result."
          }
        }
      ],
      "quiz": {
        "question": {
          "ru": "Какой метод оставит только числа больше 10?",
          "en": "Which method keeps only numbers greater than 10?"
        },
        "options": [
          "map",
          "filter",
          "push"
        ],
        "correct": "filter",
        "ok": {
          "ru": "Верно: filter проверяет каждый элемент условием.",
          "en": "Correct: filter tests each item with a condition."
        },
        "bad": {
          "ru": "Нужен метод отбора, а не преобразования.",
          "en": "You need a selection method, not a transformation method."
        }
      }
    },
    "condition": {
      "title": {
        "ru": "Ветвление программы",
        "en": "Program branching"
      },
      "layout": "branch",
      "nodes": [
        {
          "label": "condition",
          "text": {
            "ru": "true или false",
            "en": "true or false"
          }
        },
        {
          "label": "if",
          "text": {
            "ru": "ветка true",
            "en": "true branch"
          }
        },
        {
          "label": "else",
          "text": {
            "ru": "ветка false",
            "en": "false branch"
          }
        }
      ],
      "points": [
        {
          "term": "===",
          "text": {
            "ru": "строго сравнивает и значение, и тип.",
            "en": "strictly compares both value and type."
          }
        },
        {
          "term": "&&",
          "text": {
            "ru": "требует, чтобы оба условия были true.",
            "en": "requires both conditions to be true."
          }
        },
        {
          "term": "||",
          "text": {
            "ru": "достаточно хотя бы одного true.",
            "en": "needs at least one condition to be true."
          }
        }
      ],
      "quiz": {
        "question": {
          "ru": "Чему равно 5 === \"5\"?",
          "en": "What is 5 === \"5\"?"
        },
        "options": [
          "true",
          "false",
          "undefined"
        ],
        "correct": "false",
        "ok": {
          "ru": "Верно: типы number и string различаются.",
          "en": "Correct: number and string are different types."
        },
        "bad": {
          "ru": "Строгое сравнение проверяет ещё и тип данных.",
          "en": "Strict equality also checks the data type."
        }
      }
    },
    "dom": {
      "title": {
        "ru": "Связь JavaScript со страницей",
        "en": "Connecting JavaScript to the page"
      },
      "layout": "flow",
      "nodes": [
        {
          "label": "document",
          "text": {
            "ru": "вся страница",
            "en": "the whole page"
          }
        },
        {
          "label": "querySelector",
          "text": {
            "ru": "ищет элемент",
            "en": "finds an element"
          }
        },
        {
          "label": "element",
          "text": {
            "ru": "ссылка на узел",
            "en": "node reference"
          }
        },
        {
          "label": "text / class",
          "text": {
            "ru": "меняет интерфейс",
            "en": "updates the UI"
          }
        }
      ],
      "points": [
        {
          "term": "querySelector",
          "text": {
            "ru": "возвращает первый подходящий элемент или null.",
            "en": "returns the first matching element or null."
          }
        },
        {
          "term": "textContent",
          "text": {
            "ru": "безопасно меняет обычный текст.",
            "en": "safely changes plain text."
          }
        },
        {
          "term": "classList",
          "text": {
            "ru": "добавляет, удаляет и переключает CSS-классы.",
            "en": "adds, removes, and toggles CSS classes."
          }
        }
      ],
      "quiz": {
        "question": {
          "ru": "Что вернёт querySelector, если элемент не найден?",
          "en": "What does querySelector return when no element is found?"
        },
        "options": [
          "false",
          "null",
          "[]"
        ],
        "correct": "null",
        "ok": {
          "ru": "Верно: перед работой с результатом иногда нужна проверка на null.",
          "en": "Correct: you may need a null check before using the result."
        },
        "bad": {
          "ru": "Это не список и не логическое значение.",
          "en": "It is neither a list nor a boolean."
        }
      }
    },
    "event": {
      "title": {
        "ru": "Поток события",
        "en": "Event flow"
      },
      "layout": "flow",
      "nodes": [
        {
          "label": "user action",
          "text": {
            "ru": "клик или ввод",
            "en": "click or input"
          }
        },
        {
          "label": "event",
          "text": {
            "ru": "объект события",
            "en": "event object"
          }
        },
        {
          "label": "listener",
          "text": {
            "ru": "ждёт событие",
            "en": "waits for the event"
          }
        },
        {
          "label": "handler",
          "text": {
            "ru": "меняет данные или UI",
            "en": "updates data or UI"
          }
        }
      ],
      "points": [
        {
          "term": "addEventListener",
          "text": {
            "ru": "связывает событие с функцией-обработчиком.",
            "en": "connects an event to a handler function."
          }
        },
        {
          "term": "event.target",
          "text": {
            "ru": "указывает на элемент, где произошло событие.",
            "en": "points to the element where the event happened."
          }
        },
        {
          "term": "preventDefault",
          "text": {
            "ru": "отменяет стандартное действие браузера.",
            "en": "cancels the browser’s default action."
          }
        }
      ],
      "quiz": {
        "question": {
          "ru": "Где находится введённый текст в обработчике input?",
          "en": "Where is the entered text inside an input handler?"
        },
        "options": [
          "event.value",
          "event.target.value",
          "input.text"
        ],
        "correct": "event.target.value",
        "ok": {
          "ru": "Верно: target — поле, value — его текущее значение.",
          "en": "Correct: target is the field and value is its current value."
        },
        "bad": {
          "ru": "Сначала найди элемент-источник события, затем его значение.",
          "en": "First find the event source element, then read its value."
        }
      }
    },
    "storage": {
      "title": {
        "ru": "Сохранение состояния",
        "en": "State persistence"
      },
      "layout": "flow",
      "nodes": [
        {
          "label": "state",
          "text": {
            "ru": "объект или число",
            "en": "object or number"
          }
        },
        {
          "label": "JSON.stringify",
          "text": {
            "ru": "превращает в строку",
            "en": "turns it into a string"
          }
        },
        {
          "label": "localStorage",
          "text": {
            "ru": "хранит строку",
            "en": "stores the string"
          }
        },
        {
          "label": "JSON.parse",
          "text": {
            "ru": "восстанавливает данные",
            "en": "restores the data"
          }
        }
      ],
      "points": [
        {
          "term": "getItem",
          "text": {
            "ru": "возвращает строку или null.",
            "en": "returns a string or null."
          }
        },
        {
          "term": "setItem",
          "text": {
            "ru": "сохраняет значение по ключу.",
            "en": "stores a value under a key."
          }
        },
        {
          "term": "JSON",
          "text": {
            "ru": "нужен для объектов и массивов.",
            "en": "is needed for objects and arrays."
          }
        }
      ],
      "quiz": {
        "question": {
          "ru": "Что вернёт getItem для отсутствующего ключа?",
          "en": "What does getItem return for a missing key?"
        },
        "options": [
          "0",
          "null",
          "{}"
        ],
        "correct": "null",
        "ok": {
          "ru": "Верно: поэтому при чтении нужен запасной вариант.",
          "en": "Correct: that is why reading often needs a fallback."
        },
        "bad": {
          "ru": "Хранилище не создаёт значение автоматически.",
          "en": "Storage does not create a value automatically."
        }
      }
    },
    "async": {
      "title": {
        "ru": "Жизненный цикл запроса",
        "en": "Request lifecycle"
      },
      "layout": "flow",
      "nodes": [
        {
          "label": "request",
          "text": {
            "ru": "запускаем операцию",
            "en": "start the operation"
          }
        },
        {
          "label": "pending",
          "text": {
            "ru": "ожидаем",
            "en": "waiting"
          }
        },
        {
          "label": "fulfilled",
          "text": {
            "ru": "получили данные",
            "en": "received data"
          }
        },
        {
          "label": "rejected",
          "text": {
            "ru": "получили ошибку",
            "en": "received an error"
          }
        }
      ],
      "points": [
        {
          "term": "await",
          "text": {
            "ru": "приостанавливает текущую async-функцию, но не весь браузер.",
            "en": "pauses the current async function, not the whole browser."
          }
        },
        {
          "term": "try/catch",
          "text": {
            "ru": "разделяет успешный путь и обработку ошибки.",
            "en": "separates the success path from error handling."
          }
        },
        {
          "term": "response.ok",
          "text": {
            "ru": "нужно проверить вручную после fetch.",
            "en": "must be checked manually after fetch."
          }
        }
      ],
      "quiz": {
        "question": {
          "ru": "Что нужно проверить после fetch перед разбором JSON?",
          "en": "What should be checked after fetch before parsing JSON?"
        },
        "options": [
          "response.ok",
          "response.length",
          "window.ready"
        ],
        "correct": "response.ok",
        "ok": {
          "ru": "Верно: fetch не считает HTTP 404 автоматическим reject.",
          "en": "Correct: fetch does not automatically reject on HTTP 404."
        },
        "bad": {
          "ru": "Нужен признак успешного HTTP-ответа.",
          "en": "You need the HTTP response success flag."
        }
      }
    },
    "types": {
      "title": {
        "ru": "Проверка формы данных",
        "en": "Data shape checking"
      },
      "layout": "flow",
      "nodes": [
        {
          "label": "unknown data",
          "text": {
            "ru": "данные снаружи",
            "en": "external data"
          }
        },
        {
          "label": "type / interface",
          "text": {
            "ru": "ожидаемая форма",
            "en": "expected shape"
          }
        },
        {
          "label": "narrowing",
          "text": {
            "ru": "проверка признака",
            "en": "check a discriminator"
          }
        },
        {
          "label": "safe value",
          "text": {
            "ru": "тип уточнён",
            "en": "type is narrowed"
          }
        }
      ],
      "points": [
        {
          "term": "type",
          "text": {
            "ru": "описывает допустимую форму значения.",
            "en": "describes an allowed value shape."
          }
        },
        {
          "term": "unknown",
          "text": {
            "ru": "заставляет проверить данные перед использованием.",
            "en": "forces validation before use."
          }
        },
        {
          "term": "narrowing",
          "text": {
            "ru": "сужает широкий тип после проверки.",
            "en": "narrows a broad type after a check."
          }
        }
      ],
      "quiz": {
        "question": {
          "ru": "Какой тип безопаснее для данных неизвестного происхождения?",
          "en": "Which type is safer for data from an unknown source?"
        },
        "options": [
          "any",
          "unknown",
          "never"
        ],
        "correct": "unknown",
        "ok": {
          "ru": "Верно: unknown требует доказать тип перед использованием.",
          "en": "Correct: unknown requires proving the type before use."
        },
        "bad": {
          "ru": "Нужен тип, который не отключает проверки компилятора.",
          "en": "You need a type that does not disable compiler checks."
        }
      }
    },
    "generic": {
      "title": {
        "ru": "Тип проходит через функцию",
        "en": "A type flows through a function"
      },
      "layout": "flow",
      "nodes": [
        {
          "label": "T input",
          "text": {
            "ru": "тип аргумента",
            "en": "argument type"
          }
        },
        {
          "label": "generic<T>",
          "text": {
            "ru": "сохраняет связь",
            "en": "preserves the relation"
          }
        },
        {
          "label": "T output",
          "text": {
            "ru": "тот же тип результата",
            "en": "same result type"
          }
        }
      ],
      "points": [
        {
          "term": "T",
          "text": {
            "ru": "параметр типа, а не обычная переменная.",
            "en": "is a type parameter, not a runtime variable."
          }
        },
        {
          "term": "inference",
          "text": {
            "ru": "часто TypeScript сам выводит T из аргумента.",
            "en": "TypeScript often infers T from the argument."
          }
        },
        {
          "term": "constraint",
          "text": {
            "ru": "extends ограничивает допустимые типы.",
            "en": "extends restricts allowed types."
          }
        }
      ],
      "quiz": {
        "question": {
          "ru": "Что сохраняет generic-функция identity<T>(value: T): T?",
          "en": "What does identity<T>(value: T): T preserve?"
        },
        "options": [
          {
            "ru": "цвет",
            "en": "color"
          },
          {
            "ru": "тип значения",
            "en": "value type"
          },
          {
            "ru": "имя функции",
            "en": "function name"
          }
        ],
        "correct": "value type",
        "ok": {
          "ru": "Верно: входной и выходной типы связаны через T.",
          "en": "Correct: input and output types are linked through T."
        },
        "bad": {
          "ru": "Посмотри, что повторяется у параметра и результата.",
          "en": "Look at what repeats for the parameter and return value."
        }
      }
    },
    "react": {
      "title": {
        "ru": "Поток данных компонента",
        "en": "Component data flow"
      },
      "layout": "flow",
      "nodes": [
        {
          "label": "props",
          "text": {
            "ru": "данные от родителя",
            "en": "data from parent"
          }
        },
        {
          "label": "component",
          "text": {
            "ru": "вычисляет JSX",
            "en": "computes JSX"
          }
        },
        {
          "label": "render",
          "text": {
            "ru": "показывает UI",
            "en": "shows the UI"
          }
        },
        {
          "label": "event",
          "text": {
            "ru": "запускает обновление",
            "en": "triggers an update"
          }
        }
      ],
      "points": [
        {
          "term": "props",
          "text": {
            "ru": "читаются компонентом и приходят сверху.",
            "en": "are read by the component and come from above."
          }
        },
        {
          "term": "state",
          "text": {
            "ru": "хранит изменяемые данные компонента.",
            "en": "stores mutable component data."
          }
        },
        {
          "term": "render",
          "text": {
            "ru": "повторяется, когда props или state изменились.",
            "en": "runs again when props or state changes."
          }
        }
      ],
      "quiz": {
        "question": {
          "ru": "Что обычно вызывает повторный рендер компонента?",
          "en": "What usually causes a component to render again?"
        },
        "options": [
          {
            "ru": "изменение state",
            "en": "state change"
          },
          {
            "ru": "обычная переменная",
            "en": "plain variable"
          },
          {
            "ru": "комментарий",
            "en": "comment"
          }
        ],
        "correct": "state change",
        "ok": {
          "ru": "Верно: setter состояния сообщает React об обновлении.",
          "en": "Correct: a state setter tells React about the update."
        },
        "bad": {
          "ru": "React должен получить сигнал, что данные интерфейса изменились.",
          "en": "React needs a signal that UI data has changed."
        }
      }
    },
    "effect": {
      "title": {
        "ru": "Жизненный цикл эффекта",
        "en": "Effect lifecycle"
      },
      "layout": "cycle",
      "nodes": [
        {
          "label": "render",
          "text": {
            "ru": "компонент отрисован",
            "en": "component rendered"
          }
        },
        {
          "label": "effect",
          "text": {
            "ru": "запускается работа",
            "en": "work starts"
          }
        },
        {
          "label": "cleanup",
          "text": {
            "ru": "убирает подписку",
            "en": "removes subscription"
          }
        },
        {
          "label": "rerender",
          "text": {
            "ru": "цикл повторяется",
            "en": "cycle repeats"
          }
        }
      ],
      "points": [
        {
          "term": "dependencies",
          "text": {
            "ru": "определяют, когда эффект запускается снова.",
            "en": "decide when the effect runs again."
          }
        },
        {
          "term": "cleanup",
          "text": {
            "ru": "останавливает таймеры и удаляет слушатели.",
            "en": "stops timers and removes listeners."
          }
        },
        {
          "term": "useEffect",
          "text": {
            "ru": "нужен для синхронизации с внешним миром.",
            "en": "is for synchronizing with the outside world."
          }
        }
      ],
      "quiz": {
        "question": {
          "ru": "Где удалить addEventListener, созданный в useEffect?",
          "en": "Where should an event listener created in useEffect be removed?"
        },
        "options": [
          "render",
          "cleanup",
          "props"
        ],
        "correct": "cleanup",
        "ok": {
          "ru": "Верно: cleanup предотвращает дублирование и утечки.",
          "en": "Correct: cleanup prevents duplicates and leaks."
        },
        "bad": {
          "ru": "Нужен шаг, который выполняется перед новым эффектом или размонтированием.",
          "en": "You need the step that runs before a new effect or unmount."
        }
      }
    },
    "build": {
      "title": {
        "ru": "Путь исходного кода",
        "en": "Source-to-build pipeline"
      },
      "layout": "flow",
      "nodes": [
        {
          "label": "src",
          "text": {
            "ru": "исходные модули",
            "en": "source modules"
          }
        },
        {
          "label": "dev server",
          "text": {
            "ru": "быстрая разработка",
            "en": "fast development"
          }
        },
        {
          "label": "build",
          "text": {
            "ru": "оптимизация",
            "en": "optimization"
          }
        },
        {
          "label": "dist",
          "text": {
            "ru": "готовые файлы",
            "en": "production files"
          }
        }
      ],
      "points": [
        {
          "term": "dev server",
          "text": {
            "ru": "отдаёт модули во время разработки.",
            "en": "serves modules during development."
          }
        },
        {
          "term": "build",
          "text": {
            "ru": "собирает и оптимизирует проект.",
            "en": "bundles and optimizes the project."
          }
        },
        {
          "term": "dist",
          "text": {
            "ru": "папка результата для публикации.",
            "en": "is the output folder for deployment."
          }
        }
      ],
      "quiz": {
        "question": {
          "ru": "Какую папку обычно публикуют после vite build?",
          "en": "Which folder is usually deployed after vite build?"
        },
        "options": [
          "src",
          "dist",
          "node_modules"
        ],
        "correct": "dist",
        "ok": {
          "ru": "Верно: dist содержит производственную сборку.",
          "en": "Correct: dist contains the production build."
        },
        "bad": {
          "ru": "Нужен результат сборки, а не исходники или зависимости.",
          "en": "You need the build output, not source files or dependencies."
        }
      }
    },
    "backend": {
      "title": {
        "ru": "Путь HTTP-запроса",
        "en": "HTTP request path"
      },
      "layout": "flow",
      "nodes": [
        {
          "label": "client",
          "text": {
            "ru": "отправляет запрос",
            "en": "sends a request"
          }
        },
        {
          "label": "router",
          "text": {
            "ru": "выбирает маршрут",
            "en": "selects a route"
          }
        },
        {
          "label": "handler",
          "text": {
            "ru": "выполняет логику",
            "en": "runs logic"
          }
        },
        {
          "label": "response",
          "text": {
            "ru": "возвращает статус и данные",
            "en": "returns status and data"
          }
        }
      ],
      "points": [
        {
          "term": "route",
          "text": {
            "ru": "сочетает HTTP-метод и путь.",
            "en": "combines an HTTP method and a path."
          }
        },
        {
          "term": "handler",
          "text": {
            "ru": "проверяет вход, вызывает логику и формирует ответ.",
            "en": "validates input, runs logic, and creates the response."
          }
        },
        {
          "term": "status",
          "text": {
            "ru": "сообщает клиенту результат операции.",
            "en": "tells the client the operation result."
          }
        }
      ],
      "quiz": {
        "question": {
          "ru": "Что первым выбирает обработчик для GET /users?",
          "en": "What first selects the handler for GET /users?"
        },
        "options": [
          "router",
          "database",
          "CSS"
        ],
        "correct": "router",
        "ok": {
          "ru": "Верно: router сопоставляет метод и путь.",
          "en": "Correct: the router matches the method and path."
        },
        "bad": {
          "ru": "Сначала запрос нужно направить к нужной функции.",
          "en": "The request must first be directed to the right function."
        }
      }
    },
    "auth": {
      "title": {
        "ru": "Проверка доступа",
        "en": "Access verification"
      },
      "layout": "flow",
      "nodes": [
        {
          "label": "credentials",
          "text": {
            "ru": "логин или токен",
            "en": "login or token"
          }
        },
        {
          "label": "validation",
          "text": {
            "ru": "проверка подлинности",
            "en": "authentication check"
          }
        },
        {
          "label": "session / JWT",
          "text": {
            "ru": "состояние входа",
            "en": "login state"
          }
        },
        {
          "label": "protected route",
          "text": {
            "ru": "разрешить или отказать",
            "en": "allow or deny"
          }
        }
      ],
      "points": [
        {
          "term": "authentication",
          "text": {
            "ru": "отвечает на вопрос: кто пользователь.",
            "en": "answers: who is the user?"
          }
        },
        {
          "term": "authorization",
          "text": {
            "ru": "отвечает: что ему разрешено.",
            "en": "answers: what may the user do?"
          }
        },
        {
          "term": "httpOnly",
          "text": {
            "ru": "не даёт JavaScript читать cookie.",
            "en": "prevents JavaScript from reading the cookie."
          }
        }
      ],
      "quiz": {
        "question": {
          "ru": "Что проверяет право пользователя открыть админку?",
          "en": "What checks whether a user may open the admin area?"
        },
        "options": [
          "authentication",
          "authorization",
          "serialization"
        ],
        "correct": "authorization",
        "ok": {
          "ru": "Верно: личность уже известна, теперь проверяются права.",
          "en": "Correct: identity is known, now permissions are checked."
        },
        "bad": {
          "ru": "Раздели два вопроса: кто это и что ему можно.",
          "en": "Separate the two questions: who is it and what may they do?"
        }
      }
    },
    "sql": {
      "title": {
        "ru": "Как строится SQL-результат",
        "en": "How an SQL result is built"
      },
      "layout": "flow",
      "nodes": [
        {
          "label": "FROM",
          "text": {
            "ru": "источник строк",
            "en": "row source"
          }
        },
        {
          "label": "WHERE",
          "text": {
            "ru": "фильтр",
            "en": "filter"
          }
        },
        {
          "label": "SELECT",
          "text": {
            "ru": "нужные столбцы",
            "en": "chosen columns"
          }
        },
        {
          "label": "result",
          "text": {
            "ru": "таблица результата",
            "en": "result table"
          }
        }
      ],
      "points": [
        {
          "term": "FROM",
          "text": {
            "ru": "указывает таблицу-источник.",
            "en": "selects the source table."
          }
        },
        {
          "term": "WHERE",
          "text": {
            "ru": "отбрасывает неподходящие строки.",
            "en": "removes non-matching rows."
          }
        },
        {
          "term": "SELECT",
          "text": {
            "ru": "определяет столбцы результата.",
            "en": "defines result columns."
          }
        }
      ],
      "quiz": {
        "question": {
          "ru": "Какая часть запроса фильтрует строки?",
          "en": "Which query clause filters rows?"
        },
        "options": [
          "SELECT",
          "WHERE",
          "ORDER BY"
        ],
        "correct": "WHERE",
        "ok": {
          "ru": "Верно: WHERE оставляет строки по условию.",
          "en": "Correct: WHERE keeps rows matching a condition."
        },
        "bad": {
          "ru": "Нужна часть запроса с логическим условием.",
          "en": "You need the query clause that contains a condition."
        }
      }
    },
    "relations": {
      "title": {
        "ru": "Связь таблиц",
        "en": "Table relationship"
      },
      "layout": "flow",
      "nodes": [
        {
          "label": "users.id",
          "text": {
            "ru": "primary key",
            "en": "primary key"
          }
        },
        {
          "label": "orders.user_id",
          "text": {
            "ru": "foreign key",
            "en": "foreign key"
          }
        },
        {
          "label": "JOIN",
          "text": {
            "ru": "сопоставляет строки",
            "en": "matches rows"
          }
        },
        {
          "label": "combined result",
          "text": {
            "ru": "объединённые данные",
            "en": "combined data"
          }
        }
      ],
      "points": [
        {
          "term": "primary key",
          "text": {
            "ru": "уникально определяет строку.",
            "en": "uniquely identifies a row."
          }
        },
        {
          "term": "foreign key",
          "text": {
            "ru": "ссылается на ключ другой таблицы.",
            "en": "references a key in another table."
          }
        },
        {
          "term": "JOIN ... ON",
          "text": {
            "ru": "описывает условие связи.",
            "en": "describes the relationship condition."
          }
        }
      ],
      "quiz": {
        "question": {
          "ru": "Какой ключ хранится в orders.user_id?",
          "en": "Which key is stored in orders.user_id?"
        },
        "options": [
          {
            "ru": "первичный",
            "en": "primary"
          },
          {
            "ru": "внешний",
            "en": "foreign"
          },
          {
            "ru": "случайный",
            "en": "random"
          }
        ],
        "correct": "foreign",
        "ok": {
          "ru": "Верно: он ссылается на users.id.",
          "en": "Correct: it references users.id."
        },
        "bad": {
          "ru": "Этот ключ указывает на строку другой таблицы.",
          "en": "This key points to a row in another table."
        }
      }
    },
    "transaction": {
      "title": {
        "ru": "Атомарная операция",
        "en": "Atomic operation"
      },
      "layout": "flow",
      "nodes": [
        {
          "label": "BEGIN",
          "text": {
            "ru": "начать транзакцию",
            "en": "start transaction"
          }
        },
        {
          "label": "queries",
          "text": {
            "ru": "выполнить изменения",
            "en": "run changes"
          }
        },
        {
          "label": "COMMIT",
          "text": {
            "ru": "сохранить всё",
            "en": "save everything"
          }
        },
        {
          "label": "ROLLBACK",
          "text": {
            "ru": "отменить при ошибке",
            "en": "undo on error"
          }
        }
      ],
      "points": [
        {
          "term": "atomicity",
          "text": {
            "ru": "либо выполняются все шаги, либо ни один.",
            "en": "all steps happen or none do."
          }
        },
        {
          "term": "COMMIT",
          "text": {
            "ru": "делает изменения постоянными.",
            "en": "makes changes permanent."
          }
        },
        {
          "term": "ROLLBACK",
          "text": {
            "ru": "возвращает состояние до транзакции.",
            "en": "restores the state before the transaction."
          }
        }
      ],
      "quiz": {
        "question": {
          "ru": "Что выполнить, если второй запрос завершился ошибкой?",
          "en": "What should run if the second query fails?"
        },
        "options": [
          "COMMIT",
          "ROLLBACK",
          "SELECT"
        ],
        "correct": "ROLLBACK",
        "ok": {
          "ru": "Верно: транзакция откатывает незавершённую операцию.",
          "en": "Correct: the transaction rolls back the incomplete operation."
        },
        "bad": {
          "ru": "Нужно отменить уже выполненные шаги этой операции.",
          "en": "You need to undo the steps already run in this operation."
        }
      }
    },
    "linux": {
      "title": {
        "ru": "Проверка доступа Linux",
        "en": "Linux access check"
      },
      "layout": "flow",
      "nodes": [
        {
          "label": "user",
          "text": {
            "ru": "кто запускает",
            "en": "who runs it"
          }
        },
        {
          "label": "group",
          "text": {
            "ru": "к какой группе относится",
            "en": "group membership"
          }
        },
        {
          "label": "r w x",
          "text": {
            "ru": "чтение, запись, запуск",
            "en": "read, write, execute"
          }
        },
        {
          "label": "allow / deny",
          "text": {
            "ru": "результат проверки",
            "en": "check result"
          }
        }
      ],
      "points": [
        {
          "term": "r",
          "text": {
            "ru": "разрешение читать файл.",
            "en": "permission to read a file."
          }
        },
        {
          "term": "w",
          "text": {
            "ru": "разрешение изменять файл.",
            "en": "permission to modify a file."
          }
        },
        {
          "term": "x",
          "text": {
            "ru": "разрешение выполнять файл или входить в каталог.",
            "en": "permission to execute a file or enter a directory."
          }
        }
      ],
      "quiz": {
        "question": {
          "ru": "Какое право нужно для запуска скрипта?",
          "en": "Which permission is needed to run a script?"
        },
        "options": [
          "r",
          "w",
          "x"
        ],
        "correct": "x",
        "ok": {
          "ru": "Верно: x означает execute.",
          "en": "Correct: x means execute."
        },
        "bad": {
          "ru": "Нужно разрешение именно на выполнение.",
          "en": "You need the permission specifically for execution."
        }
      }
    },
    "devops": {
      "title": {
        "ru": "Путь запроса в продакшене",
        "en": "Production request path"
      },
      "layout": "flow",
      "nodes": [
        {
          "label": "browser",
          "text": {
            "ru": "запрос пользователя",
            "en": "user request"
          }
        },
        {
          "label": "proxy / balance",
          "text": {
            "ru": "распределяет трафик",
            "en": "distributes traffic"
          }
        },
        {
          "label": "app",
          "text": {
            "ru": "выполняет логику",
            "en": "runs logic"
          }
        },
        {
          "label": "cache / db",
          "text": {
            "ru": "берёт данные",
            "en": "gets data"
          }
        }
      ],
      "points": [
        {
          "term": "reverse proxy",
          "text": {
            "ru": "принимает внешний трафик перед приложением.",
            "en": "accepts external traffic before the app."
          }
        },
        {
          "term": "cache",
          "text": {
            "ru": "отдаёт частые данные быстрее базы.",
            "en": "serves frequent data faster than the database."
          }
        },
        {
          "term": "container",
          "text": {
            "ru": "упаковывает приложение с окружением.",
            "en": "packages the app with its environment."
          }
        }
      ],
      "quiz": {
        "question": {
          "ru": "Что обычно принимает внешний HTTP-трафик перед Node.js?",
          "en": "What usually receives external HTTP traffic before Node.js?"
        },
        "options": [
          "reverse proxy",
          "package.json",
          "localStorage"
        ],
        "correct": "reverse proxy",
        "ok": {
          "ru": "Верно: например, Nginx направляет запрос приложению.",
          "en": "Correct: for example, Nginx forwards the request to the app."
        },
        "bad": {
          "ru": "Нужен сетевой слой перед процессом приложения.",
          "en": "You need the network layer in front of the app process."
        }
      }
    },
    "git": {
      "title": {
        "ru": "Путь изменения в Git",
        "en": "A change through Git"
      },
      "layout": "flow",
      "nodes": [
        {
          "label": "working tree",
          "text": {
            "ru": "изменённые файлы",
            "en": "modified files"
          }
        },
        {
          "label": "git add",
          "text": {
            "ru": "выбор изменений",
            "en": "select changes"
          }
        },
        {
          "label": "commit",
          "text": {
            "ru": "снимок истории",
            "en": "history snapshot"
          }
        },
        {
          "label": "push",
          "text": {
            "ru": "отправка remote",
            "en": "send to remote"
          }
        }
      ],
      "points": [
        {
          "term": "working tree",
          "text": {
            "ru": "текущее состояние файлов на диске.",
            "en": "the current files on disk."
          }
        },
        {
          "term": "staging area",
          "text": {
            "ru": "набор изменений для следующего коммита.",
            "en": "changes selected for the next commit."
          }
        },
        {
          "term": "commit",
          "text": {
            "ru": "локальный снимок с сообщением.",
            "en": "a local snapshot with a message."
          }
        }
      ],
      "quiz": {
        "question": {
          "ru": "Куда git add помещает изменения?",
          "en": "Where does git add place changes?"
        },
        "options": [
          "remote",
          "staging area",
          "trash"
        ],
        "correct": "staging area",
        "ok": {
          "ru": "Верно: staging area формирует содержимое следующего коммита.",
          "en": "Correct: the staging area forms the next commit."
        },
        "bad": {
          "ru": "Изменения ещё не отправляются на GitHub и не становятся коммитом.",
          "en": "Changes are not yet pushed to GitHub or committed."
        }
      }
    }
  };

  const BREAKDOWN_ASSIGNMENTS = {
    "block-semantic": "semantic",
    "block-page-structure": "semantic",
    "block-forms": "form",
    "block-inputs": "form",
    "block-react-forms": "form",
    "block-react-rhf-zod-2026": "form",
    "block-node-zod-validation": "form",
    "block-node-zod-advanced": "form",
    "block-boxmodel": "box",
    "block-css-responsive-2026": "layout",
    "block-flexbox": "layout",
    "block-grid": "layout",
    "block-center-button": "layout",
    "block-selectors": "cascade",
    "block-nested-selectors": "cascade",
    "block-css-modern-layer-nesting": "cascade",
    "block-functions": "function",
    "block-js-closures": "function",
    "block-arrays": "array",
    "block-destructuring": "array",
    "block-js-modern-2026": "array",
    "block-conditions": "condition",
    "block-dom": "dom",
    "block-react-useref": "dom",
    "block-events": "event",
    "block-timers": "event",
    "block-localstorage": "storage",
    "block-localstorage-counter": "storage",
    "block-react-zustand-persist": "storage",
    "block-async": "async",
    "block-fetch": "async",
    "block-trycatch": "async",
    "block-js-network-2026": "async",
    "block-js-eventloop": "async",
    "block-ts-async": "async",
    "block-react-data-fetching": "async",
    "block-ts-strict-2026": "types",
    "block-ts-basics": "types",
    "block-ts-interfaces": "types",
    "block-ts-narrowing": "types",
    "block-ts-discriminated": "types",
    "block-ts-void-never": "types",
    "block-ts-satisfies": "types",
    "block-ts-generics": "generic",
    "block-ts-generics-react-2026": "generic",
    "block-ts-react": "generic",
    "block-ts-utility": "generic",
    "block-ts-conditional-mapped": "generic",
    "block-react-components": "react",
    "block-react-hooks": "react",
    "block-react-lists": "react",
    "block-react-context": "react",
    "block-react-zustand-2026": "react",
    "block-react-advanced-hooks": "react",
    "block-react-cleanup": "effect",
    "block-react-effect-loop": "effect",
    "block-react-custom-hooks": "effect",
    "block-vite-basics": "build",
    "block-vite-ssr-islands": "build",
    "block-nextjs-ssg-isr": "build",
    "block-node-next-overview-2026": "backend",
    "block-next-app-router-2026": "backend",
    "block-node-nextjs-intro": "backend",
    "block-nextjs-routing": "backend",
    "block-nextjs-data": "backend",
    "block-nextjs-api": "backend",
    "block-node-what": "backend",
    "block-node-api-styles": "backend",
    "block-node-websockets": "backend",
    "block-next-auth-2026": "auth",
    "block-node-auth-types": "auth",
    "block-node-access-refresh": "auth",
    "block-node-cookies-security": "auth",
    "block-node-cors-security": "auth",
    "block-sql-select": "sql",
    "block-sql-crud": "sql",
    "block-sql-aggregate": "sql",
    "block-pg-crud": "sql",
    "block-pg-queries": "sql",
    "block-sql-keys": "relations",
    "block-sql-joins": "relations",
    "block-pg-orm-2026": "relations",
    "block-pg-prisma": "relations",
    "block-pg-schema": "relations",
    "block-sql-transactions-isolation": "transaction",
    "block-linux-permissions": "linux",
    "block-linux-processes": "linux",
    "block-linux-ssh": "linux",
    "block-devops-server": "devops",
    "block-devops-cache": "devops",
    "block-devops-balance": "devops",
    "block-devops-docker": "devops",
    "block-devops-path": "devops",
    "block-devops-github-actions": "devops",
    "block-devops-compose-nginx": "devops",
    "block-devops-message-brokers": "devops",
    "block-git-status": "git",
    "block-git-commit": "git",
    "block-git-branches": "git",
    "block-git-remote": "git",
    "block-git-conflicts": "git",
    "block-git-viz": "git",
    "block-git-scenarios": "git",
    "block-git-push": "git",
    "block-git-pull-conflict": "git"
  };

  function breakdownText(value) {
    if (value && typeof value === 'object' && ('ru' in value || 'en' in value)) {
      return isEnglish ? (value.en || value.ru || '') : (value.ru || value.en || '');
    }
    return String(value ?? '');
  }

  function isSemanticLesson(block) {
    const source = `${cleanTitle(block)} ${codeFrom(block)}`.toLowerCase();
    return ['<header', '<nav', '<main', '<article', '<aside', '<footer']
      .filter(tag => source.includes(tag)).length >= 4;
  }

  function breakdownSchema(block) {
    const key = BREAKDOWN_ASSIGNMENTS[block?.id] || (isSemanticLesson(block) ? 'semantic' : '');
    return key && BREAKDOWN_TEMPLATES[key] ? { key, ...BREAKDOWN_TEMPLATES[key] } : null;
  }

  function renderConceptVisual(schema) {
    if (schema.layout === 'page') {
      return `<div class="wdgl-page-map" aria-label="${escapeHtml(breakdownText(schema.title))}">
        <div class="wdgl-map-header">header</div>
        <div class="wdgl-map-nav">nav</div>
        <div class="wdgl-map-main"><span>main</span><div class="wdgl-map-content"><div>article</div><div>aside</div></div></div>
        <div class="wdgl-map-footer">footer</div>
      </div>`;
    }
    const nodes = schema.nodes || [];
    return `<div class="wdgl-concept-visual is-${escapeHtml(schema.layout || 'flow')}" aria-label="${escapeHtml(breakdownText(schema.title))}">
      <div class="wdgl-concept-track">
        ${nodes.map((node, nodeIndex) => `${nodeIndex ? `<span class="wdgl-concept-arrow" aria-hidden="true">${schema.layout === 'cycle' && nodeIndex === nodes.length - 1 ? '↻' : '→'}</span>` : ''}<div class="wdgl-concept-node"><small>${String(nodeIndex + 1).padStart(2, '0')}</small><strong>${escapeHtml(node.label)}</strong><span>${escapeHtml(breakdownText(node.text))}</span></div>`).join('')}
      </div>
    </div>`;
  }

  function renderBreakdown(section, block, index) {
    const schema = breakdownSchema(block);
    if (!schema) return '';
    const storageId = `${sectionId(section)}:${index}:${schema.key}`;
    const saved = readJson(BREAKDOWN_KEY, {})[storageId] || {};
    const correctValue = String(schema.quiz.correct);
    const optionHtml = schema.quiz.options.map(option => {
      const value = typeof option === 'object' ? String(option.en || option.ru || '') : String(option);
      const selected = saved.answer === value;
      const resultClass = saved.checked && selected ? (value === correctValue ? 'correct' : 'wrong') : '';
      return `<button type="button" data-wdgl-answer="${escapeHtml(value)}" aria-pressed="${selected}" class="${selected ? 'selected' : ''} ${resultClass}">${escapeHtml(breakdownText(option))}</button>`;
    }).join('');
    const feedbackText = saved.checked ? breakdownText(saved.answer === correctValue ? schema.quiz.ok : schema.quiz.bad) : '';
    const feedbackClass = saved.checked ? (saved.answer === correctValue ? 'correct' : 'wrong') : '';
    return `<section class="wdgl-breakdown" data-wdgl-breakdown data-wdgl-breakdown-id="${escapeHtml(storageId)}" data-wdgl-correct="${escapeHtml(correctValue)}" data-wdgl-ok="${escapeHtml(breakdownText(schema.quiz.ok))}" data-wdgl-bad="${escapeHtml(breakdownText(schema.quiz.bad))}">
      <div class="wdgl-breakdown-head"><span>${copy.breakdown}</span><small>${escapeHtml(breakdownText(schema.title))}</small></div>
      <div class="wdgl-breakdown-grid">
        ${renderConceptVisual(schema)}
        <ol class="wdgl-tag-list">${schema.points.map(point => `<li><span></span><p><code>${escapeHtml(point.term)}</code> — ${escapeHtml(breakdownText(point.text))}</p></li>`).join('')}</ol>
      </div>
      <div class="wdgl-quiz">
        <strong>${escapeHtml(breakdownText(schema.quiz.question))}</strong>
        <div class="wdgl-quiz-options" role="group" aria-label="${escapeHtml(breakdownText(schema.quiz.question))}">${optionHtml}</div>
        <button type="button" class="wdgl-primary-btn" data-wdgl-check>${copy.checkAnswer}</button>
      </div>
      <p class="wdgl-quiz-feedback ${feedbackClass}" data-wdgl-feedback aria-live="polite">${escapeHtml(feedbackText)}</p>
    </section>`;
  }

  function renderChrome(section, index) {
    const blocks = learningBlocks(section);
    if (!blocks.length) return;
    const block = blocks[index];
    const stats = sectionChecks(section);
    const title = cleanTitle(block, index);
    const minutes = estimateMinutes(block);
    section.querySelectorAll(':scope > .wdgl-header, :scope > .wdgl-practice, :scope > .wdgl-bottom, .wdgl-breakdown').forEach(node => node.remove());

    const header = document.createElement('header');
    header.className = 'wdgl-header';
    header.innerHTML = `<div class="wdgl-breadcrumb">${copy.learning}<span>/</span>${escapeHtml(sectionTitle(section))}<span>/</span>${copy.foundations}</div>
      <div class="wdgl-title-row">
        <button class="wdgl-icon-btn" type="button" data-wdgl-prev title="${copy.previous}">${icon('tabler:chevron-left', 19)}</button>
        <div><h1>${escapeHtml(title)}</h1><div class="wdgl-meta"><span class="important">${copy.important}</span><span>${icon('tabler:clock', 14)} ${minutes} ${copy.minutes}</span><span>${copy.lesson} ${index + 1} ${copy.of} ${blocks.length}</span></div></div>
        <button class="wdgl-icon-btn" type="button" data-wdgl-next title="${copy.next}">${icon('tabler:chevron-right', 19)}</button>
      </div>
      <div class="wdgl-timeline">${renderTimeline(blocks, index)}</div>`;

    const practiceHost = document.createElement('div');
    practiceHost.innerHTML = renderPractice(section, block, index);
    const practice = practiceHost.firstElementChild;

    const breakdownHost = document.createElement('div');
    breakdownHost.innerHTML = renderBreakdown(section, block, index);
    const breakdown = breakdownHost.firstElementChild;

    const bottom = document.createElement('footer');
    bottom.className = 'wdgl-bottom';
    bottom.innerHTML = `<button type="button" class="wdgl-secondary-btn" data-wdgl-prev>${icon('tabler:arrow-left', 17)} ${copy.previous}</button>
      <div class="wdgl-bottom-progress"><span><i style="width:${stats.percent}%"></i></span><small>${escapeHtml(sectionTitle(section))} · ${stats.percent}% ${copy.sectionProgress}</small></div>
      <button type="button" class="wdgl-primary-btn" data-wdgl-next>${copy.next} ${icon('tabler:arrow-right', 17)}</button>`;

    section.insertBefore(header, blocks[0]);
    if (breakdown) {
      const breakdownAnchor = block.querySelector('.explain, .code-wrap') || block.querySelector('.block-title');
      if (breakdownAnchor) breakdownAnchor.insertAdjacentElement('afterend', breakdown);
      else block.appendChild(breakdown);
    }
    section.appendChild(practice);
    section.appendChild(bottom);
    bindChrome(section, block, index);
  }

  function bindChrome(section, block, index) {
    section.querySelectorAll('[data-wdgl-index]').forEach(button => {
      button.addEventListener('click', () => showLesson(section, Number(button.dataset.wdglIndex)));
    });
    section.querySelectorAll('[data-wdgl-prev]').forEach(button => {
      button.addEventListener('click', () => showLesson(section, index - 1));
    });
    section.querySelectorAll('[data-wdgl-next]').forEach(button => {
      button.addEventListener('click', () => showLesson(section, index + 1));
    });
    section.querySelector('[data-wdgl-collapse]')?.addEventListener('click', () => {
      section.classList.toggle('wdgl-practice-collapsed');
      const collapsed = section.classList.contains('wdgl-practice-collapsed');
      section.querySelector('[data-wdgl-collapse]')?.setAttribute('title', collapsed ? copy.expand : copy.collapse);
    });
    section.querySelector('[data-wdgl-play]')?.addEventListener('click', () => {
      block.querySelector('[data-learning-direct-play]:not([disabled])')?.click();
    });
    section.querySelector('[data-wdgl-hint]')?.addEventListener('click', () => {
      block.querySelector('[data-learning-open]')?.click();
    });
    const note = section.querySelector('[data-wdgl-note]');
    note?.addEventListener('input', () => {
      state.notes[noteId(section, index)] = note.value;
      writeJson(NOTE_KEY, state.notes);
      const status = section.querySelector('[data-wdgl-note-status]');
      if (status) status.textContent = copy.saved;
    });

    const breakdown = section.querySelector('[data-wdgl-breakdown]');
    breakdown?.querySelectorAll('[data-wdgl-answer]').forEach(button => {
      button.addEventListener('click', () => {
        breakdown.querySelectorAll('[data-wdgl-answer]').forEach(option => {
          const selected = option === button;
          option.classList.toggle('selected', selected);
          option.setAttribute('aria-pressed', String(selected));
          option.classList.remove('correct', 'wrong');
        });
        const feedback = breakdown.querySelector('[data-wdgl-feedback]');
        if (feedback) {
          feedback.textContent = '';
          feedback.className = 'wdgl-quiz-feedback';
        }
      });
    });
    breakdown?.querySelector('[data-wdgl-check]')?.addEventListener('click', () => {
      const selected = breakdown.querySelector('[data-wdgl-answer].selected');
      const feedback = breakdown.querySelector('[data-wdgl-feedback]');
      if (!selected) {
        if (feedback) feedback.textContent = copy.chooseAnswer;
        return;
      }
      const correct = selected.dataset.wdglAnswer === breakdown.dataset.wdglCorrect;
      selected.classList.add(correct ? 'correct' : 'wrong');
      if (feedback) {
        feedback.textContent = correct ? breakdown.dataset.wdglOk : breakdown.dataset.wdglBad;
        feedback.className = `wdgl-quiz-feedback ${correct ? 'correct' : 'wrong'}`;
      }
      const answers = readJson(BREAKDOWN_KEY, {});
      answers[breakdown.dataset.wdglBreakdownId] = { answer: selected.dataset.wdglAnswer, checked: true };
      writeJson(BREAKDOWN_KEY, answers);
    });
  }

  function showLesson(section, requestedIndex, scroll = true) {
    const blocks = learningBlocks(section);
    if (!blocks.length) return;
    const index = Math.max(0, Math.min(blocks.length - 1, requestedIndex));
    state.indexBySection[sectionId(section)] = index;
    writeJson(INDEX_KEY, state.indexBySection);
    blocks.forEach((block, blockIndex) => {
      block.classList.toggle('wdgl-current', blockIndex === index);
      block.setAttribute('aria-hidden', blockIndex === index ? 'false' : 'true');
    });
    renderChrome(section, index);
    if (scroll) section.querySelector('.wdgl-header')?.scrollIntoView({ block: 'start' });
  }

  function openLesson(sectionName, target = {}) {
    const id = String(sectionName || '').replace(/^sec-/, '');
    if (!id) return false;
    if (typeof window.WebDevGymNext?.open === 'function') window.WebDevGymNext.open(id);
    else if (typeof window.switchTabByName === 'function') window.switchTabByName(id);

    const reveal = () => {
      const section = document.getElementById(`sec-${id}`) || document.getElementById(id);
      if (!section) return false;
      const blocks = learningBlocks(section);
      const wantedTitle = String(target.title || '').replace(/\s+/g, ' ').trim().toLowerCase();
      const index = blocks.findIndex(block => {
        if (target.blockId && block.id === target.blockId) return true;
        return wantedTitle && cleanTitle(block).toLowerCase() === wantedTitle;
      });
      enhanceSection(section);
      showLesson(section, index >= 0 ? index : currentIndex(section), true);
      return index >= 0;
    };

    window.setTimeout(reveal, 90);
    return true;
  }

  function enhanceSection(section) {
    if (!LEARNING_IDS.has(sectionId(section))) return;
    const blocks = learningBlocks(section);
    if (!blocks.length) return;
    section.classList.add('wdgl-workspace');
    if (section.dataset.wdglReady !== '1') {
      section.dataset.wdglReady = '1';
      section.addEventListener('change', event => {
        if (event.target.matches('.prog-cb')) renderChrome(section, currentIndex(section));
      });
    }
    showLesson(section, currentIndex(section), false);
  }

  function cleanupUniversalActions() {
    document.querySelectorAll('.section').forEach(section => {
      if (LEARNING_IDS.has(sectionId(section))) return;
      section.querySelectorAll('.wdgf-deep-actions').forEach(actions => actions.remove());
      section.querySelectorAll('[data-wdg-deep-ready]').forEach(block => delete block.dataset.wdgDeepReady);
    });
  }

  let activeSection = null;
  let activeBlockCount = 0;
  let syncTimer = 0;
  let activationObserver = null;

  function syncActiveSection(force = false) {
    const section = document.querySelector('.section.active');
    const legacyAreaHidden = document.body.matches('.wdgn-overview-open, .wdgn-custom-page-open, .wdgf-page-open, .wdgr-settings-open');
    const sectionVisible = section && !section.hidden && !legacyAreaHidden;
    if (!section || !sectionVisible || !LEARNING_IDS.has(sectionId(section))) {
      document.body.classList.remove('wdgl-learning-open');
      return;
    }
    document.body.classList.add('wdgl-learning-open');
    const blockCount = learningBlocks(section).length;
    const chromeReady = Boolean(section.querySelector(':scope > .wdgl-header'));
    if (!force && activeSection === section && activeBlockCount === blockCount && chromeReady) return;
    activeSection = section;
    activeBlockCount = blockCount;
    enhanceSection(section);
  }

  function scheduleSync(force = false) {
    window.clearTimeout(syncTimer);
    syncTimer = window.setTimeout(() => syncActiveSection(force), 60);
  }

  function watchSectionActivation(root = document) {
    if (activationObserver) return;
    const container = document.querySelector('.wrap') || document.body;
    activationObserver = new MutationObserver(records => {
      const sectionChanged = records.some(record =>
        record.target instanceof Element && record.target.classList.contains('section')
      );
      if (sectionChanged) scheduleSync();
    });
    activationObserver.observe(container, { subtree: true, attributes: true, attributeFilter: ['class'] });
  }

  function init() {
    cleanupUniversalActions();
    watchSectionActivation();
    document.addEventListener('click', () => scheduleSync(), true);
    document.addEventListener('webdevgym:curriculum-rendered', event => {
      watchSectionActivation(event.target instanceof Element ? event.target : document);
      scheduleSync(true);
    });
    let attempts = 0;
    const waitForCurriculum = setInterval(() => {
      attempts += 1;
      watchSectionActivation();
      syncActiveSection();
      if (document.querySelector('.section.active > .block') || attempts >= 20) clearInterval(waitForCurriculum);
    }, 250);
    syncActiveSection(true);
  }

  window.WebDevGymLearningWorkspace = Object.freeze({ openLesson });

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => setTimeout(init, 900), { once: true });
  } else {
    setTimeout(init, 900);
  }
})();
