# WebDevGym Desktop

Отдельная desktop-версия WebDevGym для Windows и Linux. Приложение упаковывает локальную копию веб-проекта и работает без обязательного подключения к интернету.

## Desktop Center

- Открытие настоящих папок с диска, недавние проекты и редактор с автосохранением.
- Локальный предпросмотр HTML-проектов и запуск команд или npm-скриптов.
- Диагностика JavaScript, TypeScript, HTML и CSS с панелью проблем и переходом к строке.
- Терминальный вывод, остановка запущенного процесса и быстрый `npm install`.
- Git status, история, создание коммита и отправка изменений.
- До десяти локальных снимков проекта с восстановлением файлов.
- Системные уведомления таймера, сворачивание WebDevGym в трей и `Ctrl+Shift+G` для возврата окна.
- Автоматическая проверка новых релизов на GitHub.

## Скачать для Linux

Актуальные файлы версии **0.17.15** доступны на [странице релизов GitHub](https://github.com/kernix01/WebDevGym-Desktop/releases/latest). Сборки рассчитаны на Linux x86_64 (amd64).

### AppImage — большинство дистрибутивов

Подходит для Fedora, openSUSE, Linux Mint и других x86_64-дистрибутивов. AppImage не нужно устанавливать в систему:

1. [Скачать WebDevGym для Linux (.AppImage)](https://github.com/kernix01/WebDevGym-Desktop/releases/download/v0.17.15/WebDevGym-Linux-0.17.15-x86_64.AppImage).
2. Разрешить запуск и открыть файл:

```bash
chmod +x WebDevGym-Linux-0.17.15-x86_64.AppImage
./WebDevGym-Linux-0.17.15-x86_64.AppImage
```

### Debian, Ubuntu и производные

Скачайте [пакет .deb](https://github.com/kernix01/WebDevGym-Desktop/releases/download/v0.17.15/WebDevGym-Linux-0.17.15-amd64.deb), затем в каталоге загрузок выполните:

```bash
sudo apt install ./WebDevGym-Linux-0.17.15-amd64.deb
```

### Arch Linux, CachyOS и производные

Установить пакет напрямую из GitHub Release можно через `paru`:

```bash
paru -U "https://github.com/kernix01/WebDevGym-Desktop/releases/download/v0.17.15/WebDevGym-Linux-0.17.15-x64.pkg.tar.zst"
```

Либо через pacman:

```bash
sudo pacman -U "https://github.com/kernix01/WebDevGym-Desktop/releases/download/v0.17.15/WebDevGym-Linux-0.17.15-x64.pkg.tar.zst"
```

`yay` и `paru` устанавливают этот файл напрямую, но для автоматического поиска обновлений через AUR потребуется отдельный AUR-пакет. Для ARM64 сейчас Linux-сборок нет.

## Запуск

```powershell
npm install
npm run desktop
```

`npm run desktop:dev` запускает приложение с открытыми DevTools. Их также можно включить клавишей `F12` или сочетанием `Ctrl+Shift+I`.

## Обновление web-части

По умолчанию команда берёт актуальные файлы из соседней папки `D:\GitHub\WebDevGym`:

```powershell
npm run sync:web
```

Другой путь можно передать через переменную окружения:

```powershell
$env:WEBDEVGYM_SOURCE = "D:\путь\к\WebDevGym"
npm run sync:web
```

## Проверка и сборка

```powershell
npm test
npm run test:smoke
npm run desktop:pack
npm run desktop:build
```

`test:smoke` на несколько секунд открывает одно Electron-окно, проверяет реальную загрузку приложения и Desktop Center, затем закрывает его. `desktop:pack` создаёт распакованное приложение для проверки. `desktop:build` создаёт Windows-установщик и portable `.exe` в папке `dist-electron`.

Прогресс desktop-версии хранится локально отдельно от браузера. Для переноса данных используйте экспорт и импорт внутри WebDevGym.

## Безопасность

Web-интерфейс работает в изолированном renderer-процессе без Node.js. Локальные файлы отдаются через закрытый протокол `webdevgym://`, системные разрешения запрещены, а внешние HTTP/HTTPS-ссылки открываются в обычном браузере. Desktop Center работает только с папками, которые пользователь сам выбрал через системный диалог; пути и запросы проверяются в main process.

## Лицензия

GPL-3.0. Подробности находятся в файле `LICENSE`.
