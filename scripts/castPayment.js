const fs = require('node:fs');
const path = require('node:path');

async function main() {
  if (!process.env.PRIVATE_KEY && !process.env.CORE_WALLET_PRIVATE_KEY) {
    throw new Error('Set PRIVATE_KEY or CORE_WALLET_PRIVATE_KEY in .env before casting a payment.');
  }

  const artifactPath = path.join(process.cwd(), 'deployments', 'PaymentLog.json');
  if (!fs.existsSync(artifactPath)) {
    throw new Error('deployments/PaymentLog.json not found. Run npm run deploy first.');
  }

  const deployment = JSON.parse(fs.readFileSync(artifactPath, 'utf8'));
  const [signer] = await ethers.getSigners();
  const PaymentLog = await ethers.getContractFactory('PaymentLog');
  const paymentLog = PaymentLog.attach(deployment.address);

  const label = process.env.CAST_PAYMENT_LABEL || 'MVP live cast payment';
  const amount = ethers.parseEther(process.env.CAST_PAYMENT_AMOUNT || '0.01');

  const tx = await paymentLog.connect(signer).recordPayment(label, amount);
  console.log(`Recording payment from ${signer.address}`);
  console.log(`Tx hash: ${tx.hash}`);

  const receipt = await tx.wait();
  console.log(`Confirmed in block ${receipt.blockNumber}`);
  console.log(`Contract: ${deployment.address}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
