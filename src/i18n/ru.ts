const ru = {
  // Header
  allModels: 'Все модели',
  back: 'Назад',
  goback: 'Вернуться',
  // Generate page errors
  whatToGenerate: 'Что сгенерировать в 3D?',
  prompt: 'Промпт',
  imageToGeneration: 'Генерация по картинке',
  generationSettings: 'Настройки генерации',
  parametersGeneration: 'Параметры генерации',
  errorFileType: 'Разрешены только JPG, JPEG, JPE, PNG, GIF или WEBP',
  errorFileSize: 'Максимальный размер файла — 20 МБ',
  errorMaxLength: 'Максимальная длина запроса 2000 символов',
  errorCensor: 'Сработал фильтр цензуры. Попробуйте перефразировать Ваш запрос.',
  errorCensorImage: 'Сработал фильтр цензуры. Попробуйте перефразировать Ваш запрос или пришлите другое изображение.',
  errorPreviewCreate: 'Ошибка при создании превью',
  errorCreate: 'Ошибка при создании',
  errorNoPreviewId: 'Не удалось получить ID превью',

  // Suggestions
  coffeeCup: 'Кофейная чашка',
  cyberpunkCity: 'Киберпанк-город',
  abstractViolin: 'Абстрактная скрипка из стекла',
  robotPet: 'Робот-питомец',
  futuristicBike: 'Футуристический велосипед',
  levitatingLamp: 'Левитирующая лампа',
  futuristicMotorcycle: 'Футуристичный мотоцикл',
  dutchHouse: 'Один красивый голландский домик',

  // Modes
  standard: 'Обычный',
  standardDesc: 'Быстро получить 3D-модель с базовыми настройками',
  gameDev: 'GameDev',
  gameDevDesc: 'Настроить количество полигонов, LOD, топологию и PBR',
  printing3d: '3D-печать',
  printing3dDesc: 'Оптимизировано для печати на 3D-принтерах',
  inDevelopment: 'В разработке',

  // Preview / Models page
  noModelsYet: 'Вы ещё не создали ни одной модели.',
  noModelsLink: 'Перейдите на главную страницу сервиса и попробуйте что-нибудь сгенерировать',
  myModels: 'Мои модели',
  modelCatalog: 'Каталог моделей',
  noModelsInCatalog: 'Ещё нет моделей',
  openInEditor: 'Открыть в редакторе',

  // Editor / Viewer toolbar
  autoRotate: 'Авто-вращение',
  editModel: 'Отредактируйте модель',
  editModelDesc: 'Опишите как доработать модель. Например: "Добавь шляпу"',
  refine: 'Доработать',
  currentPrompt: 'Текущий запрос',
  generationModel: 'Модель генерации',
  topology: 'Топология',
  triangles: 'Треугольники',
  quads: 'Квадраты',
  polygonCount: 'Количество полигонов',
  auto: 'Авто',
  autoLower: 'авто',
  model: 'Модель',
  lighting: 'Освещение',
  map: 'Карта',
  transform: 'Трансформация',
  position: 'Позиция',
  size: 'Размер',
  rotation: 'Вращение',
  material: 'Материал',
  download: 'Скачать',
  showGrid: 'Показать сетку',
  hideGrid: 'Скрыть сетку',
  scaleByAxis: 'Масштаб по осям',
  move: 'Перемещение',
  rotate: 'Вращение',
  hdriMap: 'HDRI карта',
  textures: 'Текстуры',
  grid: 'Сетка',
  showTextures: 'Показывать текстуры',
  hidePanel: 'Скрыть панель',
  showPanel: 'Показать панель',
  clickToZoomIn: 'Нажмите, чтобы увеличить',
  clickToZoomOut: 'Нажмите, чтобы уменьшить',
  levelOfDetail: 'Уровень детализации',
  extensionLabel: 'Расширение',
  noFormats: 'Нет доступных форматов для скачивания',
  printOnline: 'Печать онлайн',
  promptLabel: 'Промпт',
  imageToGenerationLabel: 'Генерация по картинке',

  // Generation progress
  calculatingTime: 'Рассчитываем время генерации',
  remainingTime: 'Оставшееся время генерации',
  waitingMessage: 'Трудимся над Вашим запросом, нужно немного подождать',
  seconds: 'секунд',
  finishingGeneration: 'Завершаем генерацию',
  creation: 'Создание',
  cannotGenerate: 'Не можем сгенерировать модель по этому запросу. Попробуйте изменить текст или изображение.',
  disagreeWithDecision: 'Не согласны с решением?\nСообщите нам',
  fewMinutes: 'Пару минут - и 3D-модель будет готова',

  // Mobile upload drawer
  addYourModel: 'Добавьте вашу модель',
  fileRequirements: 'Требования к файлам:',
  fileFormats: 'Форматы: JPG (JPEG, JPE), PNG, GIF',
  maxFileSize: 'Максимальный размер: 20 МБ',
  maxOneFile: 'Максимум 1 файл за раз',
  prohibitedContent: 'Недопустимы изображения с запрещённым контентом',
  uploadFile: 'Загрузить файл',

  // File tooltip in main input
  fileRequirementsLabel: 'Требования к файлам:',
  fileFormatsLabel: 'Форматы: JPG (JPEG, JPE), PNG, GIF, WEBP',
  maxFileSizeLabel: 'Максимальный размер: 20 МБ',
  maxOneFileLabel: 'Максимум 1 файл за раз',
  prohibitedContentLabel: 'Недопустимы изображения с запрещённым контентом',

  // Main input
  noTexture: 'Без текстуры',
  settings: 'Настройки',
  templates: 'Шаблоны',
  miniature: 'Мини-фигурка',
  bust: 'Бюст',
  templateLabel: 'Шаблон',
  selfieOrUpload: 'Сделайте селфи или загрузите фото',
  uploadPhoto: 'Загрузить фото',
  takeSelfie: 'Сделать селфи',
  removeImage: 'Удалить изображение',
  removeTemplate: 'Удалить шаблон',
  imageAlt: 'Изображение',
  uploadedImage: 'Загруженное изображение',
  originalImage: 'Оригинальное изображение',
  kb: 'КБ',
  creating: 'Создание...',

  // Printer demo modal
  howToGetPrintModel: 'Как получить красивую модель для печати?',
  step1Title: 'Шаг 1. Опишите объект',
  step1Desc: 'или загрузите изображение — нажмите «Сгенерировать»',
  step2Title: 'Шаг 2. Подождите, пока модель сгенерируется,',
  step2Desc: 'затем скачайте её в формате STL',
  step3Title: 'Шаг 3. Отправьте модель на печать',
  step3Desc: 'в свой 3D-принтер или закажите печать в студиях печати',
  tryIt: 'Попробовать',

  // ModelInfoPane
  modelStillLoading: 'Модель ещё загружается',
  modelLoadingWait: 'Подождите завершения загрузки модели, чтобы открыть её в редакторе.',
  deleteModel: 'Удалить',
  publish: 'Опубликовать',
  adjustLighting: 'Настроить освещённость',
  turnOffCamera: 'Выключить камеру',
  turnOnCamera: 'Включить камеру',
  takeScreenshot: 'Сделать скриншот',

  // ExpandableImage
  clickToExpand: 'Нажмите, чтобы увеличить',
  clickToCollapse: 'Нажмите, чтобы уменьшить',

  // ExpandableText
  more: 'ещё',

  // CensorComplaintPopup
  censorDisagree: 'Не согласны с решением фильтра?',
  censorSubmitError: 'Не удалось отправить жалобу. Попробуйте еще раз',
  censorSubmit: 'Отправить жалобу',
  censorThanks: 'Спасибо, жалоба отправлена!',
  censorMayFail: 'Фильтр иногда может срабатывать ошибочно. Мы разберем Ваш запрос.',

  // Footer
  publicLicense: 'Публичная лицензия',
  privacyPolicy: 'Политика приватности',
  usagePolicy: 'Политика использования',
  copiedToClipboard: 'Скопировано в буфер обмена',
  contactUs: 'Напишите нам',
  emailLabel: 'Электронная почта',
  responseHours: 'Ответим по будням с 9 до 18',
  feedbackLink: 'Обратная связь',
  businessPartner: 'Бизнес-партнер',

  // FloatingModelsButton / FavoriteModelsPanel
  myModelsButton: 'Мои модели',

  // ModelSettingsPanel
  hdriMapSettings: 'HDRI карта',
  texturesSettings: 'Текстуры',
  gridSettings: 'Сетка',

  // Preview block
  selectFavorite: 'Выберите один понравившийся вариант',

  // LeftSidebar
  selectVariantTitle: 'Выберите один из вариантов',
  confirmCancelGeneration: 'Вы уверены, что хотите закрыть окно? Генерация будет отменена',
  yes: 'Да',
  no: 'Нет',
  noImagesYet: 'Пока нет изображений. Попробуйте через несколько секунд.',
  preparingPreview: 'Готовим превью...',
  selectThisVariant: 'Выбрать этот вариант',
  variantLabel: 'Вариант',

  // Page 404
  pageNotFound: 'Страница не найдена',

  // General
  loading: 'Загрузка...',
  errorLoadingData: 'Ошибка загрузки данных',
  meshLoading: 'Загрузка mesh-сетки...',
  networkError: 'Произошла сетевая ошибка. Проверьте подключение к интернету и попробуйте ещё раз.',
  unknownError: 'Неизвестная ошибка',

  // useModelStatusAndGenerate errors
  errorPreviewGeneration: 'Ошибка при генерации превью. Пожалуйста, создайте новое превью и попробуйте снова.',
  errorImageNotReady: 'Изображение для генерации модели ещё не готово. Возможно, возникли проблемы с сетью. Попробуйте ещё раз через несколько секунд.',
  errorLoadModel: 'Ошибка при загрузке модели',

  // EditorPage errors
  generationCancelled: 'Генерация отменена',
  generationCancelledDesc: 'Генерация модели была отменена',
  glbNotFound: 'GLB не найден',
  glbNotFoundDesc: 'Форматы меша отсутствуют или ещё не загрузились',
  modelUnavailable: 'Модель недоступна',
  modelUnavailableDesc: 'Изображение для этой модели не найдено. Вы будете перенаправлены на главную страницу.',
  errorStartModelGeneration: 'Не удалось запустить генерацию модели',
  errorStartModelGenerationDesc: 'Попробуйте ещё раз или измените запрос.',

  // ModelViewer errors
  errorCannotRestoreModel: 'Невозможно восстановить модель',
  errorCannotRestoreModelDesc: 'Некорректный индекс изображения или превью не загружено.',
  errorRendering: 'Ошибка отображения',
  errorRenderingDesc: 'Произошла ошибка отображения, модель будет перегенерирована.',
  errorRestoreModel: 'Ошибка при восстановлении модели',
  errorRestoreModelDesc: 'Не удалось перегенерировать модель. Пожалуйста, попробуйте позже или измените запрос',

  // useNotificationError
  thankYouComplaint: 'Спасибо за обращение!',
  weWillReview: 'Мы разберем Ваш запрос',
  disagreeQuestion: 'Не согласны с решением?',
  tellUs: 'Сообщите нам',
  generationError: 'Ошибка генерации',
  generationErrorDesc: 'Произошла ошибка при генерации. Попробуйте изменить запрос и попробовать еще раз.',

  // ScreenshotManager
  screenshotSaved: 'Снимок сохранён',
  screenshotSavedDesc: 'Сгенерирована короткая ссылка и QR',
  screenshotUploadError: 'Не удалось загрузить снимок',
  screenshotSaving: 'Сохраняем снимок...',
  screenshotLink: 'Ссылка на снимок',
  shortLink: 'Короткая ссылка:',

  // Preview
  regenerate: 'Перегенерировать',
  reloadPage: 'Перезагрузить страницу',
  errorLoadImages: 'Не удалось загрузить изображения. Возможно, проблемы с сетью.',
  errorServerConnection: 'Ошибка связи с сервером. Попробуйте ещё раз или отключите VPN.',
  errorGetGenerationResult: 'Не удалось получить результат генерации. Попробуйте перезагрузить страницу или перегенерировать.',

  // LeftSidebar error messages
  errorPreviewSubscription: 'Ошибка при генерации превью',
  errorStartGeneration: 'Не удалось запустить генерацию',
  errorStartGenerationPreview: 'Не удалось запустить генерацию превью',
  errorLoadPreviewImage: 'Не удалось загрузить превью изображения',
  errorImageGeneration: 'Ошибка генерации по изображению',
  errorStartGenerationByImage: 'Не удалось запустить генерацию по изображению',
  errorPreviewSubscriptionStatus: 'Ошибка при получении статуса генерации',
  printQueueSuccess: 'Модель добавлена в очередь печати',
  printQueueError: 'Нет активной модели для отправки на печать',
  printQueueFailed: 'Не удалось добавить модель в очередь печати',

  // ShareModal
  linkCopied: 'Ссылка скопирована',
  share: 'Поделиться',
  copyLink: 'Скопировать ссылку',

  // QrCodeModel
  downloadModel: 'Скачайте 3D-модель',

  // QrUploadModal
  scanQrToUpload: 'Отсканируйте QR-код, чтобы загрузить своё изображение',

  // DownloadPage
  detectingDevice: 'Определяем устройство...',
  viewArApple: 'Просмотр 3D-модели в AR на устройстве Apple',
  viewAndroid: 'Просмотр 3D-модели на Android',
  deviceNotDetected: 'Не удалось определить устройство. Выберите формат для скачивания:',
  errorLoadingModel: 'Ошибка загрузки модели',
  downloadModel3D: 'Скачать 3D-модель',
  openInAr: 'Открыть в AR (iPhone/iPad)',
  openArHint: 'Нажмите кнопку для просмотра 3D-модели в AR на вашем устройстве',
  browserNoSupport: 'Ваш браузер не поддерживает просмотр 3D-модели',
  downloadGlb: 'Скачать .glb',
  downloadUsdz: 'Скачать для iPhone/iPad (USDZ)',
  downloadGlbAndroid: 'Скачать для Android (GLB)',

  // CreatePrintModelPage
  promptLabel2: 'Промпт:',
  moreText: 'ещё',
  modelLabel: 'Модель',

  // EditorPage debug info
  topologyLabel: 'Топология',
  polygonsLabel: 'Полигоны',
  legendAlt: 'Легенда',

  // PrintingModelsPage
  noImage: 'Нет изображения',
  printQueueEmpty: 'Очередь печати пуста',
  downloadFormat: 'Скачать',

  // SelfiePage
  cameraDisabled: 'Камера отключена или доступ запрещён',
  takePhoto: 'Сделать фото',
  retakePhoto: 'Переснять',
  confirmPhoto: 'Подтвердить',

  // PrinterPage
  inQueue: 'В очереди',
  readyModels: 'Готовы',
  modelName: 'Название модели',
  printTimeLeft: 'Оставшееся время печати',

  // GeneratePageNew
  uploadFromPhone: 'Загрузить с телефона',
  closeLabel: 'Закрыть',

  // RightSidebar debug
  modelStatus: 'Статус модели',
  formatsNotLoaded: '(форматы не загружены)',

  // const.ts LOADING_TEXTS
  loadingText1: 'Трудимся над Вашей моделью, нужно немного подождать',
  loadingText2: 'Наши алгоритмы усердно создают 3D-модель, наберитесь терпения',
  loadingText3: 'Создаём геометрию, запекаем текстуру, почти готово',
  loadingText4: 'Сглаживаем сетку, генерируем форматы, пожалуйста, подождите',
  loadingText5: 'Выполняем Ваш запрос, подождите, пожалуйста',
  loadingText6: 'Пару минут — и 3D-модель будет готова',
  loadingText7: 'Ещё чуть-чуть — и ваш запрос будет выполнен',

  // KioskPage
  kioskGenerationCancelled: 'Генерация была отменена',
  kioskModelGenerationCancelled: 'Генерация модели была отменена',
  kioskGenerationStartError: 'Ошибка при запуске генерации',
  kioskServerConnectionError: 'Ошибка соединения с сервером',
  kioskStlUnavailable: 'STL-файл недоступен',
  kioskSlicerError: 'Слайсер вернул ошибку',
  kioskSlicerConnectionError: 'Не удалось подключиться к слайсеру',
} as const;

export default ru;
