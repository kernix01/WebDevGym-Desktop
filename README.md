# WebDevGym Electron

Отдельная desktop-версия WebDevGym для Windows. Приложение упаковывает локальную копию веб-проекта и работает без обязательного подключения к интернету.

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

`test:smoke` на несколько секунд открывает одно Electron-окно, проверяет реальную загрузку приложения и закрывает его. `desktop:pack` создаёт распакованное приложение для проверки. `desktop:build` создаёт Windows-установщик и portable `.exe` в папке `dist-electron`.

Прогресс desktop-версии хранится локально отдельно от браузера. Для переноса данных используйте экспорт и импорт внутри WebDevGym.

## Безопасность

Web-интерфейс работает в изолированном renderer-процессе без Node.js. Локальные файлы отдаются через закрытый протокол `webdevgym://`, системные разрешения запрещены, а внешние HTTP/HTTPS-ссылки открываются в обычном браузере.

## Лицензия

GPL-3.0. Подробности находятся в файле `LICENSE`.
