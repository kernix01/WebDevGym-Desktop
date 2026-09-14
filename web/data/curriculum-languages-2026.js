(function addOptionalCurricula() {
  'use strict';

  const data = window.WebDevGymCurriculumData;
  if (!data || !Array.isArray(data.sections)) return;

  const isEnglish = data.locale === 'en';
  const L = (en, ru) => isEnglish ? en : ru;

  function escapeHtml(value) {
    return String(value == null ? '' : value).replace(/[&<>"']/g, character => ({
      '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
    })[character]);
  }

  function createLesson(language, definition) {
    const checklist = definition.checklist.map((item, index) => (
      '<label class="item"><input type="checkbox" class="prog-cb" ' +
      'data-pid="language-' + definition.id + '-' + (index + 1) + '" ' +
      'onchange="updateProgress(this)"><span>' + escapeHtml(item) + '</span></label>'
    )).join('');

    const sources = definition.sources.map(source => (
      '<a href="' + source.url + '" target="_blank" rel="noopener noreferrer">' +
      escapeHtml(source.label) + '</a>'
    )).join(' · ');

    return {
      id: definition.id,
      title: definition.title,
      html: '<div class="block wdg-depth-lesson wdg-language-lesson" id="' + definition.id + '" data-language="' + language + '">' +
        '<div class="block-title" onclick="scrollToBlock(\'' + definition.id + '\')">' +
        escapeHtml(definition.title) + ' <span class="badge ' + (definition.badgeClass || 'good') + '">' +
        escapeHtml(definition.badge) + '</span><span class="anchor-icon">#</span></div>' +
        '<div class="tip">' + definition.tip + '</div>' +
        '<div class="code">' + escapeHtml(definition.code) + '</div>' +
        '<div class="explain">' + definition.explain + '</div>' +
        '<div class="wdg-depth-practice"><strong>' + L('Practice', 'Практика') +
        ':</strong> ' + definition.practice + '</div>' +
        '<div class="wdg-depth-docs"><strong>' + L('Official sources', 'Официальные источники') +
        ':</strong> ' + sources + '</div>' +
        '<div class="items">' + checklist + '</div></div>'
    };
  }

  function addSection(id, title, language, definitions) {
    if (data.sections.some(section => section.id === id)) return;
    data.sections.push({
      id,
      title,
      lessons: definitions.map(definition => createLesson(language, definition))
    });
  }

  const pythonLessons = [
    {
      id: 'block-python-start-2026',
      title: L('Python: interpreter, project, and virtual environment', 'Python: интерпретатор, проект и виртуальное окружение'),
      badge: L('START', 'СТАРТ'),
      tip: L('Run Python from a project folder and isolate its packages in .venv. The environment is disposable; your source code is not stored inside it.', 'Запускай Python из папки проекта и изолируй пакеты в .venv. Окружение можно пересоздать; исходный код внутри него не хранят.'),
      code: 'python --version\npython -m venv .venv\n\n# Windows PowerShell\n.\\.venv\\Scripts\\Activate.ps1\n\n# main.py\nprint("Hello, Python!")\n\npython main.py',
      explain: L('The interpreter executes a <code>.py</code> file from top to bottom. A virtual environment gives one project its own installed packages and should normally be excluded from Git. Start with a small console project before choosing a web framework.', 'Интерпретатор выполняет файл <code>.py</code> сверху вниз. Виртуальное окружение даёт проекту собственный набор пакетов и обычно исключается из Git. До выбора веб-фреймворка начни с небольшого консольного проекта.'),
      practice: L('Create a folder, activate .venv, run main.py, then close the terminal and repeat the launch without copying commands.', 'Создай папку, активируй .venv, запусти main.py, затем закрой терминал и повтори запуск без копирования команд.'),
      checklist: [L('I can create and activate .venv', 'Могу создать и активировать .venv'), L('I know where project code belongs', 'Понимаю, где должен лежать код проекта'), L('I can run a Python file from the terminal', 'Могу запустить Python-файл из терминала')],
      sources: [{ label: 'Python tutorial', url: 'https://docs.python.org/3/tutorial/' }, { label: 'venv', url: 'https://docs.python.org/3/library/venv.html' }]
    },
    {
      id: 'block-python-values-2026',
      title: L('Values, variables, input, and output', 'Значения, переменные, ввод и вывод'),
      badge: L('FOUNDATION', 'ОСНОВА'),
      tip: L('A Python name refers to an object. Convert text from input before doing numeric calculations.', 'Имя в Python ссылается на объект. Текст из input нужно преобразовать до числовых вычислений.'),
      code: 'title = input("Expense: ").strip()\namount_text = input("Amount: ")\namount = float(amount_text)\n\nis_valid = bool(title) and amount > 0\nprint(f"{title}: {amount:.2f} ₽")\nprint(type(amount), is_valid)',
      explain: L('<code>input()</code> always returns a string. Use <code>int()</code> or <code>float()</code> only when that conversion makes sense, and handle invalid input later with exceptions. F-strings insert values into readable output.', '<code>input()</code> всегда возвращает строку. Используй <code>int()</code> или <code>float()</code>, только когда преобразование имеет смысл, а неверный ввод позже обработай исключением. F-строки удобно вставляют значения в текст.'),
      practice: L('Ask for a product name, price, and quantity. Print the total and whether the order is valid.', 'Запроси название товара, цену и количество. Выведи итог и признак корректного заказа.'),
      checklist: [L('I distinguish str, int, float, and bool', 'Различаю str, int, float и bool'), L('I explicitly convert input', 'Явно преобразую ввод'), L('I can build an f-string', 'Могу собрать f-строку')],
      sources: [{ label: 'Python introduction', url: 'https://docs.python.org/3/tutorial/introduction.html' }, { label: 'Input and output', url: 'https://docs.python.org/3/tutorial/inputoutput.html' }]
    },
    {
      id: 'block-python-control-flow-2026',
      title: L('Conditions, loops, range, and match', 'Условия, циклы, range и match'),
      badge: L('CONTROL FLOW', 'ЛОГИКА'),
      tip: L('Indentation defines blocks in Python. Keep one consistent indentation level and make every branch intentional.', 'Отступы задают блоки Python. Используй один размер отступа и делай каждую ветку осмысленной.'),
      code: 'expenses = [120, 500, 80]\n\nfor amount in expenses:\n    if amount >= 500:\n        label = "large"\n    elif amount >= 100:\n        label = "regular"\n    else:\n        label = "small"\n    print(amount, label)\n\nfor index in range(3):\n    print(index)',
      explain: L('<code>if</code> selects a branch, <code>for</code> iterates over values, and <code>range()</code> produces a number sequence. Prefer direct iteration over a collection when you do not need an index. Use <code>while</code> only when repetition depends on a condition rather than a known collection.', '<code>if</code> выбирает ветку, <code>for</code> перебирает значения, а <code>range()</code> создаёт последовательность чисел. Перебирай коллекцию напрямую, если индекс не нужен. Используй <code>while</code>, когда повторение зависит от условия, а не от готовой коллекции.'),
      practice: L('Classify five temperatures, then stop a while loop when the user enters "exit".', 'Раздели пять температур по категориям, затем останови цикл while после ввода "exit".'),
      checklist: [L('I keep indentation consistent', 'Соблюдаю одинаковые отступы'), L('I choose for or while for a reason', 'Осознанно выбираю for или while'), L('I can explain every condition branch', 'Могу объяснить каждую ветку условия')],
      sources: [{ label: 'Control flow', url: 'https://docs.python.org/3/tutorial/controlflow.html' }]
    },
    {
      id: 'block-python-functions-2026',
      title: L('Functions, parameters, return, and scope', 'Функции, параметры, return и область видимости'),
      badge: L('CORE SKILL', 'КЛЮЧЕВОЙ НАВЫК'),
      tip: L('A function should receive clear input and return a useful result. Printing inside it is not the same as returning a value.', 'Функция должна получать понятные данные и возвращать полезный результат. print внутри функции не заменяет return.'),
      code: 'def calculate_total(amount, fee_percent=0):\n    fee = amount * fee_percent / 100\n    return amount + fee\n\ntotal = calculate_total(1200, fee_percent=5)\nprint(total)',
      explain: L('Parameters are local names created for one call. <code>return</code> stops the function and sends a value to the caller. Avoid changing global state from a calculation function; returning a result makes it easier to test and reuse.', 'Параметры — локальные имена для одного вызова. <code>return</code> завершает функцию и отдаёт значение вызывающему коду. Не меняй глобальное состояние из функции расчёта: возвращаемый результат проще тестировать и переиспользовать.'),
      practice: L('Write validate_amount(value) and format_expense(title, amount). Call each with valid and invalid values.', 'Напиши validate_amount(value) и format_expense(title, amount). Вызови каждую с корректными и ошибочными значениями.'),
      checklist: [L('I distinguish print from return', 'Различаю print и return'), L('I understand local scope', 'Понимаю локальную область видимости'), L('My function has one clear responsibility', 'У функции одна понятная ответственность')],
      sources: [{ label: 'Defining functions', url: 'https://docs.python.org/3/tutorial/controlflow.html#defining-functions' }]
    },
    {
      id: 'block-python-collections-2026',
      title: L('Lists, tuples, sets, and dictionaries', 'Списки, кортежи, множества и словари'),
      badge: L('DATA', 'ДАННЫЕ'),
      tip: L('Choose a collection by the operations you need: ordered mutable items, a fixed record, unique values, or key-value lookup.', 'Выбирай коллекцию по нужным операциям: изменяемый порядок, фиксированная запись, уникальные значения или поиск по ключу.'),
      code: 'transactions = [\n    {"title": "Food", "amount": 450},\n    {"title": "Bus", "amount": 80},\n]\n\ntransactions.append({"title": "Book", "amount": 900})\ncategories = {item["title"] for item in transactions}\nfirst_title, first_amount = transactions[0].values()\n\nprint(categories, first_title, first_amount)',
      explain: L('A <code>list</code> is ordered and mutable, a <code>tuple</code> is an immutable sequence, a <code>set</code> keeps unique values, and a <code>dict</code> maps keys to values. Learn mutation methods such as append and pop, but avoid changing a collection while iterating over it.', '<code>list</code> упорядочен и изменяем, <code>tuple</code> — неизменяемая последовательность, <code>set</code> хранит уникальные значения, а <code>dict</code> связывает ключи со значениями. Освой append и pop, но не меняй коллекцию во время её перебора.'),
      practice: L('Store five transactions as dictionaries. Add one, remove one by id, and calculate a total with a loop.', 'Сохрани пять операций как словари. Добавь одну, удали одну по id и посчитай сумму циклом.'),
      checklist: [L('I choose the right collection type', 'Выбираю подходящий тип коллекции'), L('I can safely add and remove values', 'Умею безопасно добавлять и удалять значения'), L('I can model one entity with a dictionary', 'Могу описать одну сущность словарём')],
      sources: [{ label: 'Data structures', url: 'https://docs.python.org/3/tutorial/datastructures.html' }]
    },
    {
      id: 'block-python-comprehensions-2026',
      title: L('Comprehensions, sorting, and iteration tools', 'Comprehensions, сортировка и инструменты перебора'),
      badge: L('TRANSFORM', 'ПРЕОБРАЗОВАНИЕ'),
      tip: L('Use a comprehension for a short readable transformation. Use a normal loop when the logic needs several steps or side effects.', 'Используй comprehension для короткого понятного преобразования. Если логика требует нескольких шагов или побочных действий, оставь обычный цикл.'),
      code: 'amounts = [450, 80, 900, 120]\nlarge = [amount for amount in amounts if amount >= 400]\nwith_tax = [round(amount * 1.05, 2) for amount in large]\nordered = sorted(with_tax, reverse=True)\n\nfor index, amount in enumerate(ordered, start=1):\n    print(index, amount)',
      explain: L('A list comprehension builds a new list. <code>sorted()</code> returns a new sorted list, while <code>list.sort()</code> changes the existing list and returns None. <code>enumerate()</code> provides an index without manual counters, and <code>zip()</code> pairs iterables.', 'List comprehension создаёт новый список. <code>sorted()</code> возвращает новый отсортированный список, а <code>list.sort()</code> меняет существующий и возвращает None. <code>enumerate()</code> даёт индекс без ручного счётчика, а <code>zip()</code> объединяет последовательности попарно.'),
      practice: L('Filter completed tasks, sort them by title, and print a numbered list. Then rewrite an overly complex comprehension as a loop.', 'Отфильтруй выполненные задачи, отсортируй по названию и выведи нумерованный список. Затем перепиши слишком сложный comprehension обычным циклом.'),
      checklist: [L('My comprehension stays readable', 'Мой comprehension остаётся читаемым'), L('I distinguish sorted from list.sort', 'Различаю sorted и list.sort'), L('I can use enumerate and zip', 'Умею применять enumerate и zip')],
      sources: [{ label: 'List comprehensions', url: 'https://docs.python.org/3/tutorial/datastructures.html#list-comprehensions' }, { label: 'Looping techniques', url: 'https://docs.python.org/3/tutorial/datastructures.html#looping-techniques' }]
    },
    {
      id: 'block-python-modules-2026',
      title: L('Modules, packages, dependencies, and imports', 'Модули, пакеты, зависимости и imports'),
      badge: L('STRUCTURE', 'СТРУКТУРА'),
      tip: L('Split code by responsibility. A module should expose a small useful API instead of sharing writable global state.', 'Разделяй код по ответственности. Модуль должен давать небольшой полезный API, а не общее изменяемое глобальное состояние.'),
      code: '# calculator.py\ndef total(amounts):\n    return sum(amounts)\n\n# main.py\nfrom calculator import total\n\nif __name__ == "__main__":\n    print(total([120, 80, 500]))\n\n# Save installed dependencies\npython -m pip freeze > requirements.txt',
      explain: L('Each <code>.py</code> file is a module. Packages group modules. The main guard prevents launch-only code from running when the module is imported. Install dependencies inside the active virtual environment and record the project requirements.', 'Каждый файл <code>.py</code> — модуль. Пакеты объединяют модули. Проверка main не даёт коду запуска выполниться при импорте. Устанавливай зависимости в активное виртуальное окружение и фиксируй требования проекта.'),
      practice: L('Move calculations and file storage into separate modules. Keep main.py responsible only for coordinating the program.', 'Вынеси расчёты и хранение файлов в отдельные модули. Оставь main.py только связывать части программы.'),
      checklist: [L('I can import my own module', 'Могу импортировать свой модуль'), L('I understand the main guard', 'Понимаю проверку __main__'), L('Dependencies belong to the project environment', 'Зависимости относятся к окружению проекта')],
      sources: [{ label: 'Python modules', url: 'https://docs.python.org/3/tutorial/modules.html' }, { label: 'Installing packages', url: 'https://packaging.python.org/en/latest/tutorials/installing-packages/' }]
    },
    {
      id: 'block-python-errors-2026',
      title: L('Exceptions, validation, and debugging', 'Исключения, валидация и отладка'),
      badge: L('RELIABILITY', 'НАДЁЖНОСТЬ'),
      tip: L('Catch only errors you can handle. A bare except hides programming mistakes and makes debugging harder.', 'Перехватывай только те ошибки, которые можешь обработать. Пустой except скрывает ошибки программы и усложняет отладку.'),
      code: 'def read_amount(raw_value):\n    try:\n        amount = float(raw_value)\n    except ValueError as error:\n        raise ValueError("Amount must be a number") from error\n\n    if amount <= 0:\n        raise ValueError("Amount must be positive")\n    return amount\n\ntry:\n    print(read_amount("abc"))\nexcept ValueError as error:\n    print(error)',
      explain: L('Validation rejects bad data before it reaches the rest of the program. Catch a specific exception near the place that can recover, add useful context, and let unexpected errors remain visible. Use the traceback to find the first relevant line in your own code.', 'Валидация не пропускает плохие данные дальше по программе. Лови конкретное исключение там, где код может восстановиться, добавляй полезный контекст и не скрывай неожиданные ошибки. По traceback найди первую подходящую строку в своём коде.'),
      practice: L('Validate title, amount, and category. Test empty text, zero, a negative number, and non-numeric input.', 'Проверь название, сумму и категорию. Протестируй пустой текст, ноль, отрицательное число и ввод нечислового значения.'),
      checklist: [L('I catch specific exceptions', 'Ловлю конкретные исключения'), L('I validate at the input boundary', 'Проверяю данные на входе'), L('I can read a traceback', 'Умею читать traceback')],
      sources: [{ label: 'Errors and exceptions', url: 'https://docs.python.org/3/tutorial/errors.html' }]
    },
    {
      id: 'block-python-files-json-2026',
      title: L('Files, pathlib, context managers, and JSON', 'Файлы, pathlib, context managers и JSON'),
      badge: L('STORAGE', 'ХРАНЕНИЕ'),
      tip: L('Use pathlib for paths and a context manager for files. JSON stores data, not Python functions or arbitrary objects.', 'Используй pathlib для путей и context manager для файлов. JSON хранит данные, а не функции Python или произвольные объекты.'),
      code: 'from pathlib import Path\nimport json\n\nfile_path = Path("data") / "transactions.json"\nfile_path.parent.mkdir(exist_ok=True)\n\ntransactions = [{"title": "Food", "amount": 450}]\nwith file_path.open("w", encoding="utf-8") as file:\n    json.dump(transactions, file, ensure_ascii=False, indent=2)\n\nwith file_path.open(encoding="utf-8") as file:\n    restored = json.load(file)',
      explain: L('<code>Path</code> builds paths correctly across operating systems. The <code>with</code> block closes the file even when an exception occurs. Handle a missing file and malformed JSON explicitly, and never trust imported data without validation.', '<code>Path</code> правильно собирает пути в разных системах. Блок <code>with</code> закрывает файл даже при исключении. Явно обработай отсутствие файла и повреждённый JSON, а импортированные данные всегда проверяй.'),
      practice: L('Save a transaction list, reload it after restart, and show a clear message for a missing or broken file.', 'Сохрани список операций, восстанови его после перезапуска и покажи понятное сообщение для отсутствующего или повреждённого файла.'),
      checklist: [L('I build paths with Path', 'Собираю пути через Path'), L('I open files with with', 'Открываю файлы через with'), L('I validate restored JSON data', 'Проверяю восстановленные данные JSON')],
      sources: [{ label: 'pathlib', url: 'https://docs.python.org/3/library/pathlib.html' }, { label: 'json', url: 'https://docs.python.org/3/library/json.html' }]
    },
    {
      id: 'block-python-classes-2026',
      title: L('Classes, dataclasses, and composition', 'Классы, dataclasses и композиция'),
      badge: L('MODELING', 'МОДЕЛИРОВАНИЕ'),
      tip: L('Use a class when data and behavior belong together. Do not turn every dictionary into a class without a reason.', 'Используй класс, когда данные и поведение относятся к одной сущности. Не превращай каждый словарь в класс без причины.'),
      code: 'from dataclasses import dataclass\n\n@dataclass(frozen=True)\nclass Transaction:\n    title: str\n    amount: float\n\n    def is_large(self):\n        return self.amount >= 1000\n\ntransaction = Transaction("Course", 2400)\nprint(transaction.is_large())',
      explain: L('A class defines a type; each instance owns its data. <code>@dataclass</code> generates common methods for data-focused classes, and <code>frozen=True</code> prevents field reassignment. Prefer composition between small objects over deep inheritance trees.', 'Класс определяет тип, а каждый экземпляр хранит свои данные. <code>@dataclass</code> создаёт типовые методы для классов данных, а <code>frozen=True</code> запрещает переназначение полей. Предпочитай композицию небольших объектов глубокому наследованию.'),
      practice: L('Model Transaction and Budget. Let Budget calculate totals from transactions without reading input or printing.', 'Опиши Transaction и Budget. Пусть Budget считает сумму операций без чтения ввода и print.'),
      checklist: [L('I know when a class is useful', 'Понимаю, когда полезен класс'), L('I distinguish class and instance data', 'Различаю данные класса и экземпляра'), L('I prefer small composed objects', 'Предпочитаю небольшие объекты в композиции')],
      sources: [{ label: 'Python classes', url: 'https://docs.python.org/3/tutorial/classes.html' }, { label: 'dataclasses', url: 'https://docs.python.org/3/library/dataclasses.html' }]
    },
    {
      id: 'block-python-typing-2026',
      title: L('Type hints and clear contracts', 'Аннотации типов и понятные контракты'),
      badge: L('QUALITY', 'КАЧЕСТВО'),
      tip: L('Type hints document intent and help tools find mistakes. Python still checks types at runtime unless a separate checker is used.', 'Аннотации типов описывают намерение и помогают инструментам находить ошибки. Сам Python всё равно проверяет типы во время выполнения, если не используется отдельный анализатор.'),
      code: 'from collections.abc import Iterable\n\ndef calculate_total(amounts: Iterable[float]) -> float:\n    return sum(amounts)\n\ndef find_title(transaction_id: int) -> str | None:\n    if transaction_id == 1:\n        return "Food"\n    return None',
      explain: L('Annotate public function inputs and outputs first. <code>str | None</code> says that absence is an expected result and must be handled. Do not add complex generic types just to make simple code look advanced.', 'Сначала указывай типы входов и результатов публичных функций. <code>str | None</code> означает, что отсутствие результата ожидаемо и его нужно обработать. Не добавляй сложные generic-типы только ради вида.'),
      practice: L('Add useful annotations to the storage and calculation modules. Make every optional result explicit.', 'Добавь полезные аннотации в модули хранения и расчётов. Явно обозначь каждый необязательный результат.'),
      checklist: [L('I annotate function contracts', 'Типизирую контракты функций'), L('I handle None explicitly', 'Явно обрабатываю None'), L('I keep annotations readable', 'Сохраняю аннотации читаемыми')],
      sources: [{ label: 'typing', url: 'https://docs.python.org/3/library/typing.html' }, { label: 'Function annotations', url: 'https://docs.python.org/3/tutorial/controlflow.html#function-annotations' }]
    },
    {
      id: 'block-python-testing-2026',
      title: L('Unit tests and testable design', 'Модульные тесты и тестируемый дизайн'),
      badge: L('TESTING', 'ТЕСТЫ'),
      tip: L('Test observable behavior: inputs, return values, and errors. A test should not depend on the order in which other tests ran.', 'Проверяй наблюдаемое поведение: входы, результат и ошибки. Тест не должен зависеть от порядка запуска других тестов.'),
      code: 'import unittest\nfrom calculator import total\n\nclass TotalTests(unittest.TestCase):\n    def test_sums_amounts(self):\n        self.assertEqual(total([120, 80]), 200)\n\n    def test_empty_list_is_zero(self):\n        self.assertEqual(total([]), 0)\n\nif __name__ == "__main__":\n    unittest.main()',
      explain: L('Keep calculations separate from input, files, and the network so they can be tested directly. Name tests after behavior, include normal and boundary cases, and make a failing test readable before fixing the implementation.', 'Отделяй расчёты от ввода, файлов и сети, чтобы тестировать их напрямую. Называй тесты по поведению, добавляй обычные и граничные случаи и сначала добивайся понятного падения теста.'),
      practice: L('Test total calculation, invalid amount, and JSON restoration. Deliberately break one function and read the failure.', 'Протестируй расчёт суммы, неверную сумму и восстановление JSON. Намеренно сломай одну функцию и прочитай сообщение теста.'),
      checklist: [L('Tests describe behavior', 'Тесты описывают поведение'), L('I cover a boundary case', 'Проверяю граничный случай'), L('I can explain a failing assertion', 'Могу объяснить упавшую проверку')],
      sources: [{ label: 'unittest', url: 'https://docs.python.org/3/library/unittest.html' }]
    },
    {
      id: 'block-python-backend-project-2026',
      title: L('Backend API project: from function to endpoint', 'Backend API-проект: от функции к endpoint'),
      badge: L('PROJECT', 'ПРОЕКТ'),
      badgeClass: 'must',
      tip: L('A framework connects HTTP requests to your Python functions. Business rules should remain separate from framework and storage code.', 'Фреймворк связывает HTTP-запросы с функциями Python. Бизнес-правила должны оставаться отдельно от кода фреймворка и хранения.'),
      code: 'from fastapi import FastAPI, HTTPException\n\napp = FastAPI()\ntransactions = {}\n\n@app.get("/transactions/{transaction_id}")\ndef get_transaction(transaction_id: int):\n    transaction = transactions.get(transaction_id)\n    if transaction is None:\n        raise HTTPException(status_code=404, detail="Not found")\n    return transaction',
      explain: L('FastAPI and Django are third-party frameworks, not parts of Python itself. Learn one after functions, collections, errors, files, and tests. For a first API, implement validation, clear HTTP statuses, persistent storage, configuration outside source code, and tests. Never put secrets into a public repository.', 'FastAPI и Django — сторонние фреймворки, а не части Python. Выбирай один после функций, коллекций, ошибок, файлов и тестов. В первом API сделай валидацию, понятные HTTP-статусы, постоянное хранилище, конфигурацию вне исходников и тесты. Не клади секреты в публичный репозиторий.'),
      practice: L('Build a transaction CRUD API with create, list, update, and delete. Add README launch steps and tests for success, invalid input, and 404.', 'Собери CRUD API операций: создание, список, изменение и удаление. Добавь README с запуском и тесты успешного сценария, неверных данных и 404.'),
      checklist: [L('HTTP handlers stay small', 'HTTP-обработчики остаются небольшими'), L('Validation and errors are explicit', 'Валидация и ошибки явные'), L('The project has tests and a README', 'У проекта есть тесты и README')],
      sources: [{ label: 'FastAPI tutorial', url: 'https://fastapi.tiangolo.com/tutorial/' }, { label: 'Django overview', url: 'https://docs.djangoproject.com/en/stable/intro/overview/' }]
    }
  ];

  const csharpLessons = [
    {
      id: 'block-csharp-start-2026',
      title: L('C# and .NET: SDK, project, and first run', 'C# и .NET: SDK, проект и первый запуск'),
      badge: L('START', 'СТАРТ'),
      tip: L('C# is the language; .NET is the platform, runtime, libraries, and tools used to build and run the application.', 'C# — язык, а .NET — платформа, runtime, библиотеки и инструменты для сборки и запуска приложения.'),
      code: 'dotnet --version\ndotnet new console -n ExpenseTracker\ncd ExpenseTracker\ndotnet run\n\n// Program.cs\nConsole.WriteLine("Hello, C#!");',
      explain: L('The .NET SDK includes the compiler and CLI. A project file describes the target framework and dependencies. Modern console templates support top-level statements, so a beginner can start without writing a Program class manually.', 'В .NET SDK входят компилятор и CLI. Файл проекта описывает целевую платформу и зависимости. Современный шаблон консольного приложения поддерживает top-level statements, поэтому вручную писать класс Program в начале не нужно.'),
      practice: L('Create a console project, run it, change the output, and build it with dotnet build.', 'Создай консольный проект, запусти его, измени вывод и собери через dotnet build.'),
      checklist: [L('I distinguish C# from .NET', 'Различаю C# и .NET'), L('I can create and run a project', 'Могу создать и запустить проект'), L('I know what the project file is for', 'Понимаю назначение файла проекта')],
      sources: [{ label: 'C# guide', url: 'https://learn.microsoft.com/en-us/dotnet/csharp/' }, { label: 'dotnet new', url: 'https://learn.microsoft.com/en-us/dotnet/core/tools/dotnet-new' }]
    },
    {
      id: 'block-csharp-types-2026',
      title: L('Types, variables, conversion, and nullability', 'Типы, переменные, преобразование и nullability'),
      badge: L('FOUNDATION', 'ОСНОВА'),
      tip: L('C# checks types at compile time. Use var when the type is obvious from the right side, not when it hides intent.', 'C# проверяет типы при компиляции. Используй var, когда тип очевиден справа, а не когда он скрывает смысл.'),
      code: 'string title = "Food";\ndecimal amount = 450.50m;\nbool isPaid = false;\nstring? note = null;\n\nif (decimal.TryParse("120.50", out decimal parsed))\n{\n    amount = parsed;\n}\n\nConsole.WriteLine($"{title}: {amount:F2}; note: {note ?? "none"}");',
      explain: L('Value types such as int and bool store values; reference types include string and class instances. Nullable reference types help the compiler warn about possible null access. For money, <code>decimal</code> is usually a better choice than float or double.', 'Типы значений вроде int и bool хранят значения; к ссылочным относятся string и экземпляры классов. Nullable reference types помогают компилятору предупреждать о возможном null. Для денег <code>decimal</code> обычно подходит лучше float или double.'),
      practice: L('Read a title and amount. Use TryParse, reject invalid input, and print a formatted result.', 'Прочитай название и сумму. Используй TryParse, отклони неверный ввод и выведи форматированный результат.'),
      checklist: [L('I know why decimal fits money', 'Понимаю, почему decimal подходит для денег'), L('I handle nullable values', 'Обрабатываю nullable-значения'), L('I convert user input safely', 'Безопасно преобразую пользовательский ввод')],
      sources: [{ label: 'C# type system', url: 'https://learn.microsoft.com/en-us/dotnet/csharp/fundamentals/types/' }, { label: 'Nullable references', url: 'https://learn.microsoft.com/en-us/dotnet/csharp/nullable-references' }]
    },
    {
      id: 'block-csharp-control-flow-2026',
      title: L('Conditions, loops, and pattern matching', 'Условия, циклы и pattern matching'),
      badge: L('CONTROL FLOW', 'ЛОГИКА'),
      tip: L('Use the simplest construct that expresses the rule. Pattern matching is useful when both type and value shape the result.', 'Используй самую простую конструкцию, которая выражает правило. Pattern matching полезен, когда результат зависит и от типа, и от значения.'),
      code: 'decimal[] amounts = [120m, 900m, 40m];\n\nforeach (decimal amount in amounts)\n{\n    string label = amount switch\n    {\n        >= 500m => "large",\n        >= 100m => "regular",\n        _ => "small"\n    };\n\n    Console.WriteLine($"{amount}: {label}");\n}',
      explain: L('<code>if</code> is good for general branching, <code>switch</code> groups cases, <code>foreach</code> iterates values, and <code>for</code> is useful when the index matters. Keep braces and indentation even for short branches while learning.', '<code>if</code> подходит для обычных ветвлений, <code>switch</code> группирует варианты, <code>foreach</code> перебирает значения, а <code>for</code> полезен при необходимости индекса. Пока учишься, сохраняй фигурные скобки и отступы даже в коротких ветках.'),
      practice: L('Classify five scores with a switch expression, then print only valid scores with foreach.', 'Раздели пять оценок через switch expression, затем выведи только корректные оценки через foreach.'),
      checklist: [L('I choose a loop intentionally', 'Осознанно выбираю цикл'), L('I can read a switch expression', 'Могу прочитать switch expression'), L('Every branch has a clear outcome', 'У каждой ветки понятный результат')],
      sources: [{ label: 'Selection statements', url: 'https://learn.microsoft.com/en-us/dotnet/csharp/language-reference/statements/selection-statements' }, { label: 'Iteration statements', url: 'https://learn.microsoft.com/en-us/dotnet/csharp/language-reference/statements/iteration-statements' }]
    },
    {
      id: 'block-csharp-methods-2026',
      title: L('Methods, parameters, return values, and overloads', 'Методы, параметры, return и перегрузка'),
      badge: L('CORE SKILL', 'КЛЮЧЕВОЙ НАВЫК'),
      tip: L('A method contract consists of its name, parameter types, and return type. Make side effects visible in the name.', 'Контракт метода состоит из имени, типов параметров и возвращаемого типа. Отражай побочные действия в названии.'),
      code: 'static decimal CalculateTotal(\n    IEnumerable<decimal> amounts,\n    decimal feePercent = 0m)\n{\n    decimal subtotal = amounts.Sum();\n    return subtotal + subtotal * feePercent / 100m;\n}\n\ndecimal total = CalculateTotal([120m, 80m], feePercent: 5m);',
      explain: L('<code>return</code> gives the caller a result; <code>void</code> means no result. Optional and named arguments can improve readability. Avoid <code>ref</code> and <code>out</code> unless the API truly needs to change caller-owned variables or return multiple values.', '<code>return</code> отдаёт результат вызывающему коду; <code>void</code> означает отсутствие результата. Необязательные и именованные аргументы улучшают читаемость. Не используй <code>ref</code> и <code>out</code> без реальной необходимости менять переменные вызывающего кода или возвращать несколько значений.'),
      practice: L('Write ValidateAmount and CalculateTotal methods. Test normal, empty, and negative inputs.', 'Напиши методы ValidateAmount и CalculateTotal. Проверь обычный, пустой и отрицательный ввод.'),
      checklist: [L('The return type matches the result', 'Возвращаемый тип соответствует результату'), L('Method names describe their effect', 'Имена методов описывают действие'), L('Each method has one responsibility', 'У каждого метода одна ответственность')],
      sources: [{ label: 'Methods', url: 'https://learn.microsoft.com/en-us/dotnet/csharp/methods' }]
    },
    {
      id: 'block-csharp-collections-2026',
      title: L('Arrays, List, Dictionary, and collection expressions', 'Массивы, List, Dictionary и collection expressions'),
      badge: L('DATA', 'ДАННЫЕ'),
      tip: L('Use arrays for fixed-size data, List<T> for a changing ordered collection, and Dictionary<TKey,TValue> for lookup by key.', 'Используй массив для фиксированного размера, List<T> для изменяемой упорядоченной коллекции и Dictionary<TKey,TValue> для поиска по ключу.'),
      code: 'var expenses = new List<decimal> { 120m, 80m };\nexpenses.Add(450m);\nexpenses.Remove(80m);\n\nvar categoryTotals = new Dictionary<string, decimal>\n{\n    ["Food"] = 450m,\n    ["Transport"] = 120m\n};\n\nforeach (var pair in categoryTotals)\n{\n    Console.WriteLine($"{pair.Key}: {pair.Value}");\n}',
      explain: L('Generic collection types preserve element types at compile time. Check a dictionary key with <code>TryGetValue</code> when absence is normal. Do not change a list structurally inside its foreach loop; filter into a new collection or iterate safely.', 'Generic-коллекции сохраняют тип элементов при компиляции. Используй <code>TryGetValue</code>, если отсутствие ключа ожидаемо. Не меняй структуру списка внутри foreach: отфильтруй новую коллекцию или перебирай безопасным способом.'),
      practice: L('Store five transactions, remove one by id, and build totals by category in a dictionary.', 'Сохрани пять операций, удали одну по id и собери суммы по категориям в Dictionary.'),
      checklist: [L('I choose the right collection', 'Выбираю подходящую коллекцию'), L('I keep element types explicit', 'Сохраняю явные типы элементов'), L('I handle missing dictionary keys', 'Обрабатываю отсутствующие ключи словаря')],
      sources: [{ label: 'Collections', url: 'https://learn.microsoft.com/en-us/dotnet/csharp/language-reference/builtin-types/collections' }, { label: 'Dictionary', url: 'https://learn.microsoft.com/en-us/dotnet/api/system.collections.generic.dictionary-2' }]
    },
    {
      id: 'block-csharp-modeling-2026',
      title: L('Classes, records, interfaces, and composition', 'Классы, records, интерфейсы и композиция'),
      badge: L('MODELING', 'МОДЕЛИРОВАНИЕ'),
      tip: L('Records fit value-like data; classes fit objects with identity and behavior. Interfaces describe a capability, not a storage box for every method.', 'Records подходят данным-значениям, классы — объектам с идентичностью и поведением. Интерфейс описывает возможность, а не служит контейнером для любых методов.'),
      code: 'public record Transaction(Guid Id, string Title, decimal Amount);\n\npublic interface ITransactionStore\n{\n    IReadOnlyList<Transaction> GetAll();\n    void Add(Transaction transaction);\n}\n\npublic sealed class BudgetService\n{\n    public decimal Total(IEnumerable<Transaction> items) =>\n        items.Sum(item => item.Amount);\n}',
      explain: L('Encapsulation protects valid state. Constructor parameters make required dependencies visible. Prefer composition: BudgetService works with transactions without inheriting from them. Use an interface at a real boundary such as storage, network, or time.', 'Инкапсуляция защищает корректное состояние. Параметры конструктора показывают обязательные зависимости. Предпочитай композицию: BudgetService работает с операциями, но не наследуется от них. Используй интерфейс на реальной границе — хранилище, сеть или время.'),
      practice: L('Model Transaction and a store interface. Create an in-memory implementation and use it from a service.', 'Опиши Transaction и интерфейс хранилища. Создай реализацию в памяти и используй её из сервиса.'),
      checklist: [L('I distinguish record and class intent', 'Различаю назначение record и class'), L('Dependencies are visible', 'Зависимости видны'), L('I prefer composition over deep inheritance', 'Предпочитаю композицию глубокому наследованию')],
      sources: [{ label: 'Object-oriented programming', url: 'https://learn.microsoft.com/en-us/dotnet/csharp/fundamentals/object-oriented/' }, { label: 'Records', url: 'https://learn.microsoft.com/en-us/dotnet/csharp/fundamentals/types/records' }, { label: 'Interfaces', url: 'https://learn.microsoft.com/en-us/dotnet/csharp/fundamentals/types/interfaces' }]
    },
    {
      id: 'block-csharp-linq-2026',
      title: L('LINQ: filter, transform, order, and aggregate', 'LINQ: фильтрация, преобразование, сортировка и агрегация'),
      badge: 'LINQ',
      tip: L('LINQ builds queries over collections. Remember that many queries execute later, when you enumerate them.', 'LINQ строит запросы к коллекциям. Помни, что многие запросы выполняются позже — при переборе результата.'),
      code: 'var expensiveTitles = transactions\n    .Where(item => item.Amount >= 500m)\n    .OrderByDescending(item => item.Amount)\n    .Select(item => item.Title)\n    .ToList();\n\ndecimal total = transactions.Sum(item => item.Amount);',
      explain: L('<code>Where</code> filters, <code>Select</code> transforms, ordering methods sort, and aggregate methods calculate one result. <code>ToList()</code> materializes a query now. Keep query lambdas free of side effects so the result does not depend on how often it is enumerated.', '<code>Where</code> фильтрует, <code>Select</code> преобразует, методы Order сортируют, а агрегаты считают один результат. <code>ToList()</code> выполняет запрос сейчас. Не добавляй побочные действия в lambda запроса, чтобы результат не зависел от числа переборов.'),
      practice: L('Filter transactions by category, sort by amount, project to a summary string, and calculate an average.', 'Отфильтруй операции по категории, отсортируй по сумме, преобразуй в строку-описание и посчитай среднее.'),
      checklist: [L('I distinguish Where and Select', 'Различаю Where и Select'), L('I understand deferred execution', 'Понимаю отложенное выполнение'), L('I materialize only when needed', 'Материализую запрос только при необходимости')],
      sources: [{ label: 'LINQ overview', url: 'https://learn.microsoft.com/en-us/dotnet/csharp/linq/' }, { label: 'Write LINQ queries', url: 'https://learn.microsoft.com/en-us/dotnet/csharp/linq/get-started/write-linq-queries' }]
    },
    {
      id: 'block-csharp-errors-2026',
      title: L('Exceptions, validation, and debugging', 'Исключения, валидация и отладка'),
      badge: L('RELIABILITY', 'НАДЁЖНОСТЬ'),
      tip: L('Exceptions represent exceptional failure, not ordinary branching. Catch a specific type where recovery is possible.', 'Исключения описывают ошибочную ситуацию, а не обычное ветвление. Лови конкретный тип там, где возможно восстановление.'),
      code: 'static decimal ParseAmount(string rawValue)\n{\n    if (!decimal.TryParse(rawValue, out decimal amount))\n    {\n        throw new ArgumentException("Amount must be a number");\n    }\n\n    if (amount <= 0)\n    {\n        throw new ArgumentOutOfRangeException(nameof(rawValue));\n    }\n\n    return amount;\n}',
      explain: L('Use TryParse for expected invalid user input. Throw an exception when a method cannot keep its contract. Preserve the stack trace with <code>throw;</code>, not <code>throw error;</code>, and do not swallow an exception without logging or a user-facing recovery path.', 'Используй TryParse для ожидаемого неверного ввода. Бросай исключение, если метод не может выполнить контракт. Сохраняй stack trace через <code>throw;</code>, а не <code>throw error;</code>, и не скрывай исключение без логирования или понятного восстановления.'),
      practice: L('Validate title, amount, and category. Test invalid text, zero, a negative amount, and a missing item.', 'Проверь название, сумму и категорию. Протестируй неверный текст, ноль, отрицательную сумму и отсутствующий объект.'),
      checklist: [L('I separate validation from unexpected failure', 'Отделяю валидацию от неожиданной ошибки'), L('I catch specific exception types', 'Ловлю конкретные типы исключений'), L('I can read a stack trace', 'Умею читать stack trace')],
      sources: [{ label: 'Exceptions', url: 'https://learn.microsoft.com/en-us/dotnet/csharp/fundamentals/exceptions/' }, { label: 'Debugger', url: 'https://learn.microsoft.com/en-us/dotnet/core/tutorials/debugging-with-visual-studio-code' }]
    },
    {
      id: 'block-csharp-files-json-2026',
      title: L('Files, JSON, and safe persistence', 'Файлы, JSON и безопасное хранение'),
      badge: L('STORAGE', 'ХРАНЕНИЕ'),
      tip: L('Serialize data models, not services or UI objects. Treat every restored file as untrusted input.', 'Сериализуй модели данных, а не сервисы или UI-объекты. Считай любой восстановленный файл недоверенным вводом.'),
      code: 'using System.Text.Json;\n\nvar options = new JsonSerializerOptions { WriteIndented = true };\nstring json = JsonSerializer.Serialize(transactions, options);\nawait File.WriteAllTextAsync("transactions.json", json);\n\nstring restoredJson = await File.ReadAllTextAsync("transactions.json");\nvar restored = JsonSerializer.Deserialize<List<Transaction>>(restoredJson)\n    ?? new List<Transaction>();',
      explain: L('<code>System.Text.Json</code> is the built-in JSON library for modern .NET. Use asynchronous file APIs when the operation belongs to an async flow. Handle missing files and malformed JSON, validate restored models, and avoid writing secrets into ordinary JSON files.', '<code>System.Text.Json</code> — встроенная JSON-библиотека современного .NET. Используй асинхронные файловые API внутри async-потока. Обрабатывай отсутствие файла и повреждённый JSON, проверяй восстановленные модели и не записывай секреты в обычный JSON.'),
      practice: L('Persist transactions, reload them on startup, and show a controlled error for malformed JSON.', 'Сохрани операции, восстанови их при запуске и покажи контролируемую ошибку для повреждённого JSON.'),
      checklist: [L('I serialize data models only', 'Сериализую только модели данных'), L('I handle missing and malformed files', 'Обрабатываю отсутствующие и повреждённые файлы'), L('I validate restored data', 'Проверяю восстановленные данные')],
      sources: [{ label: 'System.Text.Json', url: 'https://learn.microsoft.com/en-us/dotnet/standard/serialization/system-text-json/overview' }, { label: 'File and Stream I/O', url: 'https://learn.microsoft.com/en-us/dotnet/standard/io/' }]
    },
    {
      id: 'block-csharp-async-2026',
      title: L('async, await, Task, and HTTP requests', 'async, await, Task и HTTP-запросы'),
      badge: L('ASYNC', 'АСИНХРОННОСТЬ'),
      tip: L('For I/O work, await instead of blocking. Async does not automatically make CPU-heavy code faster.', 'Для операций ввода-вывода используй await вместо блокировки. Async сам по себе не ускоряет тяжёлые вычисления.'),
      code: 'using var client = new HttpClient();\n\nstatic async Task<string> LoadStatusAsync(\n    HttpClient client,\n    CancellationToken cancellationToken)\n{\n    using var response = await client.GetAsync(\n        "https://example.com/status",\n        cancellationToken);\n\n    response.EnsureSuccessStatusCode();\n    return await response.Content.ReadAsStringAsync(cancellationToken);\n}',
      explain: L('<code>Task</code> represents ongoing work and <code>await</code> asynchronously waits for it. Pass CancellationToken through the call chain, handle HTTP failures, and reuse HttpClient through dependency injection in server applications. Avoid <code>.Result</code> and <code>.Wait()</code> in asynchronous code.', '<code>Task</code> представляет выполняющуюся работу, а <code>await</code> асинхронно ждёт её. Передавай CancellationToken по цепочке, обрабатывай HTTP-ошибки и переиспользуй HttpClient через dependency injection в серверных приложениях. Не применяй <code>.Result</code> и <code>.Wait()</code> в async-коде.'),
      practice: L('Load JSON from a public test API with cancellation, success output, and a controlled error message.', 'Получи JSON из публичного тестового API с отменой, успешным выводом и контролируемой ошибкой.'),
      checklist: [L('I await asynchronous I/O', 'Использую await для асинхронного I/O'), L('I pass cancellation where useful', 'Передаю отмену там, где она полезна'), L('I do not block on Task', 'Не блокирую выполнение через Task')],
      sources: [{ label: 'Async and await', url: 'https://learn.microsoft.com/en-us/dotnet/csharp/asynchronous-programming/' }, { label: 'HTTP requests', url: 'https://learn.microsoft.com/en-us/dotnet/fundamentals/networking/http/httpclient' }]
    },
    {
      id: 'block-csharp-testing-2026',
      title: L('Unit tests and dependency boundaries', 'Модульные тесты и границы зависимостей'),
      badge: L('TESTING', 'ТЕСТЫ'),
      tip: L('Test business behavior without a real network, clock, or database. Put those dependencies behind replaceable boundaries.', 'Тестируй бизнес-поведение без реальной сети, часов и базы. Помещай такие зависимости за заменяемыми границами.'),
      code: '[TestClass]\npublic sealed class BudgetServiceTests\n{\n    [TestMethod]\n    public void Total_SumsAllTransactions()\n    {\n        var service = new BudgetService();\n        Transaction[] items =\n        [\n            new(Guid.NewGuid(), "Food", 120m),\n            new(Guid.NewGuid(), "Bus", 80m)\n        ];\n\n        Assert.AreEqual(200m, service.Total(items));\n    }\n}',
      explain: L('Arrange the input, act once, and assert the observable result. Keep tests deterministic and name them after the expected behavior. Integration tests are still needed for real database and HTTP wiring, but unit tests give fast feedback on isolated rules.', 'Подготовь данные, выполни одно действие и проверь наблюдаемый результат. Делай тесты детерминированными и называй по ожидаемому поведению. Для реальной базы и HTTP всё равно нужны интеграционные тесты, но unit-тесты быстро проверяют отдельные правила.'),
      practice: L('Create an MSTest project and test total, empty input, and invalid transaction creation.', 'Создай проект MSTest и проверь сумму, пустой ввод и создание неверной операции.'),
      checklist: [L('Tests are deterministic', 'Тесты детерминированы'), L('Names describe expected behavior', 'Имена описывают ожидаемое поведение'), L('External dependencies are replaceable', 'Внешние зависимости можно заменить')],
      sources: [{ label: 'Unit testing C#', url: 'https://learn.microsoft.com/en-us/dotnet/core/testing/unit-testing-csharp-with-mstest' }, { label: 'dotnet test', url: 'https://learn.microsoft.com/en-us/dotnet/core/tools/dotnet-test' }]
    },
    {
      id: 'block-csharp-aspnet-2026',
      title: L('ASP.NET Core: Minimal API and dependency injection', 'ASP.NET Core: Minimal API и dependency injection'),
      badge: L('BACKEND', 'BACKEND'),
      tip: L('HTTP handlers translate requests and responses. Keep business logic in services and let the built-in container provide dependencies.', 'HTTP-обработчики переводят запросы в ответы. Держи бизнес-логику в сервисах, а зависимости получай через встроенный контейнер.'),
      code: 'var builder = WebApplication.CreateBuilder(args);\nbuilder.Services.AddSingleton<TransactionStore>();\n\nvar app = builder.Build();\n\napp.MapGet("/transactions", (TransactionStore store) =>\n    Results.Ok(store.GetAll()));\n\napp.MapPost("/transactions", (CreateTransaction request, TransactionStore store) =>\n{\n    if (request.Amount <= 0) return Results.BadRequest();\n    return Results.Created("/transactions", store.Add(request));\n});\n\napp.Run();',
      explain: L('ASP.NET Core supplies configuration, logging, routing, middleware, and dependency injection. Minimal API is a compact entry point, not a reason to put the whole application into Program.cs. Validate request models, return appropriate status codes, and move storage behind a service boundary.', 'ASP.NET Core предоставляет конфигурацию, логирование, маршрутизацию, middleware и dependency injection. Minimal API — компактная точка входа, но не причина хранить всё приложение в Program.cs. Проверяй request-модели, возвращай подходящие статусы и выноси хранилище за границу сервиса.'),
      practice: L('Build create, list, update, and delete endpoints. Add validation, one service, structured logging, and an integration test.', 'Собери endpoints создания, списка, изменения и удаления. Добавь валидацию, один сервис, структурированное логирование и интеграционный тест.'),
      checklist: [L('Handlers stay thin', 'Обработчики остаются тонкими'), L('Dependencies come from the container', 'Зависимости приходят из контейнера'), L('HTTP statuses match the result', 'HTTP-статусы соответствуют результату')],
      sources: [{ label: 'ASP.NET Core fundamentals', url: 'https://learn.microsoft.com/en-us/aspnet/core/fundamentals/' }, { label: 'Minimal APIs', url: 'https://learn.microsoft.com/en-us/aspnet/core/fundamentals/minimal-apis/overview' }, { label: 'Dependency injection', url: 'https://learn.microsoft.com/en-us/aspnet/core/fundamentals/dependency-injection' }]
    },
    {
      id: 'block-csharp-project-2026',
      title: L('Final project: maintainable transaction API', 'Итоговый проект: поддерживаемый API операций'),
      badge: L('PROJECT', 'ПРОЕКТ'),
      badgeClass: 'must',
      tip: L('A finished project proves more than a collection of syntax exercises. Define acceptance criteria before adding architecture layers.', 'Законченный проект показывает больше, чем набор упражнений по синтаксису. Сначала определи критерии готовности, потом добавляй слои архитектуры.'),
      code: 'src/\n  ExpenseTracker.Api/            # HTTP and configuration\n  ExpenseTracker.Application/    # use cases and contracts\n  ExpenseTracker.Domain/         # models and rules\ntests/\n  ExpenseTracker.Tests/\n\n# Required flow\nPOST /transactions\nGET  /transactions?category=Food\nPUT  /transactions/{id}\nDELETE /transactions/{id}',
      explain: L('Start with one working vertical slice: request, validation, rule, storage, and response. Add a database only after the in-memory flow works. The repository should contain setup steps, configuration guidance, tests, and examples of successful and failing requests. Do not create layers that contain no real responsibility.', 'Начни с одного работающего вертикального сценария: запрос, валидация, правило, хранилище и ответ. Подключай базу только после рабочей версии в памяти. В репозитории должны быть запуск, настройка, тесты и примеры успешных и ошибочных запросов. Не создавай слои без реальной ответственности.'),
      practice: L('Complete the API, test its main and error flows, document setup, and explain why each project exists.', 'Заверши API, протестируй основной и ошибочные сценарии, опиши запуск и объясни назначение каждого проекта.'),
      checklist: [L('The main flow works end to end', 'Основной сценарий работает целиком'), L('Tests cover rules and HTTP behavior', 'Тесты покрывают правила и HTTP-поведение'), L('README lets another person run it', 'README позволяет другому человеку запустить проект')],
      sources: [{ label: '.NET application architecture', url: 'https://learn.microsoft.com/en-us/dotnet/architecture/modern-web-apps-azure/' }, { label: 'ASP.NET Core integration tests', url: 'https://learn.microsoft.com/en-us/aspnet/core/test/integration-tests' }]
    }
  ];

  const electronLessons = [
    {
      id: 'block-electron-start-2026',
      title: L('Electron: turn a web interface into a desktop app', 'Electron: превращаем веб-интерфейс в desktop-приложение'),
      badge: L('START', 'СТАРТ'),
      tip: L('Start Electron after solid JavaScript fundamentals. TypeScript and React are useful, but a first application can use plain HTML, CSS, and JavaScript.', 'Начинай Electron после уверенной базы JavaScript. TypeScript и React полезны, но первое приложение можно собрать на обычных HTML, CSS и JavaScript.'),
      code: 'npm init electron-app@latest nightwave-desktop\ncd nightwave-desktop\nnpm start\n\n# Main files\nmain.js       # application and windows\npreload.js    # safe bridge\nrenderer.js   # interface logic\nindex.html    # interface',
      explain: L('Electron combines Chromium for the interface and Node.js for desktop capabilities. It does not convert a website into an app automatically: you still design the application lifecycle, permissions, storage, and installer. Keep the first project small and local.', 'Electron объединяет Chromium для интерфейса и Node.js для desktop-возможностей. Он не превращает сайт в программу автоматически: жизненный цикл, разрешения, хранение и установщик всё равно нужно продумать. Первый проект делай небольшим и локальным.'),
      practice: L('Create a project, start it, change the window title and one interface element, then restart it from the terminal.', 'Создай проект, запусти его, измени заголовок окна и один элемент интерфейса, затем повторно запусти программу из терминала.'),
      checklist: [L('I can start an Electron project', 'Могу запустить Electron-проект'), L('I know which files belong to the app shell and UI', 'Понимаю, где оболочка приложения, а где интерфейс'), L('I can explain why Electron uses web technologies', 'Могу объяснить, зачем Electron использует веб-технологии')],
      sources: [{ label: 'Electron tutorial', url: 'https://www.electronjs.org/docs/latest/tutorial/tutorial-prerequisites' }, { label: 'Build your first app', url: 'https://www.electronjs.org/docs/latest/tutorial/tutorial-first-app' }]
    },
    {
      id: 'block-electron-process-model-2026',
      title: L('Main, renderer, and preload processes', 'Процессы main, renderer и preload'),
      badge: L('ARCHITECTURE', 'АРХИТЕКТУРА'),
      tip: L('Do not treat every Electron file as ordinary browser JavaScript. Each process has a different responsibility and level of access.', 'Не воспринимай все файлы Electron как обычный браузерный JavaScript. У каждого процесса своя ответственность и уровень доступа.'),
      code: '// main.js\nconst path = require("node:path");\nconst { app, BrowserWindow } = require("electron");\n\napp.whenReady().then(() => {\n  const window = new BrowserWindow({\n    webPreferences: { preload: path.join(__dirname, "preload.js") }\n  });\n  window.loadFile("index.html");\n});\n\n// renderer.js\ndocument.querySelector("#app").textContent = "Ready";',
      explain: L('The main process controls the application lifecycle and native windows. Each renderer displays web content. A preload script runs before the page and exposes a narrow, controlled API. Keeping these boundaries clear prevents UI code from gaining unnecessary system access.', 'Main-процесс управляет жизненным циклом приложения и нативными окнами. Renderer показывает веб-интерфейс. Preload запускается до страницы и открывает ей узкий контролируемый API. Чёткие границы не дают UI-коду лишний доступ к системе.'),
      practice: L('Write one sentence describing the responsibility of each process, then move a DOM operation out of main and into renderer.', 'Одним предложением опиши ответственность каждого процесса, затем перенеси DOM-операцию из main в renderer.'),
      checklist: [L('Main owns application lifecycle', 'Main управляет жизненным циклом'), L('Renderer owns the DOM interface', 'Renderer управляет DOM-интерфейсом'), L('Preload exposes a limited bridge', 'Preload открывает ограниченный мост')],
      sources: [{ label: 'Process model', url: 'https://www.electronjs.org/docs/latest/tutorial/process-model' }]
    },
    {
      id: 'block-electron-window-lifecycle-2026',
      title: L('BrowserWindow and application lifecycle', 'BrowserWindow и жизненный цикл приложения'),
      badge: L('WINDOWS', 'ОКНА'),
      tip: L('Create windows only after app.whenReady(). Handle activation and closing behavior intentionally because operating systems differ.', 'Создавай окна только после app.whenReady(). Явно обрабатывай повторную активацию и закрытие: поведение операционных систем отличается.'),
      code: 'const { app, BrowserWindow } = require("electron");\n\nfunction createWindow() {\n  const mainWindow = new BrowserWindow({\n    width: 1100,\n    height: 760,\n    minWidth: 720,\n    minHeight: 520\n  });\n  mainWindow.loadFile("index.html");\n}\n\napp.whenReady().then(createWindow);\n\napp.on("window-all-closed", () => {\n  if (process.platform !== "darwin") app.quit();\n});',
      explain: L('<code>BrowserWindow</code> is a native window that hosts web content. Give it sensible initial and minimum dimensions, restore it on macOS activation, and avoid keeping unnecessary hidden windows alive. Window events are application state, not DOM events.', '<code>BrowserWindow</code> — нативное окно с веб-содержимым. Задай разумные начальные и минимальные размеры, восстанавливай окно при активации macOS и не оставляй ненужные скрытые окна. События окна относятся к приложению, а не к DOM.'),
      practice: L('Create one resizable window, set minimum dimensions, and verify closing behavior. Add a second settings window only after the first works.', 'Создай одно изменяемое окно, задай минимальные размеры и проверь закрытие. Добавляй отдельное окно настроек только после рабочего основного окна.'),
      checklist: [L('I create windows after ready', 'Создаю окна после ready'), L('I understand window-all-closed', 'Понимаю window-all-closed'), L('Window dimensions do not break the UI', 'Размеры окна не ломают интерфейс')],
      sources: [{ label: 'BrowserWindow', url: 'https://www.electronjs.org/docs/latest/api/browser-window' }, { label: 'Application lifecycle', url: 'https://www.electronjs.org/docs/latest/tutorial/tutorial-first-app#manage-your-windows-lifecycle' }]
    },
    {
      id: 'block-electron-preload-security-2026',
      title: L('Secure preload and contextBridge', 'Безопасный preload и contextBridge'),
      badge: L('SECURITY', 'БЕЗОПАСНОСТЬ'),
      badgeClass: 'must',
      tip: L('Never expose require, ipcRenderer, or the whole filesystem API to the page. Expose one small function for one allowed action.', 'Никогда не отдавай странице require, ipcRenderer или весь файловый API. Открывай одну небольшую функцию для одного разрешённого действия.'),
      code: '// preload.js\nconst { contextBridge, ipcRenderer } = require("electron");\n\ncontextBridge.exposeInMainWorld("desktop", {\n  savePlaylist: playlist => ipcRenderer.invoke("playlist:save", playlist)\n});\n\n// renderer.js\nawait window.desktop.savePlaylist(tracks);',
      explain: L('Context isolation separates the loaded page from Electron internals. The preload bridge should validate its public shape and expose purpose-specific methods. Keep <code>nodeIntegration</code> disabled, keep sandboxing enabled, and define a restrictive Content Security Policy.', 'Context isolation отделяет загруженную страницу от внутренностей Electron. Preload-мост должен открывать только целевые методы с понятным контрактом. Не включай <code>nodeIntegration</code>, сохраняй sandbox и настрой строгую Content Security Policy.'),
      practice: L('Expose a getAppVersion method through contextBridge. Confirm that require is unavailable from DevTools in the renderer.', 'Открой через contextBridge метод getAppVersion. Проверь в DevTools renderer, что require недоступен.'),
      checklist: [L('Context isolation stays enabled', 'Context isolation остаётся включён'), L('Node integration stays disabled', 'Node integration остаётся выключен'), L('The bridge exposes only specific methods', 'Мост открывает только конкретные методы')],
      sources: [{ label: 'Context isolation', url: 'https://www.electronjs.org/docs/latest/tutorial/context-isolation' }, { label: 'Security checklist', url: 'https://www.electronjs.org/docs/latest/tutorial/security' }]
    },
    {
      id: 'block-electron-ipc-2026',
      title: L('IPC: connect the interface to desktop capabilities', 'IPC: связываем интерфейс с desktop-возможностями'),
      badge: L('COMMUNICATION', 'СВЯЗЬ'),
      tip: L('Use invoke and handle when the renderer expects one result. Name channels by domain action and validate every argument in main.', 'Используй invoke и handle, когда renderer ждёт один результат. Называй каналы по действию предметной области и проверяй каждый аргумент в main.'),
      code: '// main.js\nipcMain.handle("playlist:save", async (event, playlist) => {\n  if (!Array.isArray(playlist)) throw new TypeError("Invalid playlist");\n  return savePlaylist(playlist);\n});\n\n// preload.js\nsavePlaylist: playlist => ipcRenderer.invoke("playlist:save", playlist)\n\n// renderer.js\nconst result = await window.desktop.savePlaylist(tracks);',
      explain: L('IPC crosses a trust boundary. The renderer requests an operation, preload exposes the approved call, and main validates and performs it. Do not pass DOM objects, functions, or unrestricted channel names. Return serializable data and handle rejected promises in the interface.', 'IPC пересекает границу доверия. Renderer запрашивает операцию, preload открывает разрешённый вызов, а main проверяет данные и выполняет действие. Не передавай DOM-объекты, функции и произвольные имена каналов. Возвращай сериализуемые данные и обрабатывай отклонённые Promise в интерфейсе.'),
      practice: L('Build a renderer-to-main request that returns the application version. Add invalid input and show a controlled interface error.', 'Собери запрос из renderer в main, который возвращает версию приложения. Передай неверные данные и покажи контролируемую ошибку в интерфейсе.'),
      checklist: [L('Every channel has one responsibility', 'У каждого канала одна ответственность'), L('Main validates renderer input', 'Main проверяет ввод renderer'), L('Renderer handles success and failure', 'Renderer обрабатывает успех и ошибку')],
      sources: [{ label: 'Inter-process communication', url: 'https://www.electronjs.org/docs/latest/tutorial/ipc' }, { label: 'ipcMain', url: 'https://www.electronjs.org/docs/latest/api/ipc-main' }]
    },
    {
      id: 'block-electron-files-dialogs-2026',
      title: L('Native dialogs and safe file access', 'Нативные диалоги и безопасная работа с файлами'),
      badge: L('FILES', 'ФАЙЛЫ'),
      tip: L('Let the user choose a path with a native dialog. Read or write it in main, and return only the data the interface needs.', 'Дай пользователю выбрать путь через нативный диалог. Читай и записывай файл в main, а интерфейсу возвращай только нужные данные.'),
      code: 'const { dialog, ipcMain } = require("electron");\nconst { readFile } = require("node:fs/promises");\n\nipcMain.handle("playlist:open", async () => {\n  const result = await dialog.showOpenDialog({\n    properties: ["openFile"],\n    filters: [{ name: "JSON", extensions: ["json"] }]\n  });\n\n  if (result.canceled) return null;\n  return readFile(result.filePaths[0], "utf8");\n});',
      explain: L('Native dialogs provide expected operating-system behavior. Treat selected files as untrusted: restrict extensions where useful, handle cancellation, limit size, parse carefully, and never build a path from unchecked renderer input. Keep filesystem access outside the renderer.', 'Нативные диалоги дают привычное поведение операционной системы. Считай выбранные файлы недоверенными: ограничивай расширения, обрабатывай отмену, проверяй размер, аккуратно разбирай содержимое и не собирай путь из непроверенного ввода renderer. Файловый доступ оставляй вне renderer.'),
      practice: L('Import and export a small playlist JSON file. Handle cancellation, malformed JSON, and an empty playlist.', 'Импортируй и экспортируй небольшой JSON-плейлист. Обработай отмену, повреждённый JSON и пустой плейлист.'),
      checklist: [L('Cancellation is a normal result', 'Отмена считается нормальным результатом'), L('File content is validated', 'Содержимое файла проверяется'), L('Renderer receives no filesystem access', 'Renderer не получает файловый доступ')],
      sources: [{ label: 'dialog', url: 'https://www.electronjs.org/docs/latest/api/dialog' }, { label: 'Node.js file system', url: 'https://nodejs.org/api/fs.html' }]
    },
    {
      id: 'block-electron-menus-shortcuts-2026',
      title: L('Menus, keyboard shortcuts, and tray', 'Меню, горячие клавиши и системный трей'),
      badge: L('DESKTOP UX', 'DESKTOP UX'),
      tip: L('Desktop conventions matter. Put common commands in menus, show their shortcuts, and do not register global shortcuts without a real need.', 'В desktop важны привычные соглашения. Помещай частые команды в меню, показывай сочетания клавиш и не регистрируй глобальные shortcut без необходимости.'),
      code: 'const { Menu } = require("electron");\n\nconst menu = Menu.buildFromTemplate([\n  {\n    label: "File",\n    submenu: [\n      { label: "Open", accelerator: "CmdOrCtrl+O", click: openPlaylist },\n      { role: "quit" }\n    ]\n  },\n  { role: "viewMenu" }\n]);\n\nMenu.setApplicationMenu(menu);',
      explain: L('Menu roles provide native behavior such as copy, paste, reload, and quit. Accelerators make commands discoverable and efficient. A tray icon is useful only for applications that genuinely continue in the background; otherwise closing should close the program.', 'Роли меню дают нативное поведение для копирования, вставки, перезагрузки и выхода. Accelerators делают команды заметными и быстрыми. Иконка в трее нужна только приложению, которое действительно работает в фоне; иначе закрытие должно завершать программу.'),
      practice: L('Add File and View menus with open, close, DevTools, and zoom commands. Explain whether your application needs a tray icon.', 'Добавь меню File и View с открытием, закрытием, DevTools и масштабом. Объясни, нужен ли твоему приложению системный трей.'),
      checklist: [L('Commands use native roles where possible', 'Команды используют нативные роли, где возможно'), L('Shortcuts are visible in menus', 'Сочетания видны в меню'), L('Background behavior is intentional', 'Фоновая работа сделана осознанно')],
      sources: [{ label: 'Keyboard shortcuts', url: 'https://www.electronjs.org/docs/latest/tutorial/keyboard-shortcuts' }, { label: 'Menu', url: 'https://www.electronjs.org/docs/latest/api/menu' }, { label: 'Tray', url: 'https://www.electronjs.org/docs/latest/api/tray' }]
    },
    {
      id: 'block-electron-storage-2026',
      title: L('Application state and userData storage', 'Состояние приложения и хранилище userData'),
      badge: L('STATE', 'СОСТОЯНИЕ'),
      tip: L('Separate temporary UI state from persistent application settings. Store user data in the operating-system location returned by Electron.', 'Отделяй временное состояние интерфейса от постоянных настроек приложения. Пользовательские данные храни в системной папке, которую возвращает Electron.'),
      code: 'const { app } = require("electron");\nconst path = require("node:path");\nconst { writeFile } = require("node:fs/promises");\n\nconst settingsPath = path.join(app.getPath("userData"), "settings.json");\n\nasync function saveSettings(settings) {\n  const json = JSON.stringify(settings, null, 2);\n  await writeFile(settingsPath, json, "utf8");\n}',
      explain: L('<code>app.getPath("userData")</code> points to the conventional per-user configuration directory. Keep a versioned, validated data shape and write changes deliberately instead of on every animation frame. Do not store passwords or API tokens in plain JSON.', '<code>app.getPath("userData")</code> указывает на стандартную папку настроек текущего пользователя. Используй версионируемую и проверяемую структуру данных, сохраняй осознанно, а не на каждом кадре анимации. Не храни пароли и API-токены в обычном JSON.'),
      practice: L('Persist volume, window size, and the selected track. Restore defaults when the file is missing or invalid.', 'Сохрани громкость, размер окна и выбранный трек. Восстанови значения по умолчанию, если файл отсутствует или повреждён.'),
      checklist: [L('Persistent and temporary state are separate', 'Постоянное и временное состояние разделены'), L('Settings use the userData path', 'Настройки используют путь userData'), L('Invalid data falls back safely', 'При неверных данных есть безопасный fallback')],
      sources: [{ label: 'app.getPath', url: 'https://www.electronjs.org/docs/latest/api/app#appgetpathname' }, { label: 'safeStorage', url: 'https://www.electronjs.org/docs/latest/api/safe-storage' }]
    },
    {
      id: 'block-electron-os-integration-2026',
      title: L('Notifications, clipboard, and operating-system integration', 'Уведомления, буфер обмена и интеграция с системой'),
      badge: L('NATIVE API', 'NATIVE API'),
      tip: L('Use native features to improve a real workflow, not to make the app look more complicated. Ask for the minimum capability required.', 'Используй нативные возможности для реального сценария, а не ради сложности. Запрашивай только минимально необходимую возможность.'),
      code: 'const { Notification, clipboard } = require("electron");\n\nfunction copyTrackLink(url) {\n  clipboard.writeText(url);\n  new Notification({\n    title: "Nightwave",\n    body: "Track link copied"\n  }).show();\n}',
      explain: L('Electron exposes selected native APIs from the main process. Notifications should be useful and infrequent, clipboard content must be explicit, and external links must be validated before opening. Check platform support and provide a fallback when behavior differs.', 'Electron открывает выбранные системные API из main-процесса. Уведомления должны быть полезными и редкими, содержимое буфера — явным, а внешние ссылки нужно проверять перед открытием. Учитывай поддержку платформ и делай fallback для различий.'),
      practice: L('Add a Copy current track command and one notification after a completed export. Do not notify on every play or pause.', 'Добавь команду копирования текущего трека и одно уведомление после успешного экспорта. Не показывай уведомления при каждом play или pause.'),
      checklist: [L('Native features support a user task', 'Нативные функции помогают задаче пользователя'), L('External values are validated', 'Внешние значения проверяются'), L('Platform differences have a fallback', 'Для различий платформ есть fallback')],
      sources: [{ label: 'Notifications', url: 'https://www.electronjs.org/docs/latest/tutorial/notifications' }, { label: 'clipboard', url: 'https://www.electronjs.org/docs/latest/api/clipboard' }, { label: 'shell', url: 'https://www.electronjs.org/docs/latest/api/shell' }]
    },
    {
      id: 'block-electron-debug-performance-2026',
      title: L('Debugging, performance, and memory', 'Отладка, производительность и память'),
      badge: L('QUALITY', 'КАЧЕСТВО'),
      tip: L('Measure before optimizing. A desktop wrapper does not remove expensive DOM work, large media, leaking listeners, or unnecessary renderer processes.', 'Сначала измеряй, потом оптимизируй. Desktop-оболочка не убирает тяжёлый DOM, большие медиафайлы, утечки обработчиков и лишние renderer-процессы.'),
      code: '// main.js\nmainWindow.webContents.openDevTools({ mode: "detach" });\n\nmainWindow.webContents.on("render-process-gone", (event, details) => {\n  console.error("Renderer stopped", details.reason);\n});\n\n// renderer.js\nperformance.mark("playlist:start");\nrenderPlaylist(tracks);\nperformance.mark("playlist:end");\nperformance.measure("playlist", "playlist:start", "playlist:end");',
      explain: L('Use Chromium DevTools for renderer performance and the Node inspector for main. Avoid blocking the main process, creating many renderer processes, loading unused code, or doing synchronous filesystem work in interaction paths. Remove listeners and timers when their owner is destroyed.', 'Для renderer используй Chromium DevTools, для main — Node inspector. Не блокируй main-процесс, не создавай лишние renderer-процессы, не загружай ненужный код и не выполняй синхронную работу с файлами во время взаимодействия. Удаляй обработчики и таймеры вместе с их владельцем.'),
      practice: L('Profile playlist rendering, find one measurable bottleneck, fix it, and record before-and-after evidence. Check that reopening a window does not duplicate listeners.', 'Измерь рендер плейлиста, найди одно подтверждённое узкое место, исправь и запиши показатели до и после. Проверь, что повторное открытие окна не дублирует обработчики.'),
      checklist: [L('I profile before changing code', 'Измеряю до изменения кода'), L('Main stays responsive', 'Main остаётся отзывчивым'), L('Windows do not leak listeners or timers', 'Окна не оставляют обработчики и таймеры')],
      sources: [{ label: 'Performance', url: 'https://www.electronjs.org/docs/latest/tutorial/performance' }, { label: 'Debugging the main process', url: 'https://www.electronjs.org/docs/latest/tutorial/debugging-main-process' }]
    },
    {
      id: 'block-electron-packaging-2026',
      title: L('Packaging, installers, signing, and updates', 'Сборка, установщик, подпись и обновления'),
      badge: L('DELIVERY', 'ДОСТАВКА'),
      tip: L('A folder that runs with npm start is not a finished desktop release. Test the packaged artifact on a clean user account.', 'Папка, которая запускается через npm start, ещё не готовый desktop-релиз. Проверяй собранное приложение на чистом пользовательском профиле.'),
      code: '# Package the application\nnpm run package\n\n# Create distributables such as an installer\nnpm run make\n\n# Before publishing\nnpm test\nnpm run lint\n\n# Verify\n# - launch and uninstall\n# - saved settings\n# - media and icons\n# - upgrade from the previous version',
      explain: L('Electron Forge can package the application and create platform-specific distributables. Production distribution also involves code signing, versioning, release notes, and update strategy. Do not promise silent automatic updates until you have tested the complete release path.', 'Electron Forge упаковывает приложение и создаёт установщики для платформ. Для реального распространения также нужны подпись кода, версии, release notes и стратегия обновлений. Не обещай автоматические обновления, пока не проверишь весь путь релиза.'),
      practice: L('Create a Windows distributable, install it, run it without the development folder, verify persistence, and uninstall it.', 'Собери установщик для Windows, установи программу, запусти без папки разработки, проверь сохранение данных и удали её.'),
      checklist: [L('The packaged app launches independently', 'Собранное приложение запускается самостоятельно'), L('Version and icons are correct', 'Версия и иконки указаны правильно'), L('Install, update, and uninstall paths are tested', 'Установка, обновление и удаление проверены')],
      sources: [{ label: 'Packaging tutorial', url: 'https://www.electronjs.org/docs/latest/tutorial/tutorial-packaging' }, { label: 'Electron Forge', url: 'https://www.electronforge.io/' }, { label: 'Updating applications', url: 'https://www.electronjs.org/docs/latest/tutorial/updates' }]
    },
    {
      id: 'block-electron-desktop-project-2026',
      title: L('Final project: Nightwave Desktop', 'Итоговый проект: Nightwave Desktop'),
      badge: L('PROJECT', 'ПРОЕКТ'),
      badgeClass: 'must',
      tip: L('Reuse the player you already understand, but redesign its boundaries for desktop. Do not copy every web file into main.js.', 'Используй плеер, который уже понимаешь, но заново продумай его границы для desktop. Не переноси все веб-файлы в main.js.'),
      code: 'src/\n  main/\n    main.js          # lifecycle, windows, files\n    playlist-store.js\n  preload/\n    preload.js       # narrow window.desktop API\n  renderer/\n    index.html\n    style.css\n    player.js        # DOM and audio UI\n\nAcceptance criteria:\n- play, pause, seek, volume, next, previous\n- import and export a playlist\n- restore volume and selected track\n- secure preload bridge\n- packaged Windows installer',
      explain: L('Keep playback and DOM updates in renderer, privileged file operations in main, and the approved contract in preload. Deliver one complete vertical flow before adding tray controls or automatic updates. Document setup, architecture, security decisions, and packaging commands.', 'Оставь воспроизведение и DOM-обновления в renderer, привилегированные файловые операции — в main, а разрешённый контракт — в preload. Заверши один полный сценарий до добавления управления из трея и автообновлений. Опиши запуск, архитектуру, решения по безопасности и команды сборки.'),
      practice: L('Build and package Nightwave Desktop. Ask another person to install it, import a playlist, restart it, and explain any confusing step they encountered.', 'Собери и упакуй Nightwave Desktop. Попроси другого человека установить его, импортировать плейлист, перезапустить и отметить каждый непонятный шаг.'),
      checklist: [L('Core player flow works after installation', 'Основной сценарий плеера работает после установки'), L('Process responsibilities stay separate', 'Ответственности процессов разделены'), L('README explains setup and architecture', 'README объясняет запуск и архитектуру')],
      sources: [{ label: 'Electron tutorial', url: 'https://www.electronjs.org/docs/latest/tutorial/tutorial-first-app' }, { label: 'Security checklist', url: 'https://www.electronjs.org/docs/latest/tutorial/security' }, { label: 'Packaging tutorial', url: 'https://www.electronjs.org/docs/latest/tutorial/tutorial-packaging' }]
    }
  ];

  addSection('sec-python', 'Python', 'python', pythonLessons);
  addSection('sec-csharp', 'C#', 'csharp', csharpLessons);
  addSection('sec-electron', 'Electron', 'electron', electronLessons);
})();
