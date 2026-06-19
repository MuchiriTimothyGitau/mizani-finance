// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

contract PaymentLog {
    event PaymentRecorded(address indexed sender, string label, uint256 amount);

    function recordPayment(string calldata label, uint256 amount) external {
        require(bytes(label).length > 0 && bytes(label).length <= 120, 'label too long');
        require(amount > 0, 'amount must be greater than zero');
        emit PaymentRecorded(msg.sender, label, amount);
    }
}
