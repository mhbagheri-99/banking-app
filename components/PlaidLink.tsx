import React, { useCallback, useEffect, useState } from 'react'
import { Button } from './ui/button'
import { PlaidLinkOptions, usePlaidLink } from 'react-plaid-link'
import { useRouter } from 'next/navigation'
import { createLinkToken, exchangePublicToken } from '@/lib/actions/user.actions'
import Image from 'next/image'

const PlaidLink = ({ user, variant, dwollaCustomerId } : PlaidLinkProps) => {
  const router = useRouter()
  const [token, setToken] = useState('')
  useEffect(() => {
    const getLinkToken = async () => {
      const data = await createLinkToken(user)
      setToken(data?.linkToken)
    }
    getLinkToken()
  }, [user])
  
  const onSuccess = useCallback(async (public_token: string) => {
    await exchangePublicToken({publicToken: public_token, user})
    router.push('/')
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user])
  
  const config: PlaidLinkOptions = {
    token,
    onSuccess,
  };

  const { open, ready } = usePlaidLink(config)
  return (
    <>
      {variant === "primary" ? (
        <Button className='plaidlink-primary' onClick={() => open()} disabled={!ready}>
          Connect Bank Account
        </Button> 
      ) : (
        variant === "ghost" ? (
          <Button variant='ghost' className='plaidlink-ghost' onClick={() => open()}>
            <Image src='/icons/connect-bank.svg' alt='Add Bank Account' width={24} height={24} />
            <p className='hidden text-[16px] font-semibold text-black-2 xl:block'>Connect Bank Account</p>
          </Button>
        ) : (
          <Button className='plaidlink-default' onClick={() => open()}>
            <Image src='/icons/connect-bank.svg' alt='Add Bank Account' width={24} height={24} />
            <p className='text-[16px] font-semibold text-black-2'>Connect Bank Account</p>
          </Button>
        )
      )}
    </>
  )
}

export default PlaidLink