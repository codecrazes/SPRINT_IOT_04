import React from 'react';
import { ThemeProvider } from '@theme/ThemeContext';
import { AuthProvider } from '@context/AuthContext';
import AppNavigator from '@navigation/index';
import I18nProvider from '@i18n/I18nProvider';
import NotificationsProvider from '@notifications/NotificationsProvider';

const App: React.FC = () => {
  return (
    <I18nProvider>
      <ThemeProvider>
        <AuthProvider>
          <NotificationsProvider>
            <AppNavigator />
          </NotificationsProvider>
        </AuthProvider>
      </ThemeProvider>
    </I18nProvider>
  );
};

export default App;
