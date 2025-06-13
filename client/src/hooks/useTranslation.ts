import { useAppContext } from '@/contexts/AppContext';
import { translations } from '@/lib/translations';

export function useTranslation() {
  const { language } = useAppContext();

  const t = (key: string): string => {
    return translations[language][key] || key;
  };

  return { t, language };
}
