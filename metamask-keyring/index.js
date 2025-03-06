import { keyringBuilderFactory, KeyringController } from "@metamask/keyring-controller";
import { Messenger } from "@metamask/base-controller";
import EosKeyring from "../eos-keyring/index.js";

let controllerMessenger = new Messenger();

const keyringControllerMessenger = controllerMessenger.getRestricted({
  name: "KeyringController",
  allowedActions: ["KeyringController:*"],
  allowedEvents: ["KeyringController:stateChange"],
});

const keyringController = new KeyringController({
  messenger: keyringControllerMessenger,
  keyringBuilders:[
    keyringBuilderFactory(EosKeyring)
  ]
});

keyringControllerMessenger.subscribe('KeyringController:stateChange', (state) => {
  console.log('Keyring state changed:', state);
});

await keyringController.createNewVaultAndKeychain('password');
await keyringController.submitPassword('password');
await keyringController.addNewKeyring(EosKeyring.type);
const eosKeyrings = keyringController.getKeyringsByType(EosKeyring.type);
const eosAccounts = await eosKeyrings[0].addAccounts(1);

console.log('成功创建EOS账户:', eosAccounts);

const accounts = await keyringController.getAccounts()
console.log('账户列表:', accounts);
