import {
  StackNavigationOptions,
  createStackNavigator,
} from '@react-navigation/stack'
import { useColors } from '@theme/themeHooks'
import React, { memo, useEffect, useMemo } from 'react'
import changeNavigationBarColor from 'react-native-navigation-bar-color'
import ServiceSheetNavigator from '@services/ServiceSheetNavigator'
import { useAccountStorage } from '@storage/AccountStorageProvider'
import ScanQrCodeScreen from '../features/keystone/ScanQrCodeScreen'
import SelectKeystoneAccountsScreen from '../features/keystone/SelectKeystoneAccountsScreen'
import DappLoginScreen from '../features/dappLogin/DappLoginScreen'
import OnboardingNavigator from '../features/onboarding/OnboardingNavigator'
import ImportPrivateKey from '../features/onboarding/import/ImportPrivateKey'
import PaymentScreen from '../features/payment/PaymentScreen'
import LinkWallet from '../features/txnDelegation/LinkWallet'
import SignHotspot from '../features/txnDelegation/SignHotspot'
import { RootStackParamList } from './rootTypes'

const screenOptions = { headerShown: false } as StackNavigationOptions

const RootNavigator = () => {
  const { currentAccount } = useAccountStorage()
  const colors = useColors()
  const RootStack = createStackNavigator<RootStackParamList>()

  useEffect(() => {
    if (currentAccount) {
      changeNavigationBarColor(colors.primaryText, true, false)
    } else {
      changeNavigationBarColor(colors.primaryBackground, true, false)
    }
  }, [colors, currentAccount])

  const initialRouteName = useMemo(() => {
    return currentAccount ? 'ServiceSheetNavigator' : 'OnboardingNavigator'
  }, [currentAccount])

  return (
    <RootStack.Navigator
      screenOptions={screenOptions}
      initialRouteName={initialRouteName}
    >
      <RootStack.Screen
        name="ServiceSheetNavigator"
        component={ServiceSheetNavigator}
        options={screenOptions}
      />
      <RootStack.Screen
        key="OnboardingNavigator"
        name="OnboardingNavigator"
        component={OnboardingNavigator}
        options={screenOptions}
      />
      <RootStack.Screen
        name="LinkWallet"
        component={LinkWallet}
        options={screenOptions}
      />
      <RootStack.Screen
        name="SignHotspot"
        component={SignHotspot}
        options={screenOptions}
      />
      <RootStack.Screen
        name="PaymentScreen"
        component={PaymentScreen}
        options={screenOptions}
      />
      <RootStack.Screen
        name="DappLoginScreen"
        component={DappLoginScreen}
        options={screenOptions}
      />
      <RootStack.Screen
        name="ImportPrivateKey"
        component={ImportPrivateKey}
        options={screenOptions}
      />
      <RootStack.Screen
        name="SelectKeystoneAccounts"
        component={SelectKeystoneAccountsScreen}
        options={{
          headerShown: false,
        }}
      />
      <RootStack.Screen
        name="ScanQrCode"
        component={ScanQrCodeScreen}
        options={screenOptions}
      />
    </RootStack.Navigator>
  )
}

export default memo(RootNavigator)
