import { WalletKit } from '@reown/walletkit'
import { Core } from '@walletconnect/core'

class WalletKitManager {
  constructor() {
    this.instance = null;
    this.core = null;
    this.initialized = false;
    this.eventHandlers = new Map();
    this.initializationPromise = null;
  }

  async initialize() {
    if (this.initialized) return;
    
    if (this.initializationPromise) {
      return this.initializationPromise;
    }

    this.initializationPromise = (async () => {
      try {
        this.core = new Core({
          projectId: import.meta.env.VITE_PROJECT_ID,
          logger: 'debug'
        });

        await this.core.start();

        this.instance = new WalletKit({
          core: this.core,
          metadata: {
            name: 'Mantle Minter',
            description: 'Mantle Minter Token Creation Platform',
            url: window.location.origin,
            icons: [`${window.location.origin}/img/logo.png`]
          },
          defaultChain: 'eip155:5000'
        });

        await this.instance.initialize();
        
        this.initialized = true;
      } catch (error) {
        console.error('Error initializing WalletKit:', error);
        this.initialized = false;
        throw error;
      } finally {
        this.initializationPromise = null;
      }
    })();

    return this.initializationPromise;
  }

  async getInstance() {
    await this.initialize();
    return this.instance;
  }

  async getCore() {
    await this.initialize();
    return this.core;
  }

  async ensureInitialized() {
    if (!this.initialized) {
      await this.initialize();
    }
    return this.initialized;
  }

  isInitialized() {
    return this.initialized && !!this.instance && !!this.core;
  }

  async on(event, handler) {
    if (!this.initialized) {
      await this.initialize();
    }
    if (this.instance) {
      this.eventHandlers.set(event, handler);
      this.instance.on(event, handler);
    }
  }

  async off(event) {
    if (this.instance && this.eventHandlers.has(event)) {
      const handler = this.eventHandlers.get(event);
      this.instance.off(event, handler);
      this.eventHandlers.delete(event);
    }
  }
}

const walletKitManager = new WalletKitManager();

walletKitManager.initialize().catch(console.error);

export const getWalletKit = async () => {
  return await walletKitManager.getInstance();
};

export const getCore = async () => {
  return await walletKitManager.getCore();
};

export const ensureWalletKitInitialized = () => walletKitManager.ensureInitialized();
export const isWalletKitInitialized = () => walletKitManager.isInitialized();
export const walletKitEvents = {
  on: (event, handler) => walletKitManager.on(event, handler),
  off: (event) => walletKitManager.off(event)
}; 