export {};

type TelegramColorScheme = "light" | "dark";

interface TelegramInitUser {
  id: number;
  first_name?: string;
  last_name?: string;
  username?: string;
  language_code?: string;
}

interface TelegramThemeParams {
  bg_color?: string;
  text_color?: string;
  hint_color?: string;
  link_color?: string;
  button_color?: string;
  button_text_color?: string;
  secondary_bg_color?: string;
}

interface TelegramWebAppMainButton {
  text: string;
  isVisible: boolean;
  setText(text: string): TelegramWebAppMainButton;
  show(): TelegramWebAppMainButton;
  hide(): TelegramWebAppMainButton;
  enable(): TelegramWebAppMainButton;
  disable(): TelegramWebAppMainButton;
}

interface TelegramWebApp {
  initData: string;
  initDataUnsafe: {
    user?: TelegramInitUser;
    query_id?: string;
    auth_date?: string;
    hash?: string;
  };
  colorScheme: TelegramColorScheme;
  themeParams: TelegramThemeParams;
  ready(): void;
  expand(): void;
  close(): void;
  sendData(data: string): void;
  onEvent(event: "themeChanged" | "mainButtonClicked", handler: () => void): void;
  offEvent(event: "themeChanged" | "mainButtonClicked", handler: () => void): void;
  MainButton: TelegramWebAppMainButton;
}

declare global {
  interface Window {
    Telegram?: {
      WebApp: TelegramWebApp;
    };
  }
}

