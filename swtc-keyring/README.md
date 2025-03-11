# SWTC Keyring

SWTC区块链的密钥管理库，用于管理SWTC钱包的私钥和地址。

## 安装

```bash
yarn add swtc-keyring
# 或
npm install swtc-keyring
```

## 基本用法

```javascript
const SWTCKeyring = require('swtc-keyring');

// 创建新的keyring实例
const keyring = new SWTCKeyring();

// 创建新账户
async function createAccount() {
  const address = await keyring.addAccount();
  console.log('新创建的地址:', address);
  return address;
}

// 导入私钥
async function importPrivateKey(privateKey) {
  const address = await keyring.addAccount({ privateKey });
  console.log('导入的地址:', address);
  return address;
}

// 获取所有账户地址
async function getAccounts() {
  const accounts = await keyring.getAccounts();
  console.log('所有账户:', accounts);
  return accounts;
}

// 导出私钥
async function exportPrivateKey(address) {
  const privateKey = await keyring.exportAccount(address);
  console.log('导出的私钥:', privateKey);
  return privateKey;
}

// 签名交易
async function signTransaction(address, tx) {
  const signedTx = await keyring.signTransaction(address, tx);
  console.log('签名后的交易:', signedTx);
  return signedTx;
}

// 签名消息
async function signMessage(address, message) {
  const signature = await keyring.signMessage(address, message);
  console.log('签名结果:', signature);
  return signature;
}
```

## API参考

### `new SWTCKeyring([data])`
创建一个新的keyring实例。

### `keyring.getType()`
返回keyring类型。

### `keyring.serialize()`
序列化keyring的内容，返回包含钱包数据的对象。

### `keyring.deserialize(data)`
从序列化数据恢复keyring状态。

### `async keyring.addAccount([options])`
添加新账户，如果提供了privateKey选项则导入现有账户，否则创建新账户。

### `async keyring.getAccounts()`
获取所有账户地址列表。

### `async keyring.exportAccount(address)`
导出指定地址的私钥。

### `async keyring.removeAccount(address)`
从keyring中移除指定账户。

### `async keyring.signTransaction(address, tx)`
使用指定地址的私钥签名交易。

### `async keyring.signMessage(address, message)`
使用指定地址的私钥签名消息。

## 许可证

MIT
