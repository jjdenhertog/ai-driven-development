'use client'

import React from 'react'
import { SnackbarProvider } from 'notistack'

type ProvidersProps = {
  readonly children: React.ReactNode
}

export const Providers: React.FC<ProvidersProps> = ({ children }) => {
    return (
        <SnackbarProvider 
            maxSnack={3}
            anchorOrigin={{
                vertical: 'bottom',
                horizontal: 'right',
            }}
            autoHideDuration={3000}
            style={{
                fontFamily: 'inherit',
            }}
        >
            {children}
        </SnackbarProvider>
    )
}