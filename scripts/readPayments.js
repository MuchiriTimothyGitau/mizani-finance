const fs = require('node:fs');
const path = require('node:path');

async function main() {
  const artifactPath = path.join(process.cwd(), 'deployments', 'PaymentLog.json');
  if (!fs.existsSync(artifactPath)) {
    throw new Error('deployments/PaymentLog.json not found. Run npm run deploy first.');
  }

  const deployment = JSON.parse(fs.readFileSync(artifactPath, 'utf8'));
  const PaymentLog = await ethers.getContractFactory('PaymentLog');
  const paymentLog = PaymentLog.attach(deployment.address);
  const filter = paymentLog.filters.PaymentRecorded();
  const events = await paymentLog.queryFilter(filter, -500, 'latest');

  console.log(`Found ${events.length} PaymentRecorded events`);
  for (const event of events.reverse()) {
    console.log({
      label: event.args.label,
      amount: ethers.formatEther(event.args.amount),
      sender: event.args.sender,
      tx: event.transactionHash,
    });
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
