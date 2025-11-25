import { useCallback, useEffect, useMemo, useState } from "react";

type MainButtonOptions = {
  text: string;
  isVisible?: boolean;
};

export function useTelegramWebApp() {
  const [webApp, setWebApp] = useState<TelegramWebApp | null>(null);
  const [colorScheme, setColorScheme] = useState<TelegramColorScheme>("light");
  const [user, setUser] = useState<TelegramInitUser | undefined>();

  useEffect(() => {
    const app = window.Telegram?.WebApp;
    if (!app) return;

    app.ready();
    app.expand();
    setWebApp(app);
    setColorScheme(app.colorScheme);
    setUser(app.initDataUnsafe?.user);

    const handleThemeChange = () => setColorScheme(app.colorScheme);

    app.onEvent("themeChanged", handleThemeChange);
    return () => {
      app.offEvent("themeChanged", handleThemeChange);
    };
  }, []);

  useEffect(() => {
    if (!webApp) return;
    const bgColor = webApp.themeParams?.bg_color;
    if (bgColor) {
      document.body.style.backgroundColor = bgColor;
    }
  }, [webApp, colorScheme]);

  const sendPayload = useCallback(
    (payload: unknown) => {
      if (!webApp) return;
      webApp.sendData(JSON.stringify(payload));
    },
    [webApp]
  );

  const configureMainButton = useCallback(
    ({ text, isVisible = true }: MainButtonOptions) => {
      if (!webApp) return;
      webApp.MainButton.setText(text);
      if (isVisible) {
        webApp.MainButton.show();
        webApp.MainButton.enable();
      } else {
        webApp.MainButton.hide();
      }
    },
    [webApp]
  );

  const registerMainButtonClick = useCallback(
    (handler: () => void) => {
      if (!webApp) return undefined;
      webApp.onEvent("mainButtonClicked", handler);
      return () => {
        webApp.offEvent("mainButtonClicked", handler);
      };
    },
    [webApp]
  );

  return useMemo(
    () => ({
      webApp,
      user,
      colorScheme,
      isTelegram: Boolean(webApp),
      sendPayload,
      configureMainButton,
      registerMainButtonClick,
    }),
    [colorScheme, configureMainButton, registerMainButtonClick, sendPayload, user, webApp]
  );
}

