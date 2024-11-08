import React, { ReactNode } from 'react'
import { ViewStyle } from 'react-native'
import Box from './Box'
import Text from './Text'

type Props = {
  children?: ReactNode
  color?: string
  style?: ViewStyle
}
const Bullet = ({ children, color = 'black', style = {} }: Props) => (
  <Box
    flexDirection="row"
    alignItems="flex-start"
    marginBottom="2"
    style={style}
  >
    <Text
      variant="textSmRegular"
      style={{ color }}
      fontSize={24}
      lineHeight={22}
      marginRight="2"
    >
      &bull;
    </Text>
    <Text variant="textSmRegular" color="gray.500" width="90%">
      {children}
    </Text>
  </Box>
)

export default Bullet
