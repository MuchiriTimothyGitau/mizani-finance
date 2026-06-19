const { expect } = require('chai');
const { ethers } = require('hardhat');

describe('PaymentLog', function () {
  let paymentLog;
  let owner;
  let other;

  beforeEach(async function () {
    [owner, other] = await ethers.getSigners();
    const PaymentLog = await ethers.getContractFactory('PaymentLog');
    paymentLog = await PaymentLog.deploy();
    await paymentLog.waitForDeployment();
  });

  it('records a payment and emits PaymentRecorded', async function () {
    const amount = ethers.parseEther('0.01');
    const tx = await paymentLog.connect(other).recordPayment('INV-001', amount);
    const receipt = await tx.wait();

    const event = receipt.logs
      .map((log) => {
        try {
          return paymentLog.interface.parseLog(log);
        } catch (err) {
          return null;
        }
      })
      .find((parsed) => parsed?.name === 'PaymentRecorded');

    expect(event, 'PaymentRecorded event should exist').to.not.equal(null);
    expect(event.args.sender).to.equal(other.address);
    expect(event.args.label).to.equal('INV-001');
    expect(event.args.amount).to.equal(amount);
    expect(event.args.recordedAt > 0n).to.equal(true);
  });

  it('rejects an empty label', async function () {
    await expect(paymentLog.recordPayment('', 100)).to.be.revertedWith('label too long');
  });

  it('rejects a zero amount', async function () {
    await expect(paymentLog.recordPayment('INV-002', 0)).to.be.revertedWith('amount must be greater than zero');
  });

  it('rejects labels over 120 characters', async function () {
    await expect(paymentLog.recordPayment('A'.repeat(121), 100)).to.be.revertedWith('label too long');
  });
});
