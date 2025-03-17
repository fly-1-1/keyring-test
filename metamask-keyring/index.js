import { createRequire } from "module";
const require = createRequire(import.meta.url);
import { hdWallet } from "jcc_wallet";
const { HDWallet } = hdWallet;
import chains from "./support-chains.js";
import { v4 as uuidv4 } from "uuid";

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
    console.log("Keyring state changed:", state);
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
    '{"data":"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","iv":"ibjY2McaQwktfP4ktBeMYg==","keyMetadata":{"algorithm":"PBKDF2","params":{"iterations":900000}},"salt":"/JtlLh4TyfASK33tCsAGdSf2FuSGHDxvCaQF/wg3eCc="}'
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

    console.log("walllet",wallet);

    for (const chain of chains) {
      const subAccount = await keyring.deriveSubAccount(
        uuidv4(),
        chain.chainId
      );
      await keyring.addSubAccount(wallet, subAccount);
    }

    //keyring.getWallets()
  });
}

//initHDWallet();

//testCCDAOHDKeyring();

decodeVault();
