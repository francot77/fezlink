import { useState, useCallback } from 'react';
import { TabType } from '../components/TabsNavigation';

interface UseAppearanceProps {
  initialTab?: TabType;
}

export function useAppearance({ initialTab = 'colors' }: UseAppearanceProps = {}) {
  const [activeTab, setActiveTab] = useState<TabType>(initialTab);
  const [uploading, setUploading] = useState(false);

  const handleFileUpload = useCallback(async (
    file: File,
    onSuccess: (url: string) => void
  ) => {
    if (!file) return;

    setUploading(true);
    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await fetch('/api/background-image', {
        method: 'POST',
        body: formData,
      });
      const data = await res.json();
      if (data.url) {
        onSuccess(data.url);
      }
    } catch (error) {
      console.error('Error uploading background image:', error);
    } finally {
      setUploading(false);
    }
  }, []);

  return {
    activeTab,
    setActiveTab,
    uploading,
    handleFileUpload,
  };
}
