# TEXT TO 3D

Проект для создания 3д моделей по текстовому описанию, [дизайн](https://www.figma.com/file/Y1C6oO74FDBvYNQJS3GgLk/Jazz-XR-Drafts?type=design&node-id=466-81902&mode=design&t=yCRH5ZFcURpip2aP-0 "Ссылка на дизайн")

## Available Scripts

В директории проекта необходимо создать файл .env с содержимым
```
VITE_API_URL=адрес сервера
```
после этого запустить

### `npm start`

Запускает приложение в DEV режиме, для разработки
Open [http://localhost:3000](http://localhost:3000) для просмотра откройте в браузера.

### `npm run build`

Создаст продакшн билд в папке build
для корректной работы необходимо указать переменные окружения 

```
VITE_API_URL=адрес сервера
```

## Для запуска проекта в режиме стенда (выводим ссылку на файлы в виде qr кодов)

 - открыть страницу 
[/setting-stand](https://text-to-3d.sp.dev.mlrnd.ru/setting-stand)