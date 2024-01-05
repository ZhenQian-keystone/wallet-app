import Checkmark from '@assets/images/checkmark.svg'
import Box from '@components/Box'
import ButtonPressable from '@components/ButtonPressable'
import Text from '@components/Text'
import {
  BottomSheetBackdrop,
  BottomSheetModal,
  BottomSheetModalProvider,
  BottomSheetScrollView,
} from '@gorhom/bottom-sheet'
import { useSolOwnedAmount } from '@helium/helium-react-hooks'
import { useBN } from '@hooks/useBN'
import { useCurrentWallet } from '@hooks/useCurrentWallet'
import { useRentExempt } from '@hooks/useRentExempt'
import { LAMPORTS_PER_SOL } from '@solana/web3.js'
import { useColors, useOpacity } from '@theme/themeHooks'
import BN from 'bn.js'
import React, {
  Ref,
  forwardRef,
  memo,
  useCallback,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
} from 'react'
import { useTranslation } from 'react-i18next'
import { ScrollView } from 'react-native-gesture-handler'
import { useSharedValue } from 'react-native-reanimated'
import WalletSignBottomSheetTransaction from './WalletSignBottomSheetTransaction'
import {
  WalletSignBottomSheetProps,
  WalletSignBottomSheetRef,
  WalletSignOpts,
  WalletStandardMessageTypes,
} from './walletSignBottomSheetTypes'

let promiseResolve: (value: boolean | PromiseLike<boolean>) => void

const WalletSignBottomSheet = forwardRef(
  (
    { onClose, children }: WalletSignBottomSheetProps,
    ref: Ref<WalletSignBottomSheetRef>,
  ) => {
    useImperativeHandle(ref, () => ({ show, hide }))
    const { rentExempt } = useRentExempt()
    const { backgroundStyle } = useOpacity('surfaceSecondary', 1)
    const { secondaryText } = useColors()
    const { t } = useTranslation()
    const wallet = useCurrentWallet()
    const solBalance = useBN(useSolOwnedAmount(wallet).amount)
    const bottomSheetModalRef = useRef<BottomSheetModal>(null)
    const [totalSolFeeByTx, setTotalSolFeeByTx] = useState<number[]>([])
    const [isVisible, setIsVisible] = useState(false)
    const [nestedInsufficentFunds, setNestedInsufficentFunds] = useState(false)
    const [walletSignOpts, setWalletSignOpts] = useState<WalletSignOpts>({
      type: WalletStandardMessageTypes.connect,
      url: '',
      additionalMessage: '',
      serializedTxs: undefined,
      header: undefined,
    })

    const itemsPerPage = 5
    const [currentPage, setCurrentPage] = useState(1)
    const [currentTxs, hasMore] = useMemo(() => {
      const totalPages = Math.ceil(
        (walletSignOpts?.serializedTxs?.length || 0) / itemsPerPage,
      )
      const more = currentPage < totalPages
      let scopedTxs

      if (walletSignOpts.serializedTxs) {
        const endIndex = currentPage * itemsPerPage
        scopedTxs = walletSignOpts.serializedTxs.slice(0, endIndex)
      }

      return [scopedTxs, more]
    }, [walletSignOpts, currentPage])

    const handleLoadMore = useCallback(() => {
      setCurrentPage((page) => page + 1)
    }, [setCurrentPage])

    const totalSolFee = useMemo(
      () => totalSolFeeByTx.reduce((a, b) => a + b, 0),
      [totalSolFeeByTx],
    )
    const estimatedTotalSolByLamports = useMemo(() => {
      const { serializedTxs } = walletSignOpts

      if (serializedTxs) {
        if (currentTxs && currentTxs.length < serializedTxs.length) {
          // we have unsimulated transactions, do rough estimate
          const diff = serializedTxs.length - currentTxs.length
          return (totalSolFee + diff * 5000) / LAMPORTS_PER_SOL
        }

        return totalSolFee / LAMPORTS_PER_SOL
      }

      return 5000 / LAMPORTS_PER_SOL
    }, [walletSignOpts, totalSolFee, currentTxs])

    const insufficientRentExempt = useMemo(() => {
      if (solBalance) {
        return new BN(solBalance.toString())
          .sub(new BN(estimatedTotalSolByLamports))
          .lt(new BN(rentExempt || 0))
      }
    }, [solBalance, estimatedTotalSolByLamports, rentExempt])

    const insufficientFunds = useMemo(
      () =>
        nestedInsufficentFunds ||
        new BN(estimatedTotalSolByLamports).gt(
          new BN(solBalance?.toString() || '0'),
        ),
      [solBalance, estimatedTotalSolByLamports, nestedInsufficentFunds],
    )

    const animatedContentHeight = useSharedValue(0)

    const hide = useCallback(() => {
      setIsVisible(false)
      setNestedInsufficentFunds(false)
      bottomSheetModalRef.current?.close()
    }, [])

    const show = useCallback(
      ({
        type,
        url,
        warning,
        additionalMessage,
        serializedTxs,
        header,
      }: WalletSignOpts) => {
        bottomSheetModalRef.current?.expand()
        setTotalSolFeeByTx(new Array(serializedTxs?.length || 0).fill(5000))
        setIsVisible(true)
        setWalletSignOpts({
          type,
          url,
          warning,
          additionalMessage,
          serializedTxs,
          header,
        })
        const p = new Promise<boolean>((resolve) => {
          promiseResolve = resolve
        })
        return p
      },
      [],
    )

    const renderBackdrop = useCallback(
      (props) => (
        <BottomSheetBackdrop
          disappearsOnIndex={-1}
          appearsOnIndex={0}
          // eslint-disable-next-line react/jsx-props-no-spreading
          {...props}
        />
      ),
      [],
    )

    const handleModalDismiss = useCallback(() => {
      if (promiseResolve) {
        promiseResolve(false)
      }
      // We need to re present the bottom sheet after it is dismissed so that it can be expanded again
      bottomSheetModalRef.current?.present()
      setIsVisible(false)
      setNestedInsufficentFunds(false)
      if (onClose) {
        onClose()
      }
    }, [onClose])

    const handleIndicatorStyle = useMemo(() => {
      return {
        backgroundColor: secondaryText,
      }
    }, [secondaryText])

    const onAcceptHandler = useCallback(() => {
      if (promiseResolve) {
        hide()
        promiseResolve(true)
      }
    }, [hide])

    const onCancelHandler = useCallback(() => {
      if (promiseResolve) {
        hide()
        promiseResolve(false)
      }
    }, [hide])

    const incrementTotalSolFee = useCallback(
      (idx: number, fee: number) => {
        setTotalSolFeeByTx((current) =>
          current.map((item, index) => (index === idx ? fee : item)),
        )
      },
      [setTotalSolFeeByTx],
    )

    useEffect(() => {
      bottomSheetModalRef.current?.present()
    }, [bottomSheetModalRef])

    const { type, warning, additionalMessage } = walletSignOpts
    return (
      <Box flex={1}>
        <BottomSheetModalProvider>
          <BottomSheetModal
            ref={bottomSheetModalRef}
            index={-1}
            backgroundStyle={backgroundStyle}
            backdropComponent={renderBackdrop}
            onDismiss={handleModalDismiss}
            enableDismissOnClose
            handleIndicatorStyle={handleIndicatorStyle}
            // https://ethercreative.github.io/react-native-shadow-generator/
            style={{
              shadowColor: '#000',
              shadowOffset: {
                width: 0,
                height: 12,
              },
              shadowOpacity: 0.58,
              shadowRadius: 16.0,
              elevation: 24,
            }}
            enableDynamicSizing
            contentHeight={animatedContentHeight}
          >
            <BottomSheetScrollView>
              <Box p="m">
                <Box marginBottom="l">
                  {walletSignOpts.header && (
                    <Text variant="h4Medium" color="white" textAlign="center">
                      {walletSignOpts.header}
                    </Text>
                  )}
                  <Text
                    variant="body1Medium"
                    color="secondaryText"
                    textAlign="center"
                  >
                    {walletSignOpts?.url || ''}
                  </Text>
                </Box>
                {type === WalletStandardMessageTypes.connect && (
                  <Box flexGrow={1} justifyContent="center">
                    <Box
                      borderRadius="l"
                      backgroundColor="secondaryBackground"
                      flexDirection="column"
                      padding="m"
                    >
                      <Box flexDirection="row" marginBottom="m">
                        <Checkmark color="white" />
                        <Text variant="body1" marginStart="s">
                          {t('browserScreen.connectBullet1')}
                        </Text>
                      </Box>
                      <Box flexDirection="row">
                        <Checkmark color="white" />
                        <Text marginStart="s" variant="body1">
                          {t('browserScreen.connectBullet2')}
                        </Text>
                      </Box>
                    </Box>
                    <Box>
                      <Text
                        variant="body1"
                        color="secondaryText"
                        textAlign="center"
                        marginTop="m"
                      >
                        {t('browserScreen.connectToWebsitesYouTrust')}
                      </Text>
                    </Box>
                  </Box>
                )}
                {(type === WalletStandardMessageTypes.signMessage ||
                  type === WalletStandardMessageTypes.signAndSendTransaction ||
                  type === WalletStandardMessageTypes.signTransaction) && (
                  <Box flexGrow={1} justifyContent="center">
                    {warning && (
                      <Box
                        borderRadius="l"
                        backgroundColor="secondaryBackground"
                        padding="m"
                        marginBottom="m"
                      >
                        <Text variant="body1Medium" color="orange500">
                          {warning}
                        </Text>
                      </Box>
                    )}

                    {!(insufficientFunds || insufficientRentExempt) && (
                      <Box
                        borderTopStartRadius="l"
                        borderTopEndRadius="l"
                        borderBottomStartRadius={
                          additionalMessage ? 'none' : 'l'
                        }
                        borderBottomEndRadius={additionalMessage ? 'none' : 'l'}
                        backgroundColor="secondaryBackground"
                        padding="m"
                      >
                        <Text variant="body1Medium">
                          {t('browserScreen.estimatedChanges')}
                        </Text>
                      </Box>
                    )}

                    {!(insufficientFunds || insufficientRentExempt) &&
                      additionalMessage && (
                        <Box
                          backgroundColor="secondaryBackground"
                          borderBottomStartRadius="l"
                          borderBottomEndRadius="l"
                          padding="m"
                        >
                          <Text variant="body1Medium" color="secondaryText">
                            {additionalMessage}
                          </Text>
                        </Box>
                      )}

                    {(insufficientFunds || insufficientRentExempt) && (
                      <Box
                        borderRadius="l"
                        backgroundColor="secondaryBackground"
                        padding="m"
                        marginTop="m"
                      >
                        <Text variant="body1Medium" color="red500">
                          {insufficientFunds
                            ? t('browserScreen.insufficientFunds')
                            : t('browserScreen.insufficientRentExempt', {
                                amount: rentExempt,
                              })}
                        </Text>
                      </Box>
                    )}

                    <Box
                      flex={1}
                      maxHeight={
                        (walletSignOpts?.serializedTxs?.length || 0) > 1
                          ? 274
                          : 250
                      }
                      paddingTop="m"
                    >
                      {!currentTxs && (
                        <Box marginBottom="m">
                          <Box>
                            <Box
                              borderBottomStartRadius="l"
                              borderBottomEndRadius="l"
                              backgroundColor="secondaryBackground"
                              padding="m"
                            >
                              <Text variant="body1Medium" color="orange500">
                                {t('browserScreen.unableToSimulate')}
                              </Text>
                            </Box>
                          </Box>
                        </Box>
                      )}
                      {isVisible && currentTxs && (
                        <ScrollView>
                          {currentTxs.map((tx, idx) => (
                            <WalletSignBottomSheetTransaction
                              // eslint-disable-next-line react/no-array-index-key
                              key={`transaction-${idx}`}
                              transaction={tx}
                              transactionIdx={idx}
                              totalTransactions={
                                walletSignOpts?.serializedTxs?.length || 0
                              }
                              incrementTotalSolFee={incrementTotalSolFee}
                              setNestedInsufficentFunds={
                                setNestedInsufficentFunds
                              }
                            />
                          ))}
                          {hasMore && (
                            <ButtonPressable
                              width="100%"
                              borderRadius="round"
                              backgroundColor="white"
                              backgroundColorOpacity={0.1}
                              backgroundColorOpacityPressed={0.05}
                              titleColorPressedOpacity={0.3}
                              titleColor="white"
                              title={t('generic.loadMore')}
                              onPress={handleLoadMore}
                            />
                          )}
                        </ScrollView>
                      )}
                    </Box>
                    {(type ===
                      WalletStandardMessageTypes.signAndSendTransaction ||
                      type === WalletStandardMessageTypes.signTransaction) && (
                      <Box
                        marginTop="m"
                        borderRadius="l"
                        backgroundColor="secondaryBackground"
                        padding="m"
                        flexDirection="row"
                      >
                        <Box flexGrow={1}>
                          <Text variant="body1Medium">
                            {t('browserScreen.totalNetworkFees')}
                          </Text>
                        </Box>
                        <Text variant="body1Medium" color="secondaryText">
                          {`~${estimatedTotalSolByLamports} SOL`}
                        </Text>
                      </Box>
                    )}
                  </Box>
                )}
                <Box
                  flexDirection="row"
                  justifyContent="space-between"
                  marginBottom="m"
                  marginTop="l"
                >
                  <ButtonPressable
                    width="48%"
                    borderRadius="round"
                    backgroundColor="white"
                    backgroundColorOpacity={0.1}
                    backgroundColorOpacityPressed={0.05}
                    titleColorPressedOpacity={0.3}
                    titleColor="white"
                    title={t('browserScreen.cancel')}
                    onPress={onCancelHandler}
                  />

                  <ButtonPressable
                    width="48%"
                    borderRadius="round"
                    backgroundColor="white"
                    backgroundColorOpacityPressed={0.7}
                    backgroundColorDisabled="surfaceSecondary"
                    backgroundColorDisabledOpacity={0.5}
                    titleColorDisabled="secondaryText"
                    title={
                      type === WalletStandardMessageTypes.connect
                        ? t('browserScreen.connect')
                        : t('browserScreen.approve')
                    }
                    titleColor="black"
                    onPress={onAcceptHandler}
                  />
                </Box>
              </Box>
            </BottomSheetScrollView>
          </BottomSheetModal>
          {children}
        </BottomSheetModalProvider>
      </Box>
    )
  },
)

export default memo(WalletSignBottomSheet)
