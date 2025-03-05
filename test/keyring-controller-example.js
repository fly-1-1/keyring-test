import { keyringBuilderFactory, KeyringController } from "@metamask/keyring-controller";
import { Messenger } from "@metamask/base-controller";
import SimpleKeyring from "../keyring/index.js";

// 创建一个新的Messenger实例
const controllerMessenger = new Messenger();

// 为KeyringController创建受限的Messenger
const keyringControllerMessenger = controllerMessenger.getRestricted({
  name: "KeyringController",
  allowedActions: ["KeyringController:*"],
  allowedEvents: ["KeyringController:stateChange"],
});

// 创建KeyringController实例
const keyringController = new KeyringController({
  messenger: keyringControllerMessenger,
  keyringBuilders: [
    keyringBuilderFactory(SimpleKeyring)
  ],
  // 指定支持的keyring类型
  KeyringTypes: ['Simple Key Pair']
});

// 订阅状态变化事件
keyringControllerMessenger.subscribe('KeyringController:stateChange', (state) => {
  console.log('Keyring状态变更:', state);
});

async function main() {
  try {
    // 创建新的vault并初始化keychain
    await keyringController.createNewVaultAndKeychain('your_password');
    
    // 解锁vault
    await keyringController.submitPassword('your_password');
    
    // 添加新账户
    const accounts = await keyringController.addNewAccount(1);
    console.log('创建的账户:', accounts);
    
    // 获取所有账户
    const allAccounts = await keyringController.getAccounts();
    console.log('所有账户:', allAccounts);
    
    // 获取keyring状态
    const state = await keyringController.getState();
    console.log('当前状态:', state);
    
  } catch (error) {
    console.error('发生错误:', error);
  }
}

main();