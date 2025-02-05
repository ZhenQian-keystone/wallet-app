import React, { memo, useCallback, useMemo } from 'react'
import useCopyText from '@hooks/useCopyText'
import { useAccountStorage } from '@config/storage/AccountStorageProvider'
import useHaptic from '@hooks/useHaptic'
import { ellipsizeAddress } from '@utils/accountUtils'
import { ViewStyle } from 'react-native'
import { useColors, useSpacing } from '@config/theme/themeHooks'
import { BoxProps } from '@shopify/restyle'
import { Theme } from '@config/theme/theme'
import CopyAddress from '@assets/svgs/copyAddress.svg'
import ButtonPressAnimation from './ButtonPressAnimation'
import Text from './Text'
import Box from './Box'

const CopyAddressPill = ({ ...rest }: BoxProps<Theme>) => {
  const copyText = useCopyText()
  const { currentAccount } = useAccountStorage()
  const { triggerImpact } = useHaptic()
  const spacing = useSpacing()
  const { secondaryText } = useColors()

  const handleCopyAddress = useCallback(() => {
    if (!currentAccount?.solanaAddress) return

    triggerImpact('light')
    copyText({
      message: ellipsizeAddress(currentAccount?.solanaAddress),
      copyText: currentAccount?.solanaAddress,
    })
  }, [copyText, currentAccount?.solanaAddress, triggerImpact])

  const CopyAddressStyles = useMemo(() => {
    return {
      flexDirection: 'row',
      justifyContent: 'center',
      alignItems: 'center',
      paddingVertical: spacing[2],
      paddingHorizontal: spacing[4],
    } as ViewStyle
  }, [spacing])

  return (
    <Box flexDirection="column" alignItems="center" {...rest}>
      <ButtonPressAnimation
        backgroundColor="cardBackground"
        borderColor="border.primary"
        borderWidth={1}
        borderRadius="full"
        marginBottom="6"
        onPress={handleCopyAddress}
        pressableStyles={CopyAddressStyles}
      >
        <Text
          variant="textSmRegular"
          color="secondaryText"
          numberOfLines={1}
          adjustsFontSizeToFit
          maxFontSizeMultiplier={1.2}
          textAlign="center"
          marginEnd="2"
        >
          {ellipsizeAddress(currentAccount?.solanaAddress || '', {
            numChars: 6,
          })}
        </Text>
        <CopyAddress width={16} height={16} color={secondaryText} />
      </ButtonPressAnimation>
    </Box>
  )
}

export default memo(CopyAddressPill)
