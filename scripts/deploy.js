const fs = require('node:fs');
const path = require('node:path');

async function main() {
  const PaymentLog = await ethers.getContractFactory('PaymentLog');
  const paymentLog = await PaymentLog.deploy();
  await paymentLog.waitForDeployment();

  const address = await paymentLog.getAddress();
  const deployment = {
    name: 'PaymentLog',
    address,
    abi: PaymentLog.interface.formatJson(),
    network: 'fuji',
    chainId: 43113,
    deployedAt: new Date().toISOString(),
  };

  fs.mkdirSync(path.join(process.cwd(), 'deployments'), { recursive: true });
  fs.writeFileSync(path.join(process.cwd(), 'deployments', 'PaymentLog.json'), JSON.stringify(deployment, null, 2));

  console.log(`PaymentLog deployed to ${address}`);
  console.log('Deployment artifact written to deployments/PaymentLog.json');
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
