import React, { useCallback, useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigation } from '@react-navigation/native'
import Text from '@components/Text'
import PinDisplay from '@components/PinDisplay'
import Keypad from '@components/Keypad'
import Box from '@components/Box'
import { KeypadInput } from '@components/KeypadButton'
import { ThemeProvider } from '@shopify/restyle'
import { darkTheme } from '@config/theme/theme'
import { SettingsNavigationProp } from './settingsTypes'

const SettingsCreatePinScreen = () => {
  const { t } = useTranslation()
  const navigation = useNavigation<SettingsNavigationProp>()

  const [pin, setPin] = useState('')

  useEffect(() => {
    if (pin.length === 6) {
      navigation.navigate('SettingsConfirmPin', {
        pin,
        action: 'create',
      })
    }
  }, [pin, navigation])

  useEffect(() => {
    return navigation.addListener('blur', () => {
      setPin('')
    })
  }, [navigation])

  const handlePress = useCallback((input?: KeypadInput) => {
    if (typeof input === 'number') {
      setPin((val) => (val.length < 6 ? val + input : val))
    } else if (input === 'backspace') {
      setPin((val) => val.slice(0, -1))
    } else {
      setPin('')
    }
  }, [])

  return (
    <Box
      backgroundColor="primaryBackground"
      flex={1}
      paddingHorizontal="8"
      justifyContent="center"
      alignItems="center"
    >
      <Box flex={1} />
      <Text
        marginBottom="4"
        variant="displayMdRegular"
        maxFontSizeMultiplier={1}
        numberOfLines={1}
        adjustsFontSizeToFit
        color="primaryText"
      >
        {t('accountSetup.createPin.title')}
      </Text>

      <Text
        variant="textMdRegular"
        maxFontSizeMultiplier={1.2}
        color="secondaryText"
      >
        {t('accountSetup.createPin.subtitle')}
      </Text>
      <PinDisplay length={pin.length} marginVertical="8" />
      <Keypad flex={2} customButtonType="cancel" onPress={handlePress} />
      <Box flex={1} />
    </Box>
  )
}

const SettingsCreatePinScreenWrapper = () => {
  return (
    <ThemeProvider theme={darkTheme}>
      <SettingsCreatePinScreen />
    </ThemeProvider>
  )
}

export default SettingsCreatePinScreenWrapper
