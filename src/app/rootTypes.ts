import { LinkWalletRequest, SignHotspotRequest } from '@helium/wallet-link'
import { StackNavigationProp } from '@react-navigation/stack'
import { KeystoneAccountType } from 'src/features/keystone/SelectKeystoneAccountsScreen'
import { PaymentRouteParam } from 'src/app/services/WalletService'
import {
  SignAllTransactionsMethod,
  ConnectMethod,
  DisconnectMethod,
  SignMessageMethod,
  SignTransactionMethod,
  SignAndSendTransactionMethod,
} from '@features/provider-methods/utils'

export type RootStackParamList = {
  OnboardingNavigator: undefined
  ServiceSheetNavigator: undefined
  LinkWallet: LinkWalletRequest
  SignHotspot: SignHotspotRequest & { submit?: boolean }
  PaymentScreen: undefined | PaymentRouteParam
  RequestScreen: undefined
  DappLoginScreen: { uri: string; callback: string }
  ImportPrivateKey: { key?: string }
  SelectKeystoneAccounts: { derivationAccounts: KeystoneAccountType[] }
  ScanQrCode: undefined
  Connect: ConnectMethod
  Disconnect: DisconnectMethod
  SignTransaction: SignTransactionMethod
  SignMessage: SignMessageMethod
  SignAndSendTransaction: SignAndSendTransactionMethod
  SignAllTransactions: SignAllTransactionsMethod
}

export type TabBarStackParamList = {
  Home: undefined
  Collectables: undefined
  Swaps: undefined
  Activity: undefined
  Governance: undefined
  NotificationsNavigator: undefined
}

export type RootNavigationProp = StackNavigationProp<RootStackParamList>
export type TabBarNavigationProp = StackNavigationProp<TabBarStackParamList>
