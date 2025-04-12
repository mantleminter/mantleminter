import { getWalletKit, ensureWalletKitInitialized, walletKitEvents } from '../utils/walletKit';
import { ethers } from 'ethers';
import { buildApprovedNamespaces, getSdkError } from '@walletconnect/utils';

export class WalletService {
  static async connect(onUri) {
    try {
      await ensureWalletKitInitialized();
      
      const walletKit = await getWalletKit();

      await walletKitEvents.on('session_proposal', async (proposal) => {
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

        return await walletKit.approveSession({
          id: proposal.id,
          namespaces: approvedNamespaces
        });
      });

      const wcUri = await walletKit.core.pairing.create();
      
      if (onUri) {
        onUri(wcUri.uri);
      }

      return await walletKit.pair({ uri: wcUri.uri });

    } catch (error) {
      console.error("WalletConnect error:", error);
      throw new Error('Не удалось подключить кошелек');
    }
  }

  static async getActiveSessions() {
    if (!isWalletKitInitialized()) {
      return [];
    }
    try {
      const walletKit = await getWalletKit();
      const pairings = await walletKit.core.pairing.getPairings() || [];
      return pairings;
    } catch (error) {
      console.error("Error getting sessions:", error);
      return [];
    }
  }

  static async getProvider() {
    try {
      const pairings = await this.getActiveSessions();
      if (!pairings || pairings.length === 0) {
        throw new Error('No active wallet session');
      }
      return new ethers.providers.JsonRpcProvider('https://rpc.mantle.xyz');
    } catch (error) {
      console.error("Provider error:", error);
      throw error;
    }
  }

  static async getAccount() {
    try {
      const walletKit = await getWalletKit();
      const sessions = await walletKit.getActiveSessions();
      if (!sessions || Object.keys(sessions).length === 0) {
        return null;
      }
      const session = Object.values(sessions)[0];
      return session.namespaces.eip155.accounts[0];
    } catch (error) {
      console.error("Get account error:", error);
      return null;
    }
  }

  static async disconnect() {
    try {
      const walletKit = await getWalletKit();
      const sessions = await walletKit.getActiveSessions();
      for (const session of Object.values(sessions)) {
        await walletKit.disconnectSession({
          topic: session.topic,
          reason: getSdkError('USER_DISCONNECTED')
        });
      }
    } catch (error) {
      console.error("Disconnect error:", error);
      throw error;
    }
  }
} 