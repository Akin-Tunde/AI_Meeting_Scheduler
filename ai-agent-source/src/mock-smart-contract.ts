export function mockDeposit(amount: number, currency: string): string {
  console.log(`Mock: Depositing ${amount} ${currency} into escrow.`);
  return `Mock: Successfully deposited ${amount} ${currency}. Transaction ID: mockTx123`;
}

export function mockReleaseFunds(amount: number, recipient: string): string {
  console.log(`Mock: Releasing ${amount} to ${recipient}.`);
  return `Mock: Successfully released ${amount} to ${recipient}. Transaction ID: mockTx456`;
}

export function mockRefund(amount: number, recipient: string): string {
  console.log(`Mock: Refunding ${amount} to ${recipient}.`);
  return `Mock: Successfully refunded ${amount} to ${recipient}. Transaction ID: mockTx789`;
}

export function mockCheckBalance(address: string): number {
  console.log(`Mock: Checking balance for ${address}.`);
  return 100; // Mock balance
}


