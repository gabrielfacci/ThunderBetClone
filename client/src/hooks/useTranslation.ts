import { translations } from '@/lib/translations';

export function useTranslation() {
  // Por enquanto usando português fixo - pode ser expandido com Context de idioma separado
  const language = 'pt';

  const t = (key: string): string => {
    return (translations[language] as any)[key] || key;
  };

  return { t, language };
}
