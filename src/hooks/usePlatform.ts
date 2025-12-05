import { useState, useEffect } from 'react';

export type Platform = 'android' | 'ios' | 'web';

interface PlatformInfo {
  platform: Platform;
  isNative: boolean;
  isAndroid: boolean;
  isIOS: boolean;
  isWeb: boolean;
}

export function usePlatform(): PlatformInfo {
  const [platformInfo, setPlatformInfo] = useState<PlatformInfo>({
    platform: 'web',
    isNative: false,
    isAndroid: false,
    isIOS: false,
    isWeb: true
  });

  useEffect(() => {
    const detectPlatform = (): Platform => {
      const userAgent = navigator.userAgent.toLowerCase();
      
      // Check if running in Capacitor native container
      const isCapacitor = !!(window as any).Capacitor?.isNativePlatform?.();
      
      if (isCapacitor) {
        if (userAgent.includes('android')) return 'android';
        if (userAgent.includes('iphone') || userAgent.includes('ipad')) return 'ios';
      }
      
      return 'web';
    };

    const platform = detectPlatform();
    const isNative = platform !== 'web';

    setPlatformInfo({
      platform,
      isNative,
      isAndroid: platform === 'android',
      isIOS: platform === 'ios',
      isWeb: platform === 'web'
    });
  }, []);

  return platformInfo;
}
