import React from 'react';
import './globals.css';
export const metadata={title:'Meme Trader Dashboard',description:'Solana meme trader control center'};
export default function RootLayout({children}:{children:React.ReactNode}){return <html lang="en"><body>{children}</body></html>}