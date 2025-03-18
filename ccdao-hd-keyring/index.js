import { hdWallet } from "jcc_wallet";
const { HDWallet } = hdWallet;
import { v4 as uuidv4 } from "uuid";
const bip39 = require("bip39");
const { Wallet } = require("xrpl");
const { hdkey } = require("@ethereumjs/wallet");
const TronWeb = require("tronweb");
const eosHdKey = require("hdkey");
const ecc = require("eosjs-ecc");

export default class CCDAOHDKeyring {
  static type = "CCDAO HD Keyring";
  type = CCDAOHDKeyring.type;
  mnemonic;
  constructor(opts = {}) {
    this.mnemonic = null;
    this.path = "";
    this.keyrings = [];
    this.root = null;
    this.deserialize(opts);
  }

  async serialize() {
    return {
      data: this.mnemonic,
      keyrings: this.keyrings.map((keyring) => ({
        data: keyring.data,
        address: keyring.address,
        path: keyring.path,
        id: keyring.id,
        children: keyring.children || [],
      })),
    };
  }

  async deserialize(opts = {}) {
    this.mnemonic = opts.data || null;
    if (opts.keyrings && Array.isArray(opts.keyrings)) {
      this.keyrings = opts.keyrings.map((keyring) => ({
        data: this.mnemonic,
        address: keyring.address,
        path: keyring.path,
        id: keyring.id,
        children: keyring.children || [],
      }));
    } else {
      this.keyrings = [];
    }
  }

  async addAccount(mnemonic) {
    const newKeyrings = [];
    if (mnemonic) {
      this.mnemonic = mnemonic;
    } else if (!this.mnemonic) {
      throw new Error("请先设置助记词后再添加账户");
    }

    const hd = HDWallet.fromMnemonic({
      mnemonic: this.mnemonic,
      language: "english",
    });

    newKeyrings.push({
      data: this.mnemonic,
      address: hd.address(),
      path: hd.path(),
      id: uuidv4(),
      children: [],
    });
    this.keyrings = this.keyrings.concat(newKeyrings);
    return newKeyrings[0];
  }

  async deriveSubAccount(id, chain) {
    const keyring = this.keyrings.find((k) => k.id === id);
    if (!keyring) {
      console.log("deriveSubAccount", "keyring not found", id);
    }
    const hd = HDWallet.fromMnemonic({
      mnemonic: keyring.data,
      language: "english",
    });
    const children = keyring.children.filter((c) => c.path.chain === chain);
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
    const keyring = this.keyrings.find((k) => k.id === id);
    keyring.children.push(account);
  }

  async getKeyrings() {
    console.log("getKeyrings", JSON.stringify(this.keyrings));
  }

  rootKeyrings() {
    const keyrings = this.keyrings.filter((keyring) => Boolean(keyring.path));
    return keyrings;
  }

  async getAccounts() {
    return this.keyrings.map((k) => k.address);
  }

  rootKeyrings() {
    const keyrings = this.keyrings.filter((keyring) => Boolean(keyring.path));
    return keyrings;
  }

  subKeyrings() {
    const keyrings = this.keyrings.filter((keyring) => Boolean(keyring.path));
    const subs = keyrings
      .map((account) => {
        const newChildren = account.children.map((child) => {
          return {
            parentID: account.id,
            ...child,
          };
        });
        return newChildren;
      })
      .flat();
    return subs;
  }

  getKeyrings() {
    return [...this.rootKeyrings(), ...this.subKeyrings()];
  }



  derivePrivateKey(address) {
    const keyrings = this.getKeyrings();
    const keyring = keyrings.find((t) => t.address.toLowerCase() === address.toLowerCase() && !t.children);
    let secret;
    if (!keyring) {
      throw new Error("No keyring found for address");
    }
    if (!keyring.path) {
      if (bip39.validateMnemonic(keyring.data)) {
        if (keyring.chain === BIP44Chain.SWTC) {
          const wallet = HDWallet.fromMnemonic({
            mnemonic: keyring.data,
            language: "english"
          });
          secret = wallet.keypair().privateKey;
        } else if (keyring.chain === BIP44Chain.RIPPLE) {
          const wallet = Wallet.fromMnemonic(keyring.data);
          secret = wallet.privateKey;
        } else if (keyring.chain === BIP44Chain.TRON) {
          const wallet = TronWeb.utils.accounts.generateAccountWithMnemonic(keyring.data);
          secret = wallet.privateKey;
        } else {
          const seed = bip39.mnemonicToSeedSync(keyring.data);
          const hd = hdkey.EthereumHDKey.fromMasterSeed(seed);
          secret = hd.derivePath("m/44'/60'/0'/0/0").getWallet().getPrivateKeyString();
        }
      } else {
        secret = keyring.data;
      }
    } else {
      const root = keyrings.find((k) => keyring.parentID === k.id);

      const { data } = root;
      const wallet = HDWallet.fromMnemonic({
        mnemonic: data,
        language: "english"
      });
      const { chain, account, index } = keyring.path;
      const sub = wallet.deriveWallet({ chain, account, index });
      secret = sub.keypair().privateKey;
    }
    return secret;
  }

  deriveEosPrivateKey(id) {
    const keyrings = this.getKeyrings();
    const keyring = keyrings.find((t) => t.id.toLowerCase() === id.toLowerCase() && !t.children);
    let secret;
    if (!keyring) {
      throw new Error("No keyring found for address");
    }
    if (!keyring.path) {
      if (bip39.validateMnemonic(keyring.data)) {
        const seed = bip39.mnemonicToSeedSync(keyring.data);
        const master = eosHdKey.fromMasterSeed(seed);
        const node = master.derive("m/44'/194'/0'/0/0");
        return ecc.PublicKey(node._publicKey).toString();
      } else {
        secret = keyring.data;
      }
    } else {
      const root = keyrings.find((k) => keyring.parentID === k.id);

      const { data } = root;
      const wallet = HDWallet.fromMnemonic({
        mnemonic: data,
        language: "english"
      });
      const { chain, account, index } = keyring.path;
      const sub = wallet.deriveWallet({ chain, account, index });
      secret = sub.keypair().privateKey;
    }
    return secret;
  }

}
