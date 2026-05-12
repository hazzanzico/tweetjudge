await client.waitForTransactionReceipt({
  hash,
  status: "ACCEPTED" as any,
  retries: 15,  // Reduced from 40 to fail faster
  interval: 2000,
});