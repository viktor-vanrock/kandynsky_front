import { FC, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';

type Theme = 'light' | 'dark';

const Overlay = styled.div<{ $visible: boolean }>`
  position: fixed;
  inset: 0;
  z-index: 10002;
  background: rgba(0, 0, 0, 0.6);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: flex-end;
  justify-content: center;
  opacity: ${({ $visible }) => ($visible ? 1 : 0)};
  pointer-events: ${({ $visible }) => ($visible ? 'auto' : 'none')};
  transition: opacity 0.3s ease;
`;

const Sheet = styled.div<{ $theme: Theme }>`
  width: 100%;
  max-width: 480px;
  max-height: 92dvh;
  background: ${({ $theme }) => ($theme === 'dark' ? '#111118' : '#ffffff')};
  border-radius: 20px 20px 0 0;
  display: flex;
  flex-direction: column;
  overflow: hidden;
`;

const Header = styled.div<{ $theme: Theme }>`
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 20px 16px 16px;
  flex-shrink: 0;
  border-bottom: 1px solid ${({ $theme }) => ($theme === 'dark' ? 'rgba(255,255,255,0.08)' : 'rgba(8,8,8,0.08)')};
`;

const BackBtn = styled.button`
  width: 36px;
  height: 36px;
  border: none;
  background: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0;
  flex-shrink: 0;
`;

const HeaderTitle = styled.span<{ $theme: Theme }>`
  flex: 1;
  font-family: 'SB Sans Text', sans-serif;
  font-size: 17px;
  font-weight: 600;
  line-height: 22px;
  color: ${({ $theme }) => ($theme === 'dark' ? 'rgba(255,255,255,0.96)' : 'rgba(8,8,8,0.96)')};
`;

const CloseBtn = styled.button`
  width: 36px;
  height: 36px;
  border: none;
  background: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0;
  flex-shrink: 0;
`;

const ScrollBody = styled.div`
  flex: 1;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 0;
`;

const Section = styled.div`
  padding: 20px 16px 0;
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

const Divider = styled.div<{ $theme: Theme }>`
  height: 1px;
  background: ${({ $theme }) => ($theme === 'dark' ? 'rgba(255,255,255,0.08)' : 'rgba(8,8,8,0.08)')};
  margin: 20px 0 0;
`;

const SectionTitle = styled.h3<{ $theme: Theme }>`
  margin: 0;
  font-family: 'SB Sans Text', sans-serif;
  font-size: 17px;
  font-weight: 600;
  line-height: 22px;
  color: ${({ $theme }) => ($theme === 'dark' ? 'rgba(255,255,255,0.96)' : 'rgba(8,8,8,0.96)')};
`;

/* ── Карточки сервисов ── */
const ServicesScroll = styled.div`
  display: flex;
  gap: 8px;
  overflow-x: auto;
  padding-bottom: 4px;
  scrollbar-width: none;
  &::-webkit-scrollbar { display: none; }
`;

const ServiceCard = styled.div<{ $selected: boolean; $theme: Theme }>`
  width: 208px;
  height: 150px;
  flex-shrink: 0;
  border-radius: 16px;
  border: 2px solid ${({ $selected }) => ($selected ? '#3F81FD' : 'rgba(255,255,255,0.10)')};
  background: ${({ $theme }) => ($theme === 'dark' ? 'rgba(255,255,255,0.06)' : 'rgba(8,8,8,0.04)')};
  padding: 14px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  cursor: pointer;
  position: relative;
  transition: border-color 0.2s ease;
  box-sizing: border-box;
`;

const ServiceName = styled.span<{ $theme: Theme }>`
  font-family: 'SB Sans Text', sans-serif;
  font-size: 16px;
  font-weight: 600;
  line-height: 20px;
  color: ${({ $theme }) => ($theme === 'dark' ? 'rgba(255,255,255,0.96)' : 'rgba(8,8,8,0.96)')};
`;

const ServiceInfo = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
`;

const ServiceRow = styled.div<{ $theme: Theme }>`
  display: flex;
  align-items: flex-start;
  gap: 6px;
  font-family: 'SB Sans Text', sans-serif;
  font-size: 12px;
  line-height: 16px;
  color: ${({ $theme }) => ($theme === 'dark' ? 'rgba(255,255,255,0.56)' : 'rgba(8,8,8,0.56)')};
`;

const ServiceDot = styled.div<{ $visible: boolean }>`
  position: absolute;
  bottom: 10px;
  right: 10px;
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background: #3F81FD;
  opacity: ${({ $visible }) => ($visible ? 1 : 0)};
  transition: opacity 0.2s ease;
`;

/* ── Параметры печати ── */
const PrintSettingsCard = styled.div<{ $theme: Theme }>`
  border-radius: 16px;
  background: ${({ $theme }) => ($theme === 'dark' ? 'rgba(255,255,255,0.06)' : 'rgba(8,8,8,0.04)')};
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

const ToggleRow = styled.div`
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
`;

const ToggleTexts = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2px;
`;

const ToggleLabel = styled.span<{ $theme: Theme }>`
  font-family: 'SB Sans Text', sans-serif;
  font-size: 16px;
  font-weight: 500;
  line-height: 22px;
  color: ${({ $theme }) => ($theme === 'dark' ? 'rgba(255,255,255,0.96)' : 'rgba(8,8,8,0.96)')};
`;

const ToggleHint = styled.span<{ $theme: Theme }>`
  font-family: 'SB Sans Text', sans-serif;
  font-size: 13px;
  line-height: 18px;
  color: ${({ $theme }) => ($theme === 'dark' ? 'rgba(255,255,255,0.40)' : 'rgba(8,8,8,0.40)')};
`;

const Toggle = styled.button<{ $on: boolean }>`
  width: 51px;
  height: 31px;
  border-radius: 16px;
  border: none;
  background: ${({ $on }) => ($on ? '#3F81FD' : 'rgba(120,120,128,0.32)')};
  cursor: pointer;
  position: relative;
  flex-shrink: 0;
  transition: background 0.2s ease;

  &::after {
    content: '';
    position: absolute;
    top: 2px;
    left: ${({ $on }) => ($on ? '22px' : '2px')};
    width: 27px;
    height: 27px;
    border-radius: 50%;
    background: #fff;
    transition: left 0.2s ease;
    box-shadow: 0 2px 4px rgba(0,0,0,0.2);
  }
`;

const SettingsExpanded = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

const FieldLabel = styled.div<{ $theme: Theme }>`
  display: flex;
  align-items: center;
  gap: 6px;
  font-family: 'SB Sans Text', sans-serif;
  font-size: 15px;
  font-weight: 500;
  line-height: 20px;
  color: ${({ $theme }) => ($theme === 'dark' ? 'rgba(255,255,255,0.96)' : 'rgba(8,8,8,0.96)')};
  margin-bottom: 6px;
`;

const FieldHint = styled.span<{ $theme: Theme }>`
  font-family: 'SB Sans Text', sans-serif;
  font-size: 13px;
  line-height: 18px;
  color: ${({ $theme }) => ($theme === 'dark' ? 'rgba(255,255,255,0.40)' : 'rgba(8,8,8,0.40)')};
  margin-top: 6px;
`;

const SelectWrapper = styled.div<{ $theme: Theme }>`
  position: relative;
  width: 100%;
  height: 52px;
  border-radius: 14px;
  background: ${({ $theme }) => ($theme === 'dark' ? 'rgba(255,255,255,0.08)' : 'rgba(8,8,8,0.06)')};
  display: flex;
  align-items: center;
  padding: 0 16px;
  box-sizing: border-box;
  cursor: pointer;
`;

const SelectValue = styled.span<{ $theme: Theme }>`
  flex: 1;
  font-family: 'SB Sans Text', sans-serif;
  font-size: 16px;
  line-height: 22px;
  color: ${({ $theme }) => ($theme === 'dark' ? 'rgba(255,255,255,0.96)' : 'rgba(8,8,8,0.96)')};
`;

const SelectChevron = styled.span<{ $theme: Theme }>`
  color: ${({ $theme }) => ($theme === 'dark' ? 'rgba(255,255,255,0.56)' : 'rgba(8,8,8,0.56)')};
`;

const SelectNative = styled.select`
  position: absolute;
  inset: 0;
  opacity: 0;
  width: 100%;
  height: 100%;
  cursor: pointer;
`;

const SliderWrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const SliderTrack = styled.input`
  width: 100%;
  height: 4px;
  -webkit-appearance: none;
  appearance: none;
  border-radius: 2px;
  background: linear-gradient(to right, #fff 0%, #fff var(--val, 50%), rgba(255,255,255,0.2) var(--val, 50%), rgba(255,255,255,0.2) 100%);
  cursor: pointer;

  &::-webkit-slider-thumb {
    -webkit-appearance: none;
    width: 24px;
    height: 24px;
    border-radius: 50%;
    background: #fff;
    box-shadow: 0 2px 8px rgba(0,0,0,0.3);
  }
`;

const SliderValue = styled.span<{ $theme: Theme }>`
  font-family: 'SB Sans Text', sans-serif;
  font-size: 14px;
  line-height: 20px;
  color: ${({ $theme }) => ($theme === 'dark' ? 'rgba(255,255,255,0.56)' : 'rgba(8,8,8,0.56)')};
  text-align: center;
`;

/* ── Контакты ── */
const ContactInput = styled.input<{ $theme: Theme }>`
  width: 100%;
  height: 52px;
  border-radius: 14px;
  border: none;
  background: ${({ $theme }) => ($theme === 'dark' ? 'rgba(255,255,255,0.08)' : 'rgba(8,8,8,0.06)')};
  padding: 0 16px;
  box-sizing: border-box;
  font-family: 'SB Sans Text', sans-serif;
  font-size: 16px;
  line-height: 22px;
  color: ${({ $theme }) => ($theme === 'dark' ? 'rgba(255,255,255,0.96)' : 'rgba(8,8,8,0.96)')};
  outline: none;

  &::placeholder {
    color: ${({ $theme }) => ($theme === 'dark' ? 'rgba(255,255,255,0.28)' : 'rgba(8,8,8,0.28)')};
  }
`;

const ContactsGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

/* ── Модель ── */
const ModelCard = styled.div<{ $theme: Theme }>`
  border-radius: 16px;
  background: ${({ $theme }) => ($theme === 'dark' ? 'rgba(255,255,255,0.06)' : 'rgba(8,8,8,0.04)')};
  padding: 14px;
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

const ModelRow = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
`;

const ModelThumb = styled.img`
  width: 72px;
  height: 72px;
  border-radius: 10px;
  object-fit: cover;
  flex-shrink: 0;
`;

const ModelInfo = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 2px;
`;

const ModelName = styled.span<{ $theme: Theme }>`
  font-family: 'SB Sans Text', sans-serif;
  font-size: 16px;
  font-weight: 600;
  line-height: 22px;
  color: ${({ $theme }) => ($theme === 'dark' ? 'rgba(255,255,255,0.96)' : 'rgba(8,8,8,0.96)')};
`;

const ModelDims = styled.span<{ $theme: Theme }>`
  font-family: 'SB Sans Text', sans-serif;
  font-size: 13px;
  line-height: 18px;
  color: ${({ $theme }) => ($theme === 'dark' ? 'rgba(255,255,255,0.40)' : 'rgba(8,8,8,0.40)')};
`;

const QuantityRow = styled.div`
  display: flex;
  align-items: center;
  gap: 16px;
`;

const QtyBtn = styled.button<{ $theme: Theme }>`
  width: 36px;
  height: 36px;
  border-radius: 50%;
  border: none;
  background: ${({ $theme }) => ($theme === 'dark' ? 'rgba(255,255,255,0.10)' : 'rgba(8,8,8,0.08)')};
  color: ${({ $theme }) => ($theme === 'dark' ? 'rgba(255,255,255,0.96)' : 'rgba(8,8,8,0.96)')};
  font-size: 20px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const QtyValue = styled.span<{ $theme: Theme }>`
  font-family: 'SB Sans Text', sans-serif;
  font-size: 17px;
  font-weight: 600;
  min-width: 24px;
  text-align: center;
  color: ${({ $theme }) => ($theme === 'dark' ? 'rgba(255,255,255,0.96)' : 'rgba(8,8,8,0.96)')};
`;

const PriceRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const PriceLabel = styled.span<{ $theme: Theme }>`
  font-family: 'SB Sans Text', sans-serif;
  font-size: 15px;
  line-height: 20px;
  color: ${({ $theme }) => ($theme === 'dark' ? 'rgba(255,255,255,0.56)' : 'rgba(8,8,8,0.56)')};
`;

const PriceValue = styled.span<{ $theme: Theme }>`
  font-family: 'SB Sans Text', sans-serif;
  font-size: 15px;
  font-weight: 600;
  line-height: 20px;
  color: ${({ $theme }) => ($theme === 'dark' ? 'rgba(255,255,255,0.96)' : 'rgba(8,8,8,0.96)')};
`;

const PriceDisclaimer = styled.p<{ $theme: Theme }>`
  margin: 0;
  font-family: 'SB Sans Text', sans-serif;
  font-size: 12px;
  line-height: 16px;
  color: ${({ $theme }) => ($theme === 'dark' ? 'rgba(255,255,255,0.32)' : 'rgba(8,8,8,0.32)')};
`;

/* ── Кнопка отправки ── */
const Footer = styled.div`
  padding: 12px 16px calc(20px + env(safe-area-inset-bottom));
  flex-shrink: 0;
`;

const SubmitBtn = styled.button`
  width: 100%;
  height: 56px;
  border: none;
  border-radius: 14px;
  background: #3F81FD;
  color: #fff;
  font-family: 'SB Sans Text', sans-serif;
  font-size: 17px;
  font-weight: 600;
  cursor: pointer;
  transition: opacity 0.2s ease;

  &:hover { opacity: 0.9; }
`;

const SERVICES = [
  { id: '1', name: '3D Printus', address: 'Москва, ул. Золоторожский Вал, 32, стр. 8 (этаж 2)', delivery: 'Курьер / Самовывоз' },
  { id: '2', name: 'Top 3D Shop', address: 'Москва, ул. Золоторожски 32, стр. 8 (эт...', delivery: 'Самовывоз' },
  { id: '3', name: 'Print3D Lab', address: 'Москва, Садовая-Черногрязская, 8', delivery: 'Курьер' },
];

const TECHNOLOGIES = ['FDM/FFF (пластиковая нит...', 'SLA (фотополимер)', 'SLS (лазерное спекание)', 'MJF'];
const MATERIALS = ['PLA (биоразлагаемый пластик)', 'ABS', 'PETG', 'TPU (гибкий)'];

interface PrintOrderModalProps {
  open: boolean;
  onClose: () => void;
  theme: Theme;
  modelImage?: string;
}

export const PrintOrderModal: FC<PrintOrderModalProps> = ({ open, onClose, theme, modelImage }) => {
  const navigate = useNavigate();
  const [selectedService, setSelectedService] = useState('1');
  const [customSettings, setCustomSettings] = useState(false);
  const [technology, setTechnology] = useState(TECHNOLOGIES[0]);
  const [material, setMaterial] = useState(MATERIALS[0]);
  const [fillValue, setFillValue] = useState(50);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [email, setEmail] = useState('');
  const [qty, setQty] = useState(1);
  const sliderRef = useRef<HTMLInputElement>(null);

  const tc = theme === 'dark' ? 'rgba(255,255,255,0.56)' : 'rgba(8,8,8,0.56)';

  const handleSubmit = () => {
    onClose();
    navigate('/printer');
  };

  const updateSlider = (val: number) => {
    setFillValue(val);
    if (sliderRef.current) {
      sliderRef.current.style.setProperty('--val', `${val}%`);
    }
  };

  return (
    <Overlay $visible={open} onClick={onClose}>
      <Sheet $theme={theme} onClick={(e) => e.stopPropagation()}>
        <Header $theme={theme}>
          <BackBtn onClick={onClose} aria-label="Назад">
            <svg width="20" height="16" viewBox="0 0 20 16" fill="none">
              <path fillRule="evenodd" clipRule="evenodd" d="M8.70711 0.292893C9.09763 0.683417 9.09763 1.31658 8.70711 1.70711L3.41421 7H19C19.5523 7 20 7.44772 20 8C20 8.55228 19.5523 9 19 9H3.41421L8.70711 14.2929C9.09763 14.6834 9.09763 15.3166 8.70711 15.7071C8.31658 16.0976 7.68342 16.0976 7.29289 15.7071L0.292893 8.70711C-0.0976311 8.31658 -0.0976311 7.68342 0.292893 7.29289L7.29289 0.292893C7.68342 -0.0976311 8.31658 -0.0976311 8.70711 0.292893Z" fill={tc}/>
            </svg>
          </BackBtn>
          <HeaderTitle $theme={theme}>Отправить модель на 3D печать</HeaderTitle>
          <CloseBtn onClick={onClose} aria-label="Закрыть">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M2 2L14 14M14 2L2 14" stroke={tc} strokeWidth="2" strokeLinecap="round"/>
            </svg>
          </CloseBtn>
        </Header>

        <ScrollBody>
          {/* Сервисы */}
          <Section>
            <SectionTitle $theme={theme}>Выберите сервис печати</SectionTitle>
            <ServicesScroll>
              {SERVICES.map((s) => (
                <ServiceCard
                  key={s.id}
                  $selected={selectedService === s.id}
                  $theme={theme}
                  onClick={() => setSelectedService(s.id)}
                >
                  <ServiceName $theme={theme}>{s.name}</ServiceName>
                  <ServiceInfo>
                    <ServiceRow $theme={theme}>
                      <svg width="12" height="14" viewBox="0 0 12 14" fill="none" style={{ flexShrink: 0, marginTop: 1 }}>
                        <path d="M6 0C3.243 0 1 2.243 1 5c0 3.5 5 9 5 9s5-5.5 5-9c0-2.757-2.243-5-5-5zm0 7.5A2.5 2.5 0 1 1 6 2.5a2.5 2.5 0 0 1 0 5z" fill="currentColor"/>
                      </svg>
                      {s.address}
                    </ServiceRow>
                    <ServiceRow $theme={theme}>
                      <svg width="14" height="12" viewBox="0 0 14 12" fill="none" style={{ flexShrink: 0 }}>
                        <path d="M0 2a2 2 0 012-2h7a2 2 0 012 2v1h1a2 2 0 012 2v4a2 2 0 01-2 2h-1a2 2 0 01-2 2H2a2 2 0 01-2-2V2zm2-1a1 1 0 00-1 1v7a1 1 0 001 1h7a1 1 0 001-1V2a1 1 0 00-1-1H2z" fill="currentColor"/>
                      </svg>
                      {s.delivery}
                    </ServiceRow>
                  </ServiceInfo>
                  <ServiceDot $visible={selectedService === s.id} />
                </ServiceCard>
              ))}
            </ServicesScroll>
          </Section>

          <Divider $theme={theme} />

          {/* Параметры печати */}
          <Section>
            <SectionTitle $theme={theme}>Выберите параметры печати</SectionTitle>
            <PrintSettingsCard $theme={theme}>
              <ToggleRow>
                <ToggleTexts>
                  <ToggleLabel $theme={theme}>Настроить параметры печати</ToggleLabel>
                  <ToggleHint $theme={theme}>По умолчанию выбраны стандартные параметры</ToggleHint>
                </ToggleTexts>
                <Toggle $on={customSettings} onClick={() => setCustomSettings(!customSettings)} />
              </ToggleRow>

              {customSettings && (
                <SettingsExpanded>
                  <div>
                    <FieldLabel $theme={theme}>
                      Технология печати
                      <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                        <circle cx="8" cy="8" r="7" stroke={tc} strokeWidth="1.2"/>
                        <path d="M8 7v5M8 5v1" stroke={tc} strokeWidth="1.5" strokeLinecap="round"/>
                      </svg>
                    </FieldLabel>
                    <SelectWrapper $theme={theme}>
                      <SelectValue $theme={theme}>{technology}</SelectValue>
                      <SelectChevron $theme={theme}>∨</SelectChevron>
                      <SelectNative value={technology} onChange={(e) => setTechnology(e.target.value)}>
                        {TECHNOLOGIES.map((t) => <option key={t} value={t}>{t}</option>)}
                      </SelectNative>
                    </SelectWrapper>
                  </div>

                  <div>
                    <FieldLabel $theme={theme}>Материал</FieldLabel>
                    <SelectWrapper $theme={theme}>
                      <SelectValue $theme={theme}>{material}</SelectValue>
                      <SelectChevron $theme={theme}>∨</SelectChevron>
                      <SelectNative value={material} onChange={(e) => setMaterial(e.target.value)}>
                        {MATERIALS.map((m) => <option key={m} value={m}>{m}</option>)}
                      </SelectNative>
                    </SelectWrapper>
                    <FieldHint $theme={theme}>Материал подбирается автоматически под выбранную технологию</FieldHint>
                  </div>

                  <SliderWrapper>
                    <FieldLabel $theme={theme}>Заполнение модели</FieldLabel>
                    <SliderTrack
                      ref={sliderRef}
                      type="range"
                      min={0}
                      max={100}
                      value={fillValue}
                      style={{ '--val': `${fillValue}%` } as React.CSSProperties}
                      onChange={(e) => updateSlider(Number(e.target.value))}
                    />
                    <SliderValue $theme={theme}>{fillValue}%{fillValue === 50 ? ' (стандарт)' : ''}</SliderValue>
                  </SliderWrapper>
                </SettingsExpanded>
              )}
            </PrintSettingsCard>
          </Section>

          <Divider $theme={theme} />

          {/* Контакты */}
          <Section>
            <SectionTitle $theme={theme}>Укажите контакты для связи</SectionTitle>
            <ContactsGroup>
              <ContactInput $theme={theme} placeholder="Имя" value={name} onChange={(e) => setName(e.target.value)} />
              <ContactInput $theme={theme} placeholder="Телефон" type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} />
              <ContactInput $theme={theme} placeholder="Адрес доставки" value={address} onChange={(e) => setAddress(e.target.value)} />
              <ContactInput $theme={theme} placeholder="Почта" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
            </ContactsGroup>
          </Section>

          <Divider $theme={theme} />

          {/* Модель */}
          <Section>
            <ModelCard $theme={theme}>
              <ModelRow>
                <ModelThumb src={modelImage ?? '/img/printExample.png'} alt="модель" />
                <ModelInfo>
                  <ModelName $theme={theme}>model_name.stl</ModelName>
                  <ModelDims $theme={theme}>120×85×45 мм</ModelDims>
                </ModelInfo>
                <QuantityRow>
                  <QtyBtn $theme={theme} onClick={() => setQty(Math.max(1, qty - 1))}>−</QtyBtn>
                  <QtyValue $theme={theme}>{qty}</QtyValue>
                  <QtyBtn $theme={theme} onClick={() => setQty(qty + 1)}>+</QtyBtn>
                </QuantityRow>
              </ModelRow>
              <PriceRow>
                <PriceLabel $theme={theme}>Примерная стоимость:</PriceLabel>
                <PriceValue $theme={theme}>2 400–3 100 ₽</PriceValue>
              </PriceRow>
              <PriceRow>
                <PriceLabel $theme={theme}>Примерный срок:</PriceLabel>
                <PriceValue $theme={theme}>3–5 дней</PriceValue>
              </PriceRow>
              <PriceDisclaimer $theme={theme}>
                Оценка предварительная; финальная цена и срок будут подтверждены сервисом после проверки модели
              </PriceDisclaimer>
            </ModelCard>
          </Section>

          <div style={{ height: 8 }} />
        </ScrollBody>

        <Footer>
          <SubmitBtn onClick={handleSubmit}>Отправить</SubmitBtn>
        </Footer>
      </Sheet>
    </Overlay>
  );
};
