import {
  keyringBuilderFactory,
  KeyringController,
} from "@metamask/keyring-controller";
import { Messenger } from "@metamask/base-controller";
import EosKeyring from "../eos-keyring/index.js";
import EosHdKeyring from "../eos-hd-keyring/index.js";

let controllerMessenger = new Messenger();

const keyringControllerMessenger = controllerMessenger.getRestricted({
  name: "KeyringController",
  allowedActions: ["KeyringController:*"],
  allowedEvents: ["KeyringController:stateChange"],
});

const keyringController = new KeyringController({
  messenger: keyringControllerMessenger,
  keyringBuilders: [
    keyringBuilderFactory(EosKeyring),
    keyringBuilderFactory(EosHdKeyring),
  ],
});

keyringControllerMessenger.subscribe(
  "KeyringController:stateChange",
  (state) => {
    console.log("Keyring state changed:", state);
  }
);

await keyringController.createNewVaultAndKeychain("password");
await keyringController.submitPassword("password");

await keyringController.addNewKeyring(EosHdKeyring.type);

const selector = { type: EosHdKeyring.type };

keyringController.withKeyring(selector, async ({ keyring }) => {
  const a1 = await keyring.addAccounts(1);
  console.log("成功创建EOS账户:", a1);

  const signTransaction = await keyring.signTransaction(a1[0],  JSON.stringify({
    actions: [
      {
        account: "eosio.token",
        name: "transfer",
        authorization: [
          {
            actor: "eosio.token",
            permission: "active",
          },
        ],
        data: {
          from: "eosio.token",
          to: "eosio.token",
        },
      },
    ],
  }));

  console.log("签名结果:", signTransaction);
});

// await keyringController.addNewKeyring(EosKeyring.type);

// const selector = { type: EosKeyring.type };

// keyringController.withKeyring(selector, async ({ keyring }) => {
//   const a1 = await keyring.addAccounts(3);
//   console.log("成功创建EOS账户:", a1);
// });

// keyringController.withKeyring(selector, async ({ keyring }) => {
//   const accounts = await keyring.getAccounts();
//   console.log("获取EOS账户:", accounts);
// });
