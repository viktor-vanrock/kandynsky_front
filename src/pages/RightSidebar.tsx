import { FC, useMemo, useState, useEffect, useRef, useCallback } from 'react';
import classNames from 'classnames';
import { Button, Dropdown, Tabs, Spin, message } from 'antd';
import styles from './RightSidebar.module.css';
import downloadStyles from '../components/download-model/DownloadModel.module.css';
import {
  MeshRequestEntity,
  GetGeneratedPreviewsQuery,
  useGetGeneratedPreviewsQuery,
  useAddToPrintQueueMutation,
} from '../graphql/graphQlApiHooks';
import { getSessionToken } from '../utils/session';
import { hdriMaps } from '../store/viewer';
import { useGameDevStore } from '../store/gamedev';
import { MeshTextureIcon, DownloadButtonIcon } from '../components/Icons';
import { BodyS, BodyXS, Select } from '@salutejs/plasma-giga';
import { primary, secondary } from '@salutejs/plasma-tokens';
import { ExpandableText } from '../components/ExpandableText.tsx';

type Vec3 = [number, number, number];
type PreviewModel = GetGeneratedPreviewsQuery['getGeneratedPreviews']['data'][0];

type Props = {
  theme: 'dark' | 'light';

  showMesh: boolean;
  onToggleMesh: () => void;
  modelInfo: MeshRequestEntity | null;
  position: Vec3;
  rotation: Vec3;
  size?: Vec3;
  activeHdriIndex: number;
  hdriMenuOpen: boolean;
  onToggleHdriMenu: () => void;
  onSelectHdri: (index: number) => void;
  isShowTexture: boolean;
  onToggleTexture: () => void;
  className?: string;
  onPickFromCatalog?: (
    previewId: string,
    order: number,
    prompt?: string,
    meshRequest?: MeshRequestEntity,
    previewModel?: PreviewModel,
  ) => void;
  is3DPrintMode?: boolean;
  lodLevels?: number[];
  activeLodLevel?: number;
  onLodLevelChange?: (level: number) => void;
  hasLod?: boolean;
  currentPrompt?: string;
  isMeshLoading?: boolean;
};

const toDeg = (r: number) => Math.round((r * 180) / Math.PI);

export const RightSidebar: FC<Props> = ({
  theme,
  showMesh,
  onToggleMesh,
  modelInfo,
  position,
  rotation,
  size,
  activeHdriIndex,
  onSelectHdri,
  isShowTexture,
  onToggleTexture,
  className,
  onPickFromCatalog,
  is3DPrintMode = false,
  lodLevels,
  activeLodLevel,
  onLodLevelChange,
  hasLod = false,
  currentPrompt,
  isMeshLoading = false,
}) => {
  const [addToPrintQueue, { loading: addingToPrint }] = useAddToPrintQueueMutation();
  const { pbrMode, setPbrMode } = useGameDevStore();
  const isStand = typeof localStorage !== 'undefined' ? localStorage.getItem('demonstration') : null;

  const [page, setPage] = useState<number>(1);
  const [models, setModels] = useState<PreviewModel[]>([]);
  const loaderRef = useRef<HTMLDivElement | null>(null);

  const sessionToken = getSessionToken();
  const { data, loading, error, fetchMore } = useGetGeneratedPreviewsQuery({
    variables: {
      sessionToken,
      pagination: { page, limit: 100 },
    },
    notifyOnNetworkStatusChange: true,
    fetchPolicy: 'network-only',
    pollInterval: 3000, // Обновляем каталог каждые 3 секунды
  });

  const hasMore = !data ? false : data.getGeneratedPreviews.page < data.getGeneratedPreviews.total_pages;

  const filterEmpty = useCallback((previews: PreviewModel[]) => previews.filter((p) => p.images.length), []);
  const filterUserOnly = useCallback((previews: PreviewModel[]) => previews.filter((p) => !p.gallery), []);

  useEffect(() => {
    if (error) console.log(error);
    const previews = (data?.getGeneratedPreviews?.data ?? []) as PreviewModel[];
    if (previews?.length) {
      const filtered = filterUserOnly(filterEmpty(previews));
      setModels((prev) => {
        // Создаем Set существующих ID для быстрой проверки
        const existingIds = new Set(prev.map((m) => m.id));
        // Добавляем только новые модели, которых нет в prev
        const newModels = filtered.filter((m) => !existingIds.has(m.id));
        const next = [...prev, ...newModels];
        const limit = 400;
        return next.length > limit ? next.slice(next.length - limit) : next;
      });
    }
  }, [data, error, filterEmpty, filterUserOnly]);

  useEffect(() => {
    const el = loaderRef.current;
    if (!el) return;

    const io = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !loading && !error) {
          const nextPage = page + 1;
          setPage(nextPage);
          fetchMore({
            variables: { pagination: { page: nextPage, limit: 100 } },
          });
        }
      },
      { threshold: 1 },
    );

    io.observe(el);
    return () => io.disconnect();
  }, [loaderRef, hasMore, loading, error, fetchMore, page]);

  const handleSendToPrint = useCallback(async () => {
    if (!modelInfo?.id) {
      message.error('Нет активной модели для отправки на печать');
      return;
    }

    try {
      await addToPrintQueue({
        variables: {
          input: {
            meshRequestId: modelInfo.id,
          },
        },
      });
      message.success('Модель добавлена в очередь печати');
    } catch (err: unknown) {
      console.error('Failed to add to print queue:', err);
      const errorMessage = err instanceof Error ? err.message : 'Не удалось добавить модель в очередь печати';
      message.error(errorMessage);
    }
  }, [modelInfo?.id, addToPrintQueue]);

  const formats = useMemo(() => {
    const mf = modelInfo?.meshFormats ?? [];
    const arr = mf
      .filter((f) => Boolean(f?.url) && Boolean(f?.format?.name))
      .map((f) => ({
        name: String(f.format?.name ?? '').toLowerCase(),
        url: String(f.url),
      }));
    const order = { glb: 0, obj: 1, stl: 2, ply: 3, usdz: 4 } as const;
    return arr.sort(
      (a, b) => (order[a.name as keyof typeof order] ?? 99) - (order[b.name as keyof typeof order] ?? 99),
    );
  }, [modelInfo?.meshFormats]);

  const downloadModel = useCallback((format: { name: string; url: string }) => {
    const link = document.createElement('a');
    link.href = format.url;
    link.download = `model.${format.name}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }, []);

  const lodOptions = useMemo(() => {
    if (!lodLevels || lodLevels.length === 0) return [];
    const unique = Array.from(new Set(lodLevels)).sort((a, b) => a - b);
    return unique.map((level) => ({ value: String(level), label: `LOD ${level}` }));
  }, [lodLevels]);

  const selectedLodValue = activeLodLevel !== undefined ? String(activeLodLevel) : lodOptions[0]?.value;

  return (
    <aside className={classNames(styles.sidebar, className)} data-theme={theme}>
      <div className={styles.topbar}>
        <Button
          type="text"
          shape="circle"
          size="small"
          className={styles.iconCircle}
          icon={<MeshTextureIcon theme={theme} active={showMesh} />}
          onClick={onToggleMesh}
          title={showMesh ? 'Скрыть сетку' : 'Показать сетку'}
          aria-label="Переключить отображение сетки"
        />
      </div>

      {currentPrompt && (
        <div className={styles.promptSection}>
          <BodyXS bold>Промпт</BodyXS>
          <BodyXS color={secondary}>
            <ExpandableText text={currentPrompt} maxLength={100} />
          </BodyXS>
        </div>
      )}

      <Tabs
        className={styles.tabs}
        defaultActiveKey="model"
        items={[
          {
            key: 'model',
            label: <BodyXS bold>Модель</BodyXS>,
            children: (
              <div className={styles.tabBody}>
                <div className={`${styles.block} ${styles.blockWithTopMargin}`}>
                  <BodyXS bold color={primary}>
                    Освещение{' '}
                  </BodyXS>
                  <div className={styles.blockBody}>
                    <div className={styles.row2}>
                      <BodyXS color={primary}>HDRI Карта</BodyXS>
                      <Select
                        value={String(activeHdriIndex)}
                        target="button-like"
                        onChange={(v) => onSelectHdri(Number(v))}
                        items={hdriMaps.map((m, i) => ({
                          value: String(i),
                          label: m.name ?? `Карта ${i + 1}`,
                        }))}
                        size="xs"
                        view="secondary"
                      />
                    </div>
                  </div>
                  {!is3DPrintMode && (
                    <label className={styles.textureToggle}>
                      <BodyXS color={primary}>Показывать текстуры</BodyXS>
                      <input type="checkbox" checked={isShowTexture} onChange={onToggleTexture} />
                    </label>
                  )}
                </div>

                <div className={styles.block}>
                  <BodyXS bold color={primary}>
                    Трансформация
                  </BodyXS>
                  <div className={styles.blockBody}>
                    <div className={styles.propGrid}>
                      <BodyXS className={styles.propLabel}>Позиция</BodyXS>
                      <BodyXS color={secondary}>
                        X: {position[0].toFixed(2)}&nbsp;&nbsp; Y: {position[1].toFixed(2)}&nbsp;&nbsp; Z:{' '}
                        {position[2].toFixed(2)}
                      </BodyXS>

                      <BodyXS>Размер</BodyXS>
                      <BodyXS color={secondary}>
                        {size ? (
                          <>
                            X: {size[0].toFixed(2)}&nbsp;&nbsp; Y: {size[1].toFixed(2)}&nbsp;&nbsp; Z:{' '}
                            {size[2].toFixed(2)}
                          </>
                        ) : (
                          '—'
                        )}
                      </BodyXS>

                      <BodyXS>Вращение</BodyXS>
                      <BodyXS color={secondary}>
                        X: {toDeg(rotation[0])}°&nbsp;&nbsp; Y: {toDeg(rotation[1])}°&nbsp;&nbsp; Z:{' '}
                        {toDeg(rotation[2])}°
                      </BodyXS>
                      <BodyXS>ID</BodyXS>
                      <BodyXS color={secondary}>{modelInfo?.id}</BodyXS>
                    </div>
                  </div>
                </div>

                {hasLod && lodOptions.length > 0 && (
                  <div className={`${styles.block} ${styles.blockNoMargin}`}>
                    <BodyXS bold color={primary}>
                      Уровень детализации
                    </BodyXS>
                    <div className={`${styles.blockBody} ${styles.blockBodySmallMargin}`}>
                      <div className={styles.row2}>
                        <BodyXS color={primary}>LOD</BodyXS>
                        <Select
                          className={styles.flatSelect}
                          value={selectedLodValue ?? lodOptions[0]?.value}
                          onChange={(value) => onLodLevelChange?.(Number(value))}
                          items={lodOptions}
                          size="xs"
                        />
                      </div>
                    </div>
                  </div>
                )}

                <div className={`${styles.block} ${styles.blockNoMargin}`}>
                  <BodyXS bold color={primary}>
                    Материал
                  </BodyXS>
                  <div className={`${styles.blockBody} ${styles.blockBodySmallMargin}`}>
                    <div className={styles.row2}>
                      <BodyXS color={primary}>PBR</BodyXS>
                      <Select
                        className={styles.flatSelect}
                        value={pbrMode}
                        onChange={(value) => setPbrMode(value as 'albedo' | 'metall' | 'plastic' | 'pbr')}
                        items={[
                          { value: 'pbr', label: 'PBR' },
                          { value: 'metall', label: 'Metall' },
                          { value: 'plastic', label: 'Plastic' },
                          { value: 'albedo', label: 'albedo' },
                        ]}
                        size="xs"
                      />
                    </div>
                  </div>
                </div>

                <div className={styles.actionButtons}>
                  <Dropdown
                    dropdownRender={() => (
                      <div className={downloadStyles.downloadMenuWrapper} data-theme={theme}>
                        <h4 className={downloadStyles.downloadMenuHeader}>Расширение</h4>
                        {formats.length ? (
                          <div className={downloadStyles.downloadButtonWrapper}>
                            {formats.map((f) => (
                              <div
                                key={f.name}
                                className={downloadStyles.downloadFormatButton}
                                onClick={() => downloadModel(f)}
                              >
                                {f.name.toUpperCase()}
                                <DownloadButtonIcon
                                  theme={theme}
                                  className={downloadStyles.downloadButtonIcon}
                                  hovered={false}
                                />
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className={downloadStyles.noFormats}>
                            Нет доступных форматов для скачивания
                            {modelInfo?.status && (
                              <div style={{ opacity: 0.7, marginTop: 6 }}>
                                Статус модели: <b>{modelInfo.status}</b>
                                {Array.isArray(modelInfo?.meshFormats) &&
                                  modelInfo.meshFormats.length === 0 &&
                                  ' (форматы не загружены)'}
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    )}
                    trigger={['click']}
                    transitionName=""
                  >
                    <Button
                      className={styles.downloadButton}
                      type="primary"
                      icon={<DownloadButtonIcon theme={theme} hovered={false} />}
                      disabled={isMeshLoading}
                    >
                      <BodyS>Скачать</BodyS>
                    </Button>
                  </Dropdown>
                  {is3DPrintMode && isStand && (
                    <Button
                      className={styles.printButton}
                      type="default"
                      onClick={handleSendToPrint}
                      loading={addingToPrint}
                      disabled={!modelInfo?.id}
                    >
                      Печать онлайн
                    </Button>
                  )}
                </div>
              </div>
            ),
          },
          {
            key: 'catalog',
            label: <BodyXS bold>Каталог моделей</BodyXS>,
            children: (
              <div className={styles.tabBody}>
                <div className={styles.block}>
                  <div className={styles.catalogGrid}>
                    {models.map((m) => {
                      const images = m.images ?? [];
                      // ищем серую картинку (0–3) для мэтчинга меша или результирующую png (order 100)
                      const gray = images.find((im) => typeof im?.order === 'number' && im.order >= 0 && im.order <= 3);
                      const png100 = images.find((im) => im?.order === 100);
                      const png101 = images.find((im) => im?.order === 101);
                      const img = gray ?? png100 ?? png101 ?? images[0];
                      if (!img?.url) return null;
                      const clickOrder = typeof img.order === 'number' ? img.order : gray?.order ?? 100;
                      const meshRequest = img.meshRequests?.[0] ?? undefined;

                      return (
                        <button
                          key={`${m.id}_${img.order ?? 'na'}`}
                          className={styles.catalogItem}
                          title={m.prompt ?? m.id}
                          onClick={() => {
                            // Передаем preview модель для определения режима по numTargetFaces
                            // Передаем промт только если он есть, иначе undefined (промт будет получен из preview)
                            onPickFromCatalog?.(
                              m.id,
                              clickOrder,
                              m.prompt || undefined,
                              meshRequest as MeshRequestEntity,
                              m,
                            );
                          }}
                        >
                          <img src={img.url} alt={m.prompt ?? 'preview'} />
                        </button>
                      );
                    })}
                  </div>

                  {loading && (
                    <div className={styles.catalogLoading}>
                      <Spin size="small" />
                    </div>
                  )}
                  {!loading && !error && models.length === 0 && (
                    <div className={styles.catalogEmpty}>Ещё нет моделей</div>
                  )}
                  <div ref={loaderRef} className={styles.catalogLoaderSentinel} />
                </div>
              </div>
            ),
          },
        ]}
      />
    </aside>
  );
};

export default RightSidebar;
