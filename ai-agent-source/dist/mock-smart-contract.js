"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.mockDeposit = mockDeposit;
exports.mockReleaseFunds = mockReleaseFunds;
exports.mockRefund = mockRefund;
exports.mockCheckBalance = mockCheckBalance;
function mockDeposit(amount, currency) {
    console.log(`Mock: Depositing ${amount} ${currency} into escrow.`);
    return `Mock: Successfully deposited ${amount} ${currency}. Transaction ID: mockTx123`;
}
function mockReleaseFunds(amount, recipient) {
    console.log(`Mock: Releasing ${amount} to ${recipient}.`);
    return `Mock: Successfully released ${amount} to ${recipient}. Transaction ID: mockTx456`;
}
function mockRefund(amount, recipient) {
    console.log(`Mock: Refunding ${amount} to ${recipient}.`);
    return `Mock: Successfully refunded ${amount} to ${recipient}. Transaction ID: mockTx789`;
}
function mockCheckBalance(address) {
    console.log(`Mock: Checking balance for ${address}.`);
    return 100; // Mock balance
}
