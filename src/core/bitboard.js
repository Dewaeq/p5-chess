class BitboardList {
    constructor(numBitboards = 16) {
        this.bitboards = new BigUint64Array(numBitboards);
    }

    setBit(bitboardIndex, bitIndex) {
        this.bitboards[bitboardIndex] |= (1n << BigInt(bitIndex));
    }

    getBit(bitboardIndex, bitIndex) {
        return this.bitboards[bitboardIndex] >> BigInt(bitIndex) & 1n;
    }

    popBit(bitboardIndex, bitIndex) {
        this.bitboards[bitboardIndex] ^= 1n << BigInt(bitIndex);
    }

    getBitboardIndex(pieceType, colourIndex) {
        return colourIndex * 8 + pieceType;
    }

    printBitboard(bitboardIndex) {
        let output = Array(64);
        for (let i = 0; i < 64; i++) {
            const [file, rank] = BoardRepresentation.IndexToCoord(i);
            const outputSquare = BoardRepresentation.CoordToIndex(8 - rank, file);

            const bit = this.getBit(bitboardIndex, i);
            output[outputSquare] = ` | ${bit.toString(2)} | `;

            if ((i & 0b111) === 7) {
                output[outputSquare] += "\n";
            }
        }
        console.log(output.join(""));
    }
}