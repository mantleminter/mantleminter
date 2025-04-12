import React, { useEffect, useState } from 'react';
import { HelpCircle } from 'lucide-react';
import { getWalletKit, isWalletKitInitialized, walletKitEvents } from '../utils/walletKit';
import { buildApprovedNamespaces } from '@walletconnect/utils';

const InfoCard = ({ onOpenModal, onOpenHelpModal, owner }) => {
  const [score, setScore] = useState(null);
  const [account, setAccount] = useState(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [isConnected, setIsConnected] = useState(false);

  const connectWallet = async () => {
    if (isConnecting) return;
    try {
      setIsConnecting(true);
      const walletKit = await getWalletKit();
      
      await walletKitEvents.on('session_proposal', async (proposal) => {
        try {
          const approvedNamespaces = buildApprovedNamespaces({
            proposal: proposal.params,
            supportedNamespaces: {
              eip155: {
                chains: ['eip155:5000'],
                methods: ['eth_sendTransaction', 'personal_sign'],
                events: ['accountsChanged', 'chainChanged'],
                accounts: []
              }
            }
          });

          const session = await walletKit.approveSession({
            id: proposal.id,
            namespaces: approvedNamespaces
          });

          setAccount(session.namespaces.eip155.accounts[0]);
        } catch (error) {
          console.error("Error approving session:", error);
        }
      });

      const wcUri = await walletKit.core.pairing.create();
      await walletKit.pair({ uri: wcUri.uri });

    } catch (error) {
      console.error("Error connecting wallet:", error);
    } finally {
      setIsConnecting(false);
    }
  };

  useEffect(() => {
      console.log('version 1');
      const checkWalletConnection = async () => {
        if (window.ethereum) {
          const polygonId ='0x1388';  
          try {
              await ethereum.request({
                  method: 'wallet_switchEthereumChain',
                  params: [{ chainId: polygonId }],
              });
          } catch (error) {
              console.error(error);
          } 
          try {
            const accounts = await window.ethereum.request({ method: 'eth_accounts' });
            if (accounts.length > 0) {
              
              setAccount(accounts[0]);
              
            }
          } catch (error) {
            console.error("Error checking wallet connection:", error);
          }
          
        }
      };
      checkWalletConnection();
    }, []);

  const checkActiveSessions = async () => {
    try {
      if (!isWalletKitInitialized()) {
        setIsConnected(false);
        return;
      }

      const walletKit = await getWalletKit();
      const sessions = await walletKit.core.pairing.getPairings();
      setIsConnected(sessions.length > 0);
    } catch (error) {
      console.error("Error checking sessions:", error);
      setIsConnected(false);
    }
  };

  useEffect(() => {
    checkActiveSessions();

    const handleSessionUpdate = () => {
      checkActiveSessions();
    };

    const events = ['session_delete', 'session_expire', 'session_update', 'session_event'];

    const setupEvents = async () => {
      try {
        for (const event of events) {
          await walletKitEvents.on(event, handleSessionUpdate);
        }
      } catch (error) {
        console.error("Error setting up event listeners:", error);
      }
    };

    if (isWalletKitInitialized()) {
      setupEvents();
    }

    return () => {
      const cleanup = async () => {
        try {
          for (const event of events) {
            await walletKitEvents.off(event);
          }
        } catch (error) {
          console.error("Error cleaning up event listeners:", error);
        }
      };
      cleanup();
    };
  }, []);

  useEffect(() => {
    
    if (!account) return;
    
    console.log("Wallet Address:", account);

    const fetchScore = async () => {
      try {
        const response = await fetch('/api/check_wallet', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ wallet_address: account.toLowerCase() }),
        });

        const data = await response.json();
        console.log(data);
        if (data.score !== undefined) {
          setScore(data.score);
        }
      } catch (error) {
        console.error('Ошибка при запросе:', error);
      }
    };
    
    fetchScore();
  }, [account]);

  return (
    <div className="glass-card rounded-3xl p-6 relative bg-gradient-to-b from-[#1A1A1A] to-black">
      <h2 className="text-[1.35rem] font-semibold mb-4">This is an open source tool</h2>
      <div className="h-[1px] w-full bg-gradient-to-r from-white to-transparent mb-5"></div>
      <p className="text-[#999] mb-6 text-[0.925rem] leading-relaxed">
        ERC20 Token is the fungible token standard for Mantle Blockchain. This free educational tool allows you to deploy your own token to mainnet in one click. You will need at least 0.04 MNT for deployment fees.
      </p>
      <p className="text-[#999] mb-6 text-[0.925rem] leading-relaxed">
        For each coin created you get <span className="text-white font-medium">100 $MAM</span> points, as well as for each created 10 coins you get <span className="text-white font-medium">10,000 $MAM</span> points, in the future these points will be converted into tokens and all active users will receive airdrop, below you can see your statistics:
      </p>
      <button 
        onClick={onOpenModal}
        style={{ border: 'solid 3px #543926', margin: `${owner ? '100px' : '40px'} auto`, display: 'block' }} 
        className="rounded-full px-5 py-2.5 text-white text-[0.925rem] font-medium"
      >
        {score || 0}{" $MAM"}
      </button>
      <button 
        onClick={onOpenHelpModal} 
        className="absolute bottom-4 right-4 text-[#666] hover:text-white transition-colors"
      >
        <HelpCircle size={22} />
      </button>
    </div>
  );
};

export default InfoCard;
