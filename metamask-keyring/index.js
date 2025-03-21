import { createRequire } from "module";
const require = createRequire(import.meta.url);
import { hdWallet } from "jcc_wallet";
const { HDWallet, BIP44Chain } = hdWallet;
import chains from "./support-chains.js";
import { HdKeyring } from "@metamask/eth-hd-keyring";
import CcdaoHdKeyring from "../ccdao-hd-keyring/index.js";

import {
  keyringBuilderFactory,
  KeyringController,
} from "@metamask/keyring-controller";
import { Messenger } from "@metamask/base-controller";
import { AccountsController } from "@metamask/accounts-controller";
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
  keyringBuilders: [keyringBuilderFactory(CcdaoHdKeyring)],
});

keyringControllerMessenger.subscribe(
  "KeyringController:stateChange",
  (state) => {
    console.log("Keyring state changed:", state);
  }
);

const mnemonic =
  "scrub slow view debate culture suspect other search unfair popular miss mouse";
// decode vault
async function decodeVault() {
  const result = await encryptor.decryptWithDetail(
    "Gcc123456.",
    keyringController.state.vault
    // '{"data":"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","iv":"43gL21kMC2j8ZIcmTj4HYQ==","keyMetadata":{"algorithm":"PBKDF2","params":{"iterations":900000}},"salt":"zd0qDQ7J8Jl9/cZnJhUuPz+wxJzyE18A/rx1M7sgeP4="}'
  );

  console.log(JSON.stringify(result));
}

async function test01() {
  debugger;
  await keyringController.createNewVaultAndRestore("Gcc123456.", mnemonic);
  await keyringController.submitPassword("Gcc123456.");

  // 为其他用途创建选择器
  const keyringSelector = CcdaoHdKeyring.type;

  // 添加新的keyring时使用类型字符串
  const { id } = await keyringController.addNewKeyring(keyringSelector, {
    mnemonic: mnemonic,
  });

  await keyringController.withKeyring({ id }, async ({ keyring }) => {
    keyring.addAccounts(1, BIP44Chain.SWTC);
    keyring.addAccounts(1, BIP44Chain.TRON);
    keyring.addAccounts(2, BIP44Chain.EOS);

    const accounts = await keyring.getAccounts();
    //console.log(accounts);
    //console.log(keyring);
  });
  decodeVault();
}
test01();
