import React, {
  memo,
  ReactNode,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from 'react'
import { View } from 'react-native'
import InfoWarning from '@assets/svgs/warning.svg'
import { useTranslation } from 'react-i18next'
import Animated, {
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated'
import globalStyles from '@config/theme/globalStyles'
import { useColors } from '@config/theme/themeHooks'
import Text from './Text'
import Box from './Box'
import ButtonPressable from './ButtonPressable'
import {
  parseSolanaStatus,
  useGetSolanaStatusQuery,
} from '../store/slices/solanaStatusApi'
import ScrollBox from './ScrollBox'

const TreausuryWarningScreen = ({ children }: { children: ReactNode }) => {
  const { t } = useTranslation()
  const animValue = useSharedValue(1)
  const [animationComplete, setAnimationComplete] = useState(false)
  const { data: status } = useGetSolanaStatusQuery(undefined)
  const { primaryBackground } = useColors()

  const realStatus = useMemo(() => parseSolanaStatus(status), [status])

  const animationCompleted = useCallback(() => {
    setAnimationComplete(true)
  }, [])

  useEffect(() => {
    if (!realStatus?.treasuryWarning) {
      setAnimationComplete(true)
    } else {
      setAnimationComplete(false)
    }
  }, [realStatus])

  const style = useAnimatedStyle(() => {
    let animVal = animValue.value

    if (animValue.value === 0) {
      animVal = withTiming(
        animValue.value,
        { duration: 300 },
        runOnJS(animationCompleted),
      )
    }
    return {
      top: 0,
      bottom: 0,
      left: 0,
      right: 0,
      position: 'absolute',
      opacity: animVal,
    }
  })

  const handleClose = useCallback(() => {
    animValue.value = 0
  }, [animValue])

  return (
    <View style={globalStyles.container}>
      {children}
      {!animationComplete && (
        <Animated.View style={style}>
          <ScrollBox
            style={{
              backgroundColor: primaryBackground,
              flexGrow: 1,
            }}
            contentContainerStyle={{
              flexGrow: 1,
              justifyContent: 'center',
            }}
          >
            <Box
              backgroundColor="primaryBackground"
              flex={1}
              justifyContent="center"
              paddingHorizontal="8"
              height="100%"
            >
              <Box justifyContent="center" alignItems="center" marginBottom="8">
                <InfoWarning height={80} width={80} />
              </Box>
              <Text
                variant="displayMdRegular"
                textAlign="center"
                fontSize={40}
                adjustsFontSizeToFit
                lineHeight={42}
              >
                {t('swapsScreen.treasurySwapWarningTitle')}
              </Text>

              <Text
                variant="textXlMedium"
                color="secondaryText"
                textAlign="center"
                marginTop="4"
                marginHorizontal="6"
                adjustsFontSizeToFit
              >
                {t('swapsScreen.treasurySwapWarningBody')}
              </Text>

              <ButtonPressable
                borderRadius="full"
                onPress={handleClose}
                backgroundColor="primaryText"
                backgroundColorOpacityPressed={0.7}
                backgroundColorDisabled="bg.tertiary"
                backgroundColorDisabledOpacity={0.5}
                titleColorDisabled="gray.800"
                titleColor="primaryText"
                fontWeight="500"
                title={t('swapsScreen.understood')}
                marginTop="6"
              />
            </Box>
          </ScrollBox>
        </Animated.View>
      )}
    </View>
  )
}

export default memo(TreausuryWarningScreen)
