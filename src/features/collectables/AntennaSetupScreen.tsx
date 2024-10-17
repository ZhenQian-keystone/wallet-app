import React, { useEffect, useState, useMemo, useCallback, memo } from 'react'
import BackScreen from '@components/BackScreen'
import { ReAnimatedBox } from '@components/AnimatedBox'
import Box from '@components/Box'
import ButtonPressable from '@components/ButtonPressable'
import CircleLoader from '@components/CircleLoader'
import SafeAreaBox from '@components/SafeAreaBox'
import Text from '@components/Text'
import TextInput from '@components/TextInput'
import useSubmitTxn from '@hooks/useSubmitTxn'
import { RouteProp, useNavigation, useRoute } from '@react-navigation/native'
import { useTranslation } from 'react-i18next'
import {
  KeyboardAvoidingView,
  Keyboard,
  TouchableWithoutFeedback,
} from 'react-native'
import { useEntityKey } from '@hooks/useEntityKey'
import { useIotInfo } from '@hooks/useIotInfo'
import { Edge } from 'react-native-safe-area-context'
import { DelayedFadeIn } from '@components/FadeInOut'
import {
  CollectableNavigationProp,
  CollectableStackParamList,
} from './collectablesTypes'
import { parseH3BNLocation } from '../../utils/h3'
import * as Logger from '../../utils/logger'

const BUTTON_HEIGHT = 65
type Route = RouteProp<CollectableStackParamList, 'AntennaSetupScreen'>
const AntennaSetupScreen = () => {
  const { t } = useTranslation()
  const nav = useNavigation<CollectableNavigationProp>()
  const route = useRoute<Route>()
  const { collectable } = route.params
  const entityKey = useEntityKey(collectable)
  const iotInfoAcc = useIotInfo(entityKey)
  const safeEdges = useMemo(() => ['bottom'] as Edge[], [])
  const [hasSetDefaults, setHasSetDefaults] = useState(false)
  const [gain, setGain] = useState<string>()
  const [elevation, setElevation] = useState<string>()
  const [updating, setUpdating] = useState(false)
  const [transactionError, setTransactionError] = useState<string>()
  const { submitUpdateEntityInfo } = useSubmitTxn()

  const iotLocation = useMemo(() => {
    if (!iotInfoAcc?.info?.location) {
      return undefined
    }

    return parseH3BNLocation(iotInfoAcc.info.location).reverse()
  }, [iotInfoAcc])

  useEffect(() => {
    if (!hasSetDefaults && iotInfoAcc?.info) {
      if (iotInfoAcc?.info?.gain) {
        setGain(`${iotInfoAcc?.info?.gain / 10}`)
      }

      if (iotInfoAcc?.info?.elevation) {
        setElevation(`${iotInfoAcc?.info?.elevation}`)
      }

      setHasSetDefaults(true)
    }
  }, [iotInfoAcc, setGain, setElevation, hasSetDefaults, setHasSetDefaults])

  const handleUpdateElevGain = useCallback(async () => {
    if (iotLocation && entityKey) {
      setTransactionError(undefined)
      setUpdating(true)
      try {
        await submitUpdateEntityInfo({
          type: 'IOT',
          entityKey,
          lng: iotLocation[0],
          lat: iotLocation[1],
          elevation,
          decimalGain: gain,
        })
        nav.push('SettingUpAntennaScreen')
      } catch (error) {
        setUpdating(false)
        Logger.error(error)
        setTransactionError((error as Error).message)
      }
    }
  }, [
    iotLocation,
    entityKey,
    elevation,
    gain,
    setUpdating,
    setTransactionError,
    submitUpdateEntityInfo,
    nav,
  ])

  const showError = useMemo(() => {
    if (transactionError) return transactionError
  }, [transactionError])

  return (
    <ReAnimatedBox flex={1} entering={DelayedFadeIn}>
      <BackScreen
        headerTopMargin="6xl"
        padding="0"
        title={t('antennaSetupScreen.title')}
        edges={[]}
      >
        <TouchableWithoutFeedback onPress={() => Keyboard.dismiss()}>
          <KeyboardAvoidingView style={{ flex: 1 }} behavior="padding">
            <SafeAreaBox
              edges={safeEdges}
              backgroundColor="transparent"
              flex={1}
              padding="4"
              marginHorizontal="2"
              marginVertical="xs"
            >
              <Box flexGrow={1} justifyContent="center">
                <Text
                  textAlign="left"
                  variant="textLgMedium"
                  adjustsFontSizeToFit
                >
                  {t('antennaSetupScreen.antennaSetup')}
                </Text>
                <Text
                  variant="textSmMedium"
                  color="secondaryText"
                  marginBottom="4"
                >
                  {t('antennaSetupScreen.antennaSetupDescription')}
                </Text>
                <Box
                  width="100%"
                  backgroundColor="secondaryBackground"
                  borderRadius="2xl"
                  paddingVertical="xs"
                >
                  <TextInput
                    variant="transparent"
                    floatingLabel={`${t('antennaSetupScreen.gainPlaceholder')}`}
                    textInputProps={{
                      placeholder: t('antennaSetupScreen.gainPlaceholder'),
                      onChangeText: setGain,
                      value: gain,
                      keyboardType: 'decimal-pad',
                    }}
                  />
                  <Box
                    height={2}
                    width="100%"
                    backgroundColor="primaryBackground"
                  />
                  <TextInput
                    variant="transparent"
                    floatingLabel={`${t(
                      'antennaSetupScreen.elevationPlaceholder',
                    )}`}
                    textInputProps={{
                      placeholder: t('antennaSetupScreen.elevationPlaceholder'),
                      onChangeText: setElevation,
                      value: elevation,
                      keyboardType: 'decimal-pad',
                    }}
                  />
                </Box>
              </Box>
              <Box
                flexDirection="row"
                justifyContent="center"
                alignItems="center"
                marginVertical="2"
                minHeight={40}
              >
                {showError && (
                  <Text variant="textXsMedium" color="error.500">
                    {showError}
                  </Text>
                )}
              </Box>
              <Box>
                <ButtonPressable
                  height={BUTTON_HEIGHT}
                  flexGrow={1}
                  borderRadius="full"
                  backgroundColor="primaryText"
                  backgroundColorOpacityPressed={0.7}
                  title={updating ? '' : t('antennaSetupScreen.submit')}
                  titleColor="primaryBackground"
                  onPress={handleUpdateElevGain}
                  TrailingComponent={
                    updating ? (
                      <CircleLoader loaderSize={20} color="primaryBackground" />
                    ) : undefined
                  }
                />
              </Box>
            </SafeAreaBox>
          </KeyboardAvoidingView>
        </TouchableWithoutFeedback>
      </BackScreen>
    </ReAnimatedBox>
  )
}

export default memo(AntennaSetupScreen)
