import RippleKeyring from './index.js';
import xrpl from 'xrpl';

async function main() {
  try {
    // 初始化keyring
    const keyring = new RippleKeyring();
    console.log('创建RippleKeyring实例成功');

    // 创建新账户
    const accounts = await keyring.addAccounts(1);
    const address = accounts[0];
    console.log('创建的XRP地址:', address);

    // 请求测试网水龙头
    console.log('正在申请测试网XRP...');
    const faucetUrl = 'https://faucet.altnet.rippletest.net/accounts';
    let result;
    let retries = 3;
    let delay = 2000;
    
    while (retries > 0) {
      try {
        const response = await fetch(faucetUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'User-Agent': 'RippleKeyring/1.0'
          },
          body: JSON.stringify({ destination: address }),
          timeout: 10000
        });

        if (!response.ok) {
          const errorBody = await response.text();
          throw new Error(`水龙头请求失败: ${response.status} - ${errorBody}`);
        }
        
        result = await response.json();
        console.log('水龙头响应:', JSON.stringify(result, null, 2));
        break;
      } catch (error) {
        retries--;
        if (retries === 0) throw error;
        console.log(`请求失败，剩余重试次数: ${retries}，${delay/1000}秒后重试...`);
        await new Promise(resolve => setTimeout(resolve, delay));
        delay *= 2;
      }
    }

    const balance = result.account?.balance || result.amount;
    if (!balance) throw new Error(`无效的水龙头响应结构: ${JSON.stringify(result)}`);
    console.log(`账户已注入${xrpl.dropsToXrp(balance)} XRP`);

    // 等待网络确认
    await new Promise(resolve => setTimeout(resolve, 5000));

    // 获取所有账户
    const allAccounts = await keyring.getAccounts();
    console.log('当前所有账户:', allAccounts);

    // 构造XRP交易
    const client = new xrpl.Client('wss://s.altnet.rippletest.net:51233');
    await client.connect();
    
    const tx = await client.autofill({
      TransactionType: 'Payment',
      Account: address,
      Amount: xrpl.xrpToDrops('1'),
      Destination: 'rPT1Sjq2YGrBMTttX4GZHjKu9dyfzbpAYe'
    });
    
    // 确保交易包含必要字段
    if (!tx.TransactionType || !tx.Account) {
      throw new Error('交易对象缺少必要字段: TransactionType 或 Account');
    }
    console.log('完整的交易对象:', JSON.stringify(tx, null, 2));

    // 签名交易
    const signedTx = await keyring.signTransaction(address, tx);
    console.log('签名返回对象结构:', JSON.stringify(signedTx, null, 2));
    console.log('原始tx_blob:', signedTx.tx_blob);
    try {
      const submitResult = await client.submit(signedTx.tx_blob);
      console.log('交易提交结果:', submitResult);
      if (submitResult.result.validated) {
        console.log('交易验证成功');
      } else {
        console.error('交易验证失败:', submitResult.result.meta.TransactionResult);
      }
    } catch (error) {
      console.error('交易提交过程中发生错误:', error);
    }
    const decodedTx = xrpl.decode(signedTx.tx_blob);
    const isValidHash = xrpl.validate(decodedTx);
    if (!isValidHash) {
      throw new Error('交易哈希验证失败');
    }
    console.log('交易哈希验证通过');
  } catch (error) {
    console.error('发生错误:', error);
  }
}

main();