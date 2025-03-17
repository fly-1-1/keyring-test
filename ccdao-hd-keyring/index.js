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
    //console.log("addAccount", this.wallets);
    return newWallets;
  }

  async deriveSubAccount(id, chain) {
    //const wallet = this.wallets.find((w) => w.id === id);
    const wallet = this.wallets[0]
    if (!wallet) {
        console.log("deriveSubAccount", "wallet not found", id);
    }
    const hd = HDWallet.fromMnemonic({
      mnemonic: wallet.data,
      language: "english",
    });
    const children = wallet.children.filter((c) => c.path.chain === chain);
    let index = 0;
    if (children.length > 0) {
      const indexs = children.map((c) => parseInt(c.path.index));
      index = Math.max(...indexs) + 1;
    }
    const hdWallet = hd.deriveWallet({ chain, account: 0, index });

    return {
      address: hdWallet.address(),
      path: hdWallet.path(),
      id: uuidv4(),
    };
  }

  async addSubAccount(id, account) {
    //const wallet = this.wallets.find((w)=>w.id===id)
    const wallet = this.wallets[0]
    wallet.children.push(account)
  }

  async getWallets(){
    console.log("getWallets", JSON.stringify(this.wallets));
  }

  async getAccounts() {
    return this.wallets.map((w) => w.address);
  }
}
