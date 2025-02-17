const utils = require('./utils');
const SyscoinMessageLibraryForTests = artifacts.require('SyscoinMessageLibraryForTests');
const bitcoin = require('bitcoinjs-lib');

contract('testParseTransaction', (accounts) => {
  let syscoinMessageLibraryForTests;
  const keys = [
    'L43bqxCXdZ1Lp6JkBoHE8pUQKi3BBgqrmBRYnNg4adZmRSRU534a',
    'L4N2R2S2WRAnrdwnezs4kHaxsQkRNMrVwgGpHJNgJxGYT788LnGB',
  ].map(utils.syscoinKeyPairFromWIF);
  before(async () => {
    syscoinMessageLibraryForTests = await SyscoinMessageLibraryForTests.deployed();
  });
  it('Parse simple transaction with only OP_RETURN and wrong version', async () => {
    const tx = utils.buildSyscoinTransaction({
      signer: keys[1],
      inputs: [['edbbd164551c8961cf5f7f4b22d7a299dd418758b611b84c23770219e427df67', 0]],
      outputs: [
        ['OP_RETURN', 1000001, utils.ethAddressFromKeyPairRaw(keys[1])],
      ],
    });
    tx.version = 0x01;
    const txData = `0x${tx.toHex()}`;
    const [ ret, amount, inputEthAddress, assetGUID ] = await syscoinMessageLibraryForTests.parseTransaction(txData);
    assert.equal(ret, 10170, 'Parsed');
    assert.equal(amount.toNumber(), 0, 'Amount burned');
    
  });
  it('Parse simple transaction with only OP_RETURN', async () => {
    const tx = utils.buildSyscoinTransaction({
      signer: keys[1],
      inputs: [['edbbd164551c8961cf5f7f4b22d7a299dd418758b611b84c23770219e427df67', 0]],
      outputs: [
        ['OP_RETURN', 1000001, utils.ethAddressFromKeyPairRaw(keys[1])],
      ],
    });
    tx.version = 0x7401;
    const txData = `0x${tx.toHex()}`;
    const [ ret, amount, inputEthAddress, assetGUID ] = await syscoinMessageLibraryForTests.parseTransaction(txData);
    assert.equal(ret.toNumber(), 0, 'Parsed');
    assert.equal(amount.toNumber(), 1000001, 'Amount burned');
    
    
    assert.equal(inputEthAddress, utils.ethAddressFromKeyPair(keys[1]), 'Sender ethereum address');
  });
  
  it('Parse simple transaction without OP_RETURN', async () => {
    const tx = utils.buildSyscoinTransaction({
      signer: keys[1],
      inputs: [['edbbd164551c8961cf5f7f4b22d7a299dd418758b611b84c23770219e427df67', 0]],
      outputs: [
        [utils.syscoinAddressFromKeyPair(keys[1]), 1000001],
        [utils.syscoinAddressFromKeyPair(keys[0]), 1000002],
      ],
    });
    tx.version = 0x7401;
    const txData = `0x${tx.toHex()}`;
    const [ ret, amount, inputEthAddress, assetGUID ]  = await syscoinMessageLibraryForTests.parseTransaction(txData);
    assert.equal(ret.toNumber(), 0, 'Parsed');
    assert.equal(amount.toNumber(), 0, 'Amount burned');
  });  
  it('Parse transaction with OP_RETURN in vout 1', async () => {
    const tx = utils.buildSyscoinTransaction({
      signer: keys[1],
      inputs: [['edbbd164551c8961cf5f7f4b22d7a299dd418758b611b84c23770219e427df67', 0]],
      outputs: [
        [utils.syscoinAddressFromKeyPair(keys[0]), 1000002],
        ['OP_RETURN', 1000001, utils.ethAddressFromKeyPairRaw(keys[1])],
      ],
    });
    tx.version = 0x7401;
    const txData = `0x${tx.toHex()}`;
    const [ ret, amount, inputEthAddress, assetGUID ]  = await syscoinMessageLibraryForTests.parseTransaction(txData);
    assert.equal(ret.toNumber(), 0, 'Parsed');
    assert.equal(amount.toNumber(), 1000001, 'Amount burned');
    
  });
  it('Parse transaction with OP_RETURN', async () => {
    const tx = utils.buildSyscoinTransaction({
      signer: keys[1],
      inputs: [['edbbd164551c8961cf5f7f4b22d7a299dd418758b611b84c23770219e427df67', 0]],
      outputs: [
        ['OP_RETURN', 1000001, utils.ethAddressFromKeyPairRaw(keys[1])],
        [utils.syscoinAddressFromKeyPair(keys[0]), 1000002],
      ],
    });
    tx.version = 0x7401;
    const txData = `0x${tx.toHex()}`;
    
    const [ ret, amount, inputEthAddress, assetGUID ] = await syscoinMessageLibraryForTests.parseTransaction(txData);
    assert.equal(ret.toNumber(), 0, 'Parsed');
    assert.equal(amount.toNumber(), 1000001, 'Amount burned');
    
    assert.equal(inputEthAddress, utils.ethAddressFromKeyPair(keys[1]), 'Sender ethereum address');
  });
});
