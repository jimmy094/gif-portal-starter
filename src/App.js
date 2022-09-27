import React, { useEffect } from 'react';
import twitterLogo from './assets/twitter-logo.svg';
import './App.css';

// Constants
const TWITTER_HANDLE = '_buildspace';
const TWITTER_LINK = `https://twitter.com/${TWITTER_HANDLE}`;

const App = () => {

  /* This is where the logic for deciding if a phantom wallet is connected or not.
   This function is checking the window object in our DOM to see if the phantom wallet extension has injected the solana object. If we do have a solana object we can also check to see if its a phantom wallet */
  const checkIfWalletIsConnected = async () => {
    try {
      const { solana } = window;

      if (solana) {
        if (solana.isPhantom) {
          console.log('Phantom wallet found!');
        }
      } else {
        alert('Solana object not found! Get a Phantom wallet! 👻')
      }
    } catch (error) {
      console.log('ERROR')
    }
  }

  // When our component first mounts, lets check to see if we have a connected phantom wallet.
 // Calling use effect hook on componenet mount when second parameter is empty, can check if someone visiting thew site has a wallet installed or not.
  useEffect(() => {
    const onLoad = async () => {
      await checkIfWalletIsConnected();
    };
    window.addEventListener('load', onLoad);
    return () => window.removeEventListener('load', onLoad);
  }, [])

  return (
    <div className="App">
      <div className="container">
        <div className="header-container">
          <p className="header">🖼 GIF Portal</p>
          <p className="sub-text">
            View your GIF collection in the metaverse ✨
          </p>
        </div>
        <div className="footer-container">
          <img alt="Twitter Logo" className="twitter-logo" src={twitterLogo} />
          <a
            className="footer-text"
            href={TWITTER_LINK}
            target="_blank"
            rel="noreferrer"
          >{`built on @${TWITTER_HANDLE}`}</a>
        </div>
      </div>
    </div>
  );
};

export default App;
