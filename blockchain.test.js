const Blockchain =  require('./blockchain');
const Block = require('./block');
const cryptoHash = require('./crypto-hash');

describe('Blockchain', () => {
    let blockchain, newChain, originalChain;

    beforeEach(() => {
        blockchain = new Blockchain();
        newChain = new Blockchain();

        originalChain = blockchain.chain;
    });

    it('contains a `chain` instance', () => {
        expect(blockchain.chain instanceof Array).toBe(true);
    });

    it('starts with genesis block', () => {
        expect(blockchain.chain[0]).toEqual(Block.genesis());
    });

    it('adds a new block to the chain', () => {
        const newData = 'sxhvvj';
        blockchain.addBlock({ data: newData });

        expect(blockchain.chain[blockchain.chain.length-1].data).toEqual(newData);
    });

    describe('isValidChain()', () => {
        describe('when chain does not start with genesis block', () => {
            it('returns false', () => {
                blockchain.chain[0] = { data: 'fake-data' };
                expect(Blockchain.isValidChain(blockchain.chain)).toBe(false);
            });
        });

        describe('when the chain starts with the genesis block and has multiple blocks', () => {
            beforeEach(() => {
                blockchain.addBlock({data: 'Bears'});
                blockchain.addBlock({data: 'Beats'});
                blockchain.addBlock({data: 'Battlestar Galactica'});
            });
            describe('a lasthash reference has changed', () => {
                it('returns false', () => {
                    blockchain.chain[2].lastHash = 'broken';
                    expect(Blockchain.isValidChain(blockchain.chain)).toBe(false);
                });
            });
            
            describe('chain contains a block with an invalid field', () => {
                it('returns false', () => {
                    blockchain.chain[2].data = 'baddata';
                    expect(Blockchain.isValidChain(blockchain.chain)).toBe(false);
                });
            });

            describe('chain contains a block with jumped difficuly', () => {
                it('returns false', () => {
                    const lastBlock = blockchain.chain[blockchain.chain.length-1];
                    const lastHash = lastBlock.hash;
                    const timestamp = Date.now();
                    const nonce = 0;
                    const data = [];
                    const difficulty = lastBlock.difficulty - 3;
                    const hash = cryptoHash(timestamp, lastHash, difficulty, nonce, data);
                    const badBlock = new Block({timestamp, lastHash, hash, nonce, difficulty, data});

                    blockchain.chain.push(badBlock);

                    expect(Blockchain.isValidChain(blockchain.chain)).toBe(false);
                }); 
            });

            describe('chain is alright', () => {
                it('returns true', () => {  
                    expect(Blockchain.isValidChain(blockchain.chain)).toBe(true);
                });
            });
        });
    });

    describe('replaceChain()', () => {
        let errorMock, logMock;

        beforeEach(() => {
            errorMock = jest.fn();
            logMock = jest.fn();

            global.console.error = errorMock;
            global.console.log = logMock;
        });


        describe('when the new chain is not longer', () => {
            beforeEach(() => {
                newChain.chain[0] = { new: 'chain' };
                blockchain.replaceChain(newChain.chain);
            });

            it('does not replace the chain', () => {
                expect(blockchain.chain).toEqual(originalChain);
            });

            it('logs an error', () => {
                expect(errorMock).toHaveBeenCalled();
            });
        });
        
        describe('when the new chain is longer', () => {
            beforeEach(() => {
                newChain.addBlock({data: 'The'});
                newChain.addBlock({data: 'Office'});
            })

            describe('chain is invalid', () => {
                beforeEach(() => {
                    newChain.chain[2].hash = 'fake-hash';
                    blockchain.replaceChain(newChain.chain);
                });

                it('does not replace the chain', () => {
                    expect(blockchain.chain).toEqual(originalChain);
                });

                it('logs an error', () => {
                    expect(errorMock).toHaveBeenCalled();
                });
            });

            describe('chain is valid', () => {
                beforeEach(() => {
                    blockchain.replaceChain(newChain.chain);            
                });

                it('replaces the chain', () => {
                    expect(blockchain.chain).toEqual(newChain.chain);
                });

                it('logs an output for replaced chain', () => {
                    expect(logMock).toHaveBeenCalled();
                });
            });
        });
    });
});