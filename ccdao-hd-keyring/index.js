import { hdWallet } from "jcc_wallet";
import { BIP44Chain } from "jcc_wallet/lib/hd";

import { v4 as uuidv4 } from "uuid";

export default class CCDAOHDKeyring {
  static type = "CCDAO HD Keyring";
  type = CCDAOHDKeyring.type;
  mnemonic;
  wallets = [];
  mutichainAccountLength = new Map();
  numberOfAccounts;

  async serialize() {
    return {
      type: this.type,
      mnemonic: this.mnemonic,
      wallets: this.wallets.map((wallet) => wallet.serialize()),
    };
  }

  async deserialize(obj) {
    this.type = obj.type;
    this.mnemonic = obj.mnemonic;
    if (this.mnemonic) {
      this._initFromMnemonic(this.mnemonic);
    }
    this.wallets = obj.wallets.map((wallet) => hdWallet.HDWallet.deserialize(wallet));
    this.numberOfAccounts = this.wallets.length;
    return this;
  }

  async addAccounts(n = 1, chainId) {
    const newWallets = [];
    if (!this.mnemonic) {
      this.mnemonic = bip39.generateMnemonic();
      this._initFromMnemonic(this.mnemonic);
    }
    this.root = hdWallet.fromMnemonic({ mnemonic: this.mnemonic, language: "english" });
    const index = this.mutichainAccountLength.get(chainId) || 0;
    
    for (let i = 0; i < n; i++) {
     const wallet = this.root.deriveWallet({ chainId, account: 0, index: index + i });
     this.mutichainAccountLength.set(chainId, index + i + 1);
     newWallets.push(wallet);
     this.wallets.push(wallet);
     this.numberOfAccounts = this.wallets.length;
    }
    return newWallets.map(w => w.getAddress());
  }
}
