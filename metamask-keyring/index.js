import { createRequire } from "module";
const require = createRequire(import.meta.url);
import { hdWallet } from "jcc_wallet";
const { HDWallet ,BIP44Chain} = hdWallet;
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
    '{"data":"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","iv":"A8ymR8OnJkB+vkxLoA0Btw==","keyMetadata":{"algorithm":"PBKDF2","params":{"iterations":900000}},"salt":"f38OoheQ31LXWsCTwGibbVN6mEHZT00FkA2yXswM1m8="}'
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
      await keyring.addSubAccount( wallet.id, subAccount);
    }

    const subPolAccount = await keyring.deriveSubAccount(
      wallet.id,
      BIP44Chain.POLYGON
    )
    await keyring.addSubAccount( wallet.id, subPolAccount);
  });
}

initHDWallet();

//testCCDAOHDKeyring();

//decodeVault();
