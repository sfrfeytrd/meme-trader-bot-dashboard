import React from 'react';
import './globals.css';
import './dashboard.css';

export const metadata={title:'Meme Trader Bot',description:'Solana meme trader paper-trading control center'};

export default function RootLayout({children}:{children:React.ReactNode}){
  return <html lang="en"><body>{children}</body></html>;
}
