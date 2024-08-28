import React, { useEffect, useMemo, useState } from 'react'
import DaynamicQrScanner from '@components/DaynamicQrScanner'
import SafeAreaBox from '@components/SafeAreaBox'
import { URDecoder } from '@ngraveio/bc-ur'
import KeystoneSDK, { MultiAccounts, UR } from '@keystonehq/keystone-sdk'
import { RootNavigationProp } from 'src/navigation/rootTypes'
import { useNavigation } from '@react-navigation/native'
import { KeystoneAccountType } from './SelectKeystoneAccountsScreen'

const ScanQrCodeScreen = () => {
  const navigation = useNavigation<RootNavigationProp>()
  const [multiAccounts, setMultiAccounts] = useState<MultiAccounts>()
  const decoder = useMemo(() => new URDecoder(), [])
  const [isScanQrCodeComplete, setIsScanQrCodeComplete] = useState(false)
  const [progress, setProgress] = useState<number>(0)
  const handleBarCodeScanned = (qrString: string) => {
    decoder.receivePart(qrString.toLowerCase())
    setProgress(Number((decoder.getProgress() * 100).toFixed(0)))
    if (decoder.isComplete()) {
      const ur = decoder.resultUR()
      const qrCodeDataRes: MultiAccounts = new KeystoneSDK().parseMultiAccounts(
        new UR(Buffer.from(ur.cbor.toString('hex'), 'hex'), ur.type),
      )
      setProgress(100)
      setIsScanQrCodeComplete(true)
      setMultiAccounts(qrCodeDataRes)
    }
  }

  useEffect(() => {
    if (isScanQrCodeComplete) {
      const derivationAccounts: KeystoneAccountType[] = []
      multiAccounts?.keys.forEach((key) => {
        derivationAccounts.push({
          path: key.path,
          publicKey: key.publicKey,
          masterFingerprint: multiAccounts.masterFingerprint,
          device: multiAccounts.device || 'Keystone Device',
        })
      })
      setProgress(0)
      setIsScanQrCodeComplete(false)
      navigation.navigate('SelectKeystoneAccounts', {
        derivationAccounts,
      })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isScanQrCodeComplete])
  return (
    <SafeAreaBox flex={1}>
      <DaynamicQrScanner
        onBarCodeScanned={handleBarCodeScanned}
        progress={progress}
      />
    </SafeAreaBox>
  )
}

export default ScanQrCodeScreen
