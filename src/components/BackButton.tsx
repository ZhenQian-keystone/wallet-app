/* eslint-disable react/jsx-props-no-spreading */
import React from 'react'
import { BoxProps } from '@shopify/restyle'
import { Insets } from 'react-native'
import BackArrow from '@assets/svgs/backArrow.svg'
import { Color, Spacing, Theme } from '@config/theme/theme'
import { useColors } from '@config/theme/themeHooks'
import Box from './Box'
import IconPressedContainer from './IconPressedContainer'

type Props = BoxProps<Theme> & {
  color?: Color
  onPress?: () => void
  paddingHorizontal?: Spacing
  hitSlop?: Insets
}

const BackButton = ({
  color = 'primaryText',
  onPress,
  paddingHorizontal = '7',
  hitSlop,
  ...props
}: Props) => {
  const colors = useColors()

  return (
    <Box
      alignSelf="flex-start"
      paddingHorizontal={paddingHorizontal}
      alignItems="center"
      flexDirection="row"
      hitSlop={hitSlop}
      {...props}
    >
      <IconPressedContainer
        onPress={onPress}
        idleOpacity={1.0}
        activeOpacity={1.0}
      >
        <BackArrow color={colors[color]} />
      </IconPressedContainer>
    </Box>
  )
}

export default BackButton
