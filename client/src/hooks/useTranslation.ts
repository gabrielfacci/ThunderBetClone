import { useAuth } from '@/contexts/AuthContext';
import { translations } from '@/lib/translations';

export function useTranslation() {
  const { language } = useAuth();

  const t = (key: string): string => {
    return translations[language][key] || key;
  };

  return { t, language };
}
