const Block = require('./block');
const cryptoHash = require('./crypto-hash');

class Blockchain {
    constructor() {
        this.chain = [Block.genesis()];
    }

    addBlock({data}) {
        const newBlock = Block.mineBlock({
            lastBlock: this.chain[this.chain.length-1],
            data});
        
            this.chain.push(newBlock);
    }

    static isValidChain(chain) {
        if (JSON.stringify(chain[0]) !== JSON.stringify(Block.genesis())) {
            return false;
        }
        for (let i=1; i<chain.length; i++) {
            const {timestamp, lastHash, hash, nonce, difficulty, data} = chain[i];
            const actualLastHash = chain[i-1].hash;
            const lastDifficulty = chain[i-1].difficulty;
            if (lastHash !== actualLastHash) return false;
            const validHash = cryptoHash(timestamp, lastHash, data, nonce, difficulty);
            if (hash !== validHash) return false;
            if ((lastDifficulty - difficulty) > 1) return false;
        }

        return true;
    }

    replaceChain(chain) {
        if (chain.length <= this.chain.length) {
            console.error('The chain must be longer');
            return;
        }

        if (!Blockchain.isValidChain(chain)) {
            console.error('The chain must be valid and correct');
            return;
        }

        console.log('Chain is replaced');
        this.chain = chain;
    }
}

module.exports = Blockchain;