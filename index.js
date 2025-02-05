import './shim'
import React from 'react'
import { ErrorBoundary } from 'react-error-boundary'
import { AppRegistry } from 'react-native'
import 'react-native-gesture-handler'
import { SafeAreaProvider } from 'react-native-safe-area-context'
import 'react-native-url-polyfill/auto'
import { Provider as ReduxProvider } from 'react-redux'
import { PersistGate } from 'redux-persist/integration/react'
import { name as appName } from './app.json'
import App from './src/app/App'
import { GlobalError } from './src/components/GlobalError'
import AccountStorageProvider from './src/config/storage/AccountStorageProvider'
import AppStorageProvider from './src/config/storage/AppStorageProvider'
import LanguageProvider from './src/config/storage/LanguageProvider'
import NotificationStorageProvider from './src/config/storage/NotificationStorageProvider'
import { persistor } from './src/store/persistence'
import store from './src/store/store'
import './src/utils/i18n'

// eslint-disable-next-line no-undef
if (__DEV__) {
  import('./ReactotronConfig')
}

function fallbackRender(props) {
  return (
    <SafeAreaProvider>
      <GlobalError {...props} />
    </SafeAreaProvider>
  )
}

const render = () => {
  return (
    <ErrorBoundary
      fallbackRender={fallbackRender}
      onReset={async () => {
        await persistor.purge()
      }}
    >
      <ReduxProvider store={store}>
        <PersistGate loading={null} persistor={persistor}>
          <LanguageProvider>
            <AppStorageProvider>
              <AccountStorageProvider>
                <NotificationStorageProvider>
                  <App />
                </NotificationStorageProvider>
              </AccountStorageProvider>
            </AppStorageProvider>
          </LanguageProvider>
        </PersistGate>
      </ReduxProvider>
    </ErrorBoundary>
  )
}

AppRegistry.registerComponent(appName, () => render)
