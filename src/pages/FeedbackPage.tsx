import { useState, FormEvent, ChangeEvent } from 'react';
import { Container } from '@salutejs/plasma-web';
import { useTranslation } from 'react-i18next';
import { Helmet } from 'react-helmet-async';
import { DsplS } from '@salutejs/plasma-typo';
import { useTheme } from '../context';
import styles from './FeedbackPage.module.css';
import { BodyM, BodyS, BodyXS, H2, Link, TextArea, TextField } from '@salutejs/plasma-giga';
import { textNegative  } from '@salutejs/plasma-themes/tokens';


interface FormData {
  name: string;
  email: string;
  comment: string;
  consentPersonalDataVersion: string;
  consentPersonalData: boolean;
  consentFeedback: boolean;
}

interface FormErrors {
  name?: string;
  email?: string;
  comment?: string;
  consentPersonalData?: string;
}

const WEBHOOK_URL = 'https://app.sbercrm.com/react-gateway/api/webhook/7d8382bd-c3a5-4f28-8a05-646c173968b9';

function FeedbackPage() {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [formData, setFormData] = useState<FormData>({
    name: '',
    email: '',
    comment: '',
    consentPersonalDataVersion: '',
    consentPersonalData: false,
    consentFeedback: false,
  });
  const [errors, setErrors] = useState<FormErrors>({});

  const validateEmail = (email: string): boolean => {
    if (!email) return true; // Email is optional
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Имя обязательно для заполнения';
    }

    if (formData.email && !validateEmail(formData.email)) {
      newErrors.email = 'Введите корректный email адрес';
    }

    if (!formData.comment.trim()) {
      newErrors.comment = 'Комментарий обязателен для заполнения';
    }

    if (!formData.consentPersonalData) {
      newErrors.consentPersonalData = 'Необходимо согласие на обработку персональных данных';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    // Clear error when user starts typing
    if (errors[name as keyof FormErrors]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  const handleCheckboxChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    setFormData((prev) => ({ ...prev, [name]: checked }));
    if (name === 'consentPersonalData' && checked) {
      setErrors((prev) => ({ ...prev, consentPersonalData: undefined }));
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    // const id = crypto.randomUUID();
    const payload = {
      name: 'Kandinsky3d',
      e_mail$c: formData.email || '',
      fio$c: formData.name,
      kommentarij$c: formData.comment,
      obrabotka_pdn$c: formData.consentPersonalDataVersion,
      pdn_version$c: "",
      soglasie_na_poluchenie_obratnoj_svyazi$c: formData.consentFeedback,
    };

    try {
      await fetch(WEBHOOK_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      setIsSubmitted(true);
    } catch (error) {
      console.error('Error submitting feedback:', error);
      setIsSubmitted(true);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSubmitted) {
    return (
      <Container className={styles.container} data-theme={theme}>
        <Helmet>
          <title>{t('Обратная связь')}</title>
          <meta name="description" content={t('Обратная связь - Kandinsky3d')} />
        </Helmet>
        <Container style={{ margin: '0 auto' }}>
          <div>
            <H2>Спасибо за ваше сообщение!</H2>
            <BodyM>Мы получили ваш отзыв и свяжемся с вами в ближайшее время.</BodyM>
          </div>
        </Container>
      </Container>
    );
  }

  return (
    <>
      <Helmet>
        <title>{t('Обратная связь')}</title>
        <meta name="description" content={t('Обратная связь - Kandinsky3d')} />
        <meta property="og:title" content={t('Обратная связь - Kandinsky3d')} />
        <meta property="og:url" content="https://kandinsky3d.sberdevices.ru/feedback" />
      </Helmet>

      <Container className={styles.container} data-theme={theme}>
        <Container style={{ margin: '0 auto' }}>
          <DsplS className={styles.header}>{t('Обратная связь')}</DsplS>

          <div className={styles.formWrapper}>
            <form onSubmit={handleSubmit}>
              <div className={styles.formGroup}>
                <BodyM >
                  Имя<span className={styles.required}>*</span>
                </BodyM>
                <TextField
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="Введите ваше имя"
                />
                {errors.name && <BodyXS color={textNegative} >{errors.name}</BodyXS>}
              </div>

              <div className={styles.formGroup}>
                <BodyM>E-mail{formData.consentFeedback && <span className={styles.required}>*</span>}</BodyM>
                <TextField
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder="example@mail.com"
                />
                {errors.email && <BodyXS color={textNegative} >{errors.email}</BodyXS>}
              </div>

              <div className={styles.formGroup}>
                <BodyM >
                  Комментарий<span className={styles.required}>*</span>
                </BodyM>
                <TextArea
                  name="comment"
                  value={formData.comment}
                  onChange={handleInputChange}
                  className={` ${errors.comment ? styles.inputError : ''}`}
                  placeholder="Напишите ваш комментарий или вопрос"
                />
                {errors.comment && <BodyXS color={textNegative}>{errors.comment}</BodyXS>}
              </div>

              <div className={styles.checkboxGroup}>
                <input
                  type="checkbox"
                  id="consentPersonalData"
                  name="consentPersonalData"
                  checked={formData.consentPersonalData}
                  onChange={handleCheckboxChange}
                  className={styles.checkbox}
                />
                <BodyS >
                  Даю согласие на <Link style={{color: '#0088FF'}} target='_blank' href='https://www.sberbank.ru/privacy/policy'> обработку персональных данных</Link> <span className={styles.required}>*</span>
                </BodyS>
              </div>
              {errors.consentPersonalData && <BodyXS color={textNegative}>{errors.consentPersonalData}</BodyXS>}

              <div className={styles.checkboxGroup}>
                <input
                  type="checkbox"
                  id="consentFeedback"
                  name="consentFeedback"
                  checked={formData.consentFeedback}
                  onChange={handleCheckboxChange}
                  className={styles.checkbox}
                />
                <BodyS >
                  Даю согласие на получение обратной связи
                </BodyS>
              </div>

              <button type="submit" className={styles.submitButton} disabled={isSubmitting || !formData.consentPersonalData}>
                <BodyM>{isSubmitting ? 'Отправка...' : 'Отправить'}</BodyM>
              </button>
            </form>
          </div>
        </Container>
      </Container>
    </>
  );
}

export default FeedbackPage;
