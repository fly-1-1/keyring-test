import { hdWallet } from "jcc_wallet";
const { HDWallet } = hdWallet;
import { v4 as uuidv4 } from "uuid";

export default class CCDAOHDKeyring {
  static type = "CCDAO HD Keyring";
  type = CCDAOHDKeyring.type;
  mnemonic;
  // seed
  // root
  // hdWallet
  // hdPath
  constructor(opts = {}) {
    this.mnemonic = null;
    this.path = "";
    this.wallets = [];
    this.root = null;
    this.deserialize(opts);
  }

  async serialize() {
    return {
      data: this.mnemonic,
      wallets: this.wallets.map((wallet) => ({
        data: wallet.data,
        address: wallet.address,
        path: wallet.path,
        id: wallet.id,
        children: wallet.children || [],
      })),
    };
  }

  async deserialize(opts = {}) {
    this.mnemonic = opts.data || null;
    if (opts.wallets && Array.isArray(opts.wallets)) {
      this.wallets = opts.wallets.map((wallet) => ({
        data: this.mnemonic,
        address: wallet.address,
        path: wallet.path,
        id: wallet.id,
        children: wallet.children || [],
      }));
    } else {
      this.wallets = [];
    }

    if (this.mnemonic) {
      this._initFromMnemonic(this.mnemonic);
    }

    if (opts.numberOfAccounts) {
      await this.addAccount(opts.numberOfAccounts);
    }
  }

  async addAccount(mnemonic) {
    const newWallets = [];
    if (mnemonic) {
      this.mnemonic = mnemonic;
    } else if (!this.mnemonic) {
      throw new Error("请先设置助记词后再添加账户");
    }

    const hd = HDWallet.fromMnemonic({
      mnemonic: this.mnemonic,
      language: "english",
    });

    newWallets.push({
      data: this.mnemonic,
      address: hd.address(),
      path: hd.path(),
      id: uuidv4(),
      children: [],
    });
    this.wallets = this.wallets.concat(newWallets);
    console.log("addAccount", this.wallets);
    return newWallets.map((w) => w.address);
  }

  async

  async getAccounts() {
    return this.wallets.map((w) => w.address);
  }
}
