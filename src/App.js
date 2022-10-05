import React, { useState, useEffect } from 'react';
import { Connection, PublicKey, clusterApiUrl } from '@solana/web3.js';
import { Program, AnchorProvider, web3 } from '@project-serum/anchor';
import kp from './keypair.json'
import twitterLogo from './assets/twitter-logo.svg';
import './App.css';
import { program } from '@project-serum/anchor/dist/cjs/spl/associated-token';
// SystemProgram is a reference to the Solana runtime!
const { SystemProgram, Keypair } = web3;
// Create a keypair for the account that will hold the GIF data.
// let baseAccount = Keypair.generate();
// This is the address of your solana program, if you forgot, just run solana address -k target/deploy/myepicproject-keypair.json
const arr = Object.values(kp._keypair.secretKey)
const secret = new Uint8Array(arr)
const baseAccount = web3.Keypair.fromSecretKey(secret)
const programID = new PublicKey('4ioVtNXf5crvwSpJY2Np5spCGRmvfGi7gzqn2tJ9vPTU');

// Set our network to devnet.
const network = clusterApiUrl('devnet');
// Controls how we want to acknowledge when a transaction is "done". "processed is when othe node were connected to confirms the tx, and "finalzed is to be a bit more certain"
const opts = {
  preflightCommitment: "processed"
}


// Constants
const TWITTER_HANDLE = '_buildspace';
const TWITTER_LINK = `https://twitter.com/${TWITTER_HANDLE}`;
const TEST_GIFS = ['https://media0.giphy.com/media/9p8EIennsHNJe/giphy.gif?cid=ecf05e4752rre7cxzjvdrqrdkhw1pzdprvzg95v6vih7gbve&rid=giphy.gif&ct=s', 
'https://media2.giphy.com/media/54mQQSsj3HTQk/giphy.gif?cid=ecf05e4752rre7cxzjvdrqrdkhw1pzdprvzg95v6vih7gbve&rid=giphy.gif&ct=s',
"https://media0.giphy.com/media/80zNIwf97mCJy/giphy.gif?cid=ecf05e4752rre7cxzjvdrqrdkhw1pzdprvzg95v6vih7gbve&rid=giphy.gif&ct=s",
'https://media4.giphy.com/media/GRSnxyhJnPsaQy9YLn/giphy.gif?cid=ecf05e473js6md8jsd641qbo9furtkabefrae1za98rchmkk&rid=giphy.gif&ct=g'
]

const App = () => {

  const [ walletAddress, setWalletAddress ] = useState(null);
  const [ inputValue, setInputValue ] = useState('');
  const [ gifList, setGifList ] = useState([]);

  /* This is where the logic for deciding if a phantom wallet is connected or not.
   This function is checking the window object in our DOM to see if the phantom wallet extension has injected the solana object. If we do have a solana object we can also check to see if its a phantom wallet */
  const checkIfWalletIsConnected = async () => {
    try {
      const { solana } = window;

      if (solana) {
        if (solana.isPhantom) {
          console.log('Phantom wallet found!');
        }

        /* the solana object gives us a function that will allow us to connect directly with users wallet*/

        const response = await solana.connect({ onlyIfTrusted: true });
        console.log('Connect with public key:', response.publicKey.toString());

        //set users public key in state to be used later
      setWalletAddress(response.publicKey.toString());

      } else {
        alert('Solana object not found! Get a Phantom wallet! 👻')
      }
    } catch (error) {
      console.log(error)
    }
  };

  const connectWallet = async () => {
    const { solana } = window;

    if (solana) {
      const response = await solana.connect();
      console.log('Connected with Public Key:', response.publicKey.toString());
      setWalletAddress(response.publicKey.toString());
    }
  };

  //when you submit form it adds to giflist and clears the text field
  const sendGif = async () => {
    if (inputValue.length === 0) {
      console.log('No Gif link given');
      return

    } 
    setInputValue('');
    console.log('Gif link:', inputValue);

    try{
      const provider = getProvider()
      const program = await getProgram();

      await program.rpc.addGif(inputValue, {
        accounts: {
          baseAccount: baseAccount.publicKey,
          user: provider.wallet.publicKey,
        },
      });
      console.log('Gif successfully sent to program', inputValue)

      await getGifList();

    } catch (error) {
      console.log('Error sending Gif:', error)
    }
  };

  const onInputChange = (event) => {
    const { value } =  event.target;
    setInputValue(value);
  }

  //creating a provider which is basically an authenticated connection to solana. to make a provider we need a connected wallet. You cant communicate with solana at all unless you have a connected wallet.
  const getProvider = () => {
    const connection = new Connection(network, opts.preflightCommitment);
    const provider = new AnchorProvider(
      connection, window.solana, opts.preflightCommitment,
  );
    return provider;
  }

  const createGifAccount = async () => {
    try {
      const provider = getProvider();
      const program = await getProgram();
      
      console.log("ping")
      await program.rpc.startStuffOff({
        accounts: {
          baseAccount: baseAccount.publicKey,
          user: provider.wallet.publicKey,
          systemProgram: SystemProgram.programId,
        },
        signers: [baseAccount]
      });
      console.log("Created a new BaseAccount w/ address:", baseAccount.publicKey.toString())
      await getGifList();
  
    } catch(error) {
      console.log("Error creating BaseAccount account:", error)
    }
  }

  //Will render gifs if user has connected wallet
  const renderConnectedContainer = () => {
    // If we hit this, it means the program account hasn't been initialized.
      if (gifList === null) {
        return (
          <div className="connected-container">
            <button className="cta-button submit-gif-button" onClick={createGifAccount}>
              Do One-Time Initialization For GIF Program Account
            </button>
          </div>
        )
      } 
      // Otherwise, we're good! Account exists. User can submit GIFs.
      else {
        return(
          <div className="connected-container">
            <form
              onSubmit={(event) => {
                event.preventDefault();
                sendGif();
              }}
            >
              <input
                type="text"
                placeholder="Enter gif link!"
                value={inputValue}
                onChange={onInputChange}
              />
              <button type="submit" className="cta-button submit-gif-button">
                Submit
              </button>
            </form>
            <div className="gif-grid">
              {/* We use index as the key instead, also, the src is now item.gifLink */}
              {gifList.map((item, index) => (
                <div className="gif-item" key={index}>
                  <img src={item.gifLink} alt="gif" />
                </div>
              ))}
            </div>
          </div>
        )
      }
    }

  //render a button for when a user has not connected there wallet yet.
  const renderNotConnectedContainer = () => (
    <button
      className='cta-button connect-wallet-button'
      onClick={connectWallet}
      > 
      Connect to Wallet
      </button>
  );


  // When our component first mounts, lets check to see if we have a connected phantom wallet.
 // Calling use effect hook on componenet mount when second parameter is empty, can check if someone visiting thew site has a wallet installed or not.
  useEffect(() => {
    const onLoad = async () => {
      await checkIfWalletIsConnected();
    };
    window.addEventListener('load', onLoad);
    return () => window.removeEventListener('load', onLoad);
  }, [])



  const getProgram = async() => {
    // get metadata about your solana program
    const idl = await Program.fetchIdl(programID, getProvider());
    //create a program you can call
    return new Program(idl, programID, getProvider());
  }

  const getGifList = async() => {
    try {
      const program = await getProgram();
      const account = await program.account.baseAccount.fetch(baseAccount.publicKey);

      console.log("Got the account", account)
      setGifList(null)

    } catch (error) {

      }
  }
  //for when our walletaddress changes, only want to fetch when a users wallet has been connected
  //if we have a walletAddress go ahead and run our fetch logic.
  useEffect(() => {
    if(walletAddress) {
      console.log('Fetching gif list...');
      //call solana program here

      //set state
      setGifList(TEST_GIFS);
    }
  }, [walletAddress])

 


  return (
    <div className="App">
      <div className="{walletAddress ? 'authed-container' : 'container'}">
        <div className="header-container">
          <p className="header">🔥 Dragon ball GIF Portal</p>
          <p className="sub-text">
            View your GIF collection in the metaverse ✨
            {/*add this condition to show this only if we dont have a wallet address */}
          </p>
            {!walletAddress && renderNotConnectedContainer()}
            {walletAddress && renderConnectedContainer()}
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
