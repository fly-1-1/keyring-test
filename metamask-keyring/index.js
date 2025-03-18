import { createRequire } from "module";
const require = createRequire(import.meta.url);
import { hdWallet } from "jcc_wallet";
const { HDWallet, BIP44Chain } = hdWallet;
import chains from "./support-chains.js";

import {
  keyringBuilderFactory,
  KeyringController,
} from "@metamask/keyring-controller";
import { Messenger } from "@metamask/base-controller";
import EosKeyring from "../eos-keyring/index.js";
import RippleKeyring from "../ripple-keyring/index.js";
import EosHdKeyring from "../eos-hd-keyring/index.js";
import SwtcKeyring from "../swtc-keyring/lib/swtc-keyring.js";
import CCDAOHDKeyring from "../ccdao-hd-keyring/index.js";
const encryptor = require("@metamask/browser-passworder");

let controllerMessenger = new Messenger();

const keyringControllerMessenger = controllerMessenger.getRestricted({
  name: "KeyringController",
  allowedActions: ["KeyringController:*"],
  allowedEvents: [
    "KeyringController:stateChange",
    "KeyringController:getState",
  ],
});

const keyringController = new KeyringController({
  messenger: keyringControllerMessenger,
  keyringBuilders: [
    keyringBuilderFactory(EosKeyring),
    keyringBuilderFactory(RippleKeyring),
    keyringBuilderFactory(EosHdKeyring),
    keyringBuilderFactory(SwtcKeyring),
    keyringBuilderFactory(CCDAOHDKeyring),
  ],
});

keyringControllerMessenger.subscribe(
  "KeyringController:stateChange",
  (state) => {
    //console.log("Keyring state changed:", state);
  }
);

//Test CCDAOHDKeyring

async function testCCDAOHDKeyring() {
  await keyringController.createNewVaultAndKeychain("Gcc123456.");
  await keyringController.submitPassword("Gcc123456.");
  await keyringController.addNewKeyring(CCDAOHDKeyring.type);
  const CCDAOHdSelector = { type: CCDAOHDKeyring.type };

  await keyringController.withKeyring(CCDAOHdSelector, async ({ keyring }) => {
    await keyring.addAccount(HDWallet.generateMnemonic());
    const accounts = await keyring.getAccounts();
    console.log(accounts);
  });
}

// decode vault
async function decodeVault() {
  const result = await encryptor.decryptWithDetail(
    "Gcc123456.",
    '{"data":"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","iv":"GSeuRvsATMfPcXKIuMI9VA==","keyMetadata":{"algorithm":"PBKDF2","params":{"iterations":900000}},"salt":"dOxuGlU52rbcFTSv0dyr8kC5PiVJIotu9b2u1hIP2Rw="}'
  );
  console.log(JSON.stringify(result));
}

async function initHDWallet() {
  await keyringController.createNewVaultAndKeychain("Gcc123456.");
  await keyringController.submitPassword("Gcc123456.");
  await keyringController.addNewKeyring(CCDAOHDKeyring.type);
  const CCDAOHdSelector = { type: CCDAOHDKeyring.type };

  await keyringController.withKeyring(CCDAOHdSelector, async ({ keyring }) => {
    const wallet = await keyring.addAccount(HDWallet.generateMnemonic());
    for (const chain of chains) {
      const subAccount = await keyring.deriveSubAccount(
        wallet.id,
        chain.chainId
      );
      await keyring.addSubAccount(wallet.id, subAccount);
    }

    const subPolAccount = await keyring.deriveSubAccount(
      wallet.id,
      BIP44Chain.POLYGON
    );
    await keyring.addSubAccount(wallet.id, subPolAccount);

    const keyrings = keyring.rootKeyrings();
    console.log(keyrings[0].children[6].id);

    const privateKey =  keyring.derivePrivateKey(keyrings[0].children[6].address)
    console.log(privateKey);
  });
}

initHDWallet();

//testCCDAOHDKeyring();

//decodeVault();
