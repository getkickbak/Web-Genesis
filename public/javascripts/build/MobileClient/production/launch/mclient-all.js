/**
* @license Gibberish-AES 
* A lightweight Javascript Libray for OpenSSL compatible AES CBC encryption.
*
* Author: Mark Percival
* Email: mark@mpercival.com
* Copyright: Mark Percival - http://mpercival.com 2008
*
* With thanks to:
* Josh Davis - http://www.josh-davis.org/ecmaScrypt
* Chris Veness - http://www.movable-type.co.uk/scripts/aes.html
* Michel I. Gallant - http://www.jensign.com/
*
* License: MIT
*
* Usage: GibberishAES.enc("secret", "password")
* Outputs: AES Encrypted text encoded in Base64
*/


window.GibberishAES = (function(){
    var Nr = 14,
    /* Default to 256 Bit Encryption */
    Nk = 8,
    Decrypt = false,

    enc_utf8 = function(s)
    {
        try {
            return unescape(encodeURIComponent(s));
        }
        catch(e) {
            throw 'Error on UTF-8 encode';
        }
    },

    dec_utf8 = function(s)
    {
        try {
            return decodeURIComponent(escape(s));
        }
        catch(e) {
            throw ('Bad Key');
        }
    },

    padBlock = function(byteArr)
    {
        var array = [], cpad, i;
        if (byteArr.length < 16) {
            cpad = 16 - byteArr.length;
            array = [cpad, cpad, cpad, cpad, cpad, cpad, cpad, cpad, cpad, cpad, cpad, cpad, cpad, cpad, cpad, cpad];
        }
        for (i = 0; i < byteArr.length; i++)
        {
            array[i] = byteArr[i];
        }
        return array;
    },

    block2s = function(block, lastBlock)
    {
        var string = '', padding, i;
        if (lastBlock) {
            padding = block[15];
            if (padding > 16) {
                throw ('Decryption error: Maybe bad key');
            }
            if (padding == 16) {
                return '';
            }
            for (i = 0; i < 16 - padding; i++) {
                string += String.fromCharCode(block[i]);
            }
        } else {
            for (i = 0; i < 16; i++) {
                string += String.fromCharCode(block[i]);
            }
        }
        return string;
    },

    a2h = function(numArr)
    {
        var string = '', i;
        for (i = 0; i < numArr.length; i++) {
            string += (numArr[i] < 16 ? '0': '') + numArr[i].toString(16);
        }
        return string;
    },

    h2a = function(s)
    {
        var ret = [];
        s.replace(/(..)/g,
        function(s) {
            ret.push(parseInt(s, 16));
        });
        return ret;
    },

    s2a = function(string, binary) {
        var array = [], i;

        if (! binary) {
            string = enc_utf8(string);
        }

        for (i = 0; i < string.length; i++)
        {
            array[i] = string.charCodeAt(i);
        }

        return array;
    },

    size = function(newsize)
    {
        switch (newsize)
        {
        case 128:
            Nr = 10;
            Nk = 4;
            break;
        case 192:
            Nr = 12;
            Nk = 6;
            break;
        case 256:
            Nr = 14;
            Nk = 8;
            break;
        default:
            throw ('Invalid Key Size Specified:' + newsize);
        }
    },

    randArr = function(num) {
        var result = [], i;
        for (i = 0; i < num; i++) {
            result = result.concat(Math.floor(Math.random() * 256));
        }
        return result;
    },

    openSSLKey = function(passwordArr, saltArr) {
        // Number of rounds depends on the size of the AES in use
        // 3 rounds for 256
        //        2 rounds for the key, 1 for the IV
        // 2 rounds for 128
        //        1 round for the key, 1 round for the IV
        // 3 rounds for 192 since it's not evenly divided by 128 bits
        var rounds = Nr >= 12 ? 3: 2,
        key = [],
        iv = [],
        md5_hash = [],
        result = [],
        data00 = passwordArr.concat(saltArr),
        i;
        md5_hash[0] = GibberishAES.Hash.MD5(data00);
        result = md5_hash[0];
        for (i = 1; i < rounds; i++) {
            md5_hash[i] = GibberishAES.Hash.MD5(md5_hash[i - 1].concat(data00));
            result = result.concat(md5_hash[i]);
        }
        key = result.slice(0, 4 * Nk);
        iv = result.slice(4 * Nk, 4 * Nk + 16);
        return {
            key: key,
            iv: iv
        };
    },

    rawEncrypt = function(plaintext, key, iv) {
        // plaintext, key and iv as byte arrays
        key = expandKey(key);
        var numBlocks = Math.ceil(plaintext.length / 16),
        blocks = [],
        i,
        cipherBlocks = [];
        for (i = 0; i < numBlocks; i++) {
            blocks[i] = padBlock(plaintext.slice(i * 16, i * 16 + 16));
        }
        if (plaintext.length % 16 === 0) {
            blocks.push([16, 16, 16, 16, 16, 16, 16, 16, 16, 16, 16, 16, 16, 16, 16, 16]);
            // CBC OpenSSL padding scheme
            numBlocks++;
        }
        for (i = 0; i < blocks.length; i++) {
            blocks[i] = (i === 0) ? xorBlocks(blocks[i], iv) : xorBlocks(blocks[i], cipherBlocks[i - 1]);
            cipherBlocks[i] = encryptBlock(blocks[i], key);
        }
        return cipherBlocks;
    },

    rawDecrypt = function(cryptArr, key, iv, binary) {
        //  cryptArr, key and iv as byte arrays
        key = expandKey(key);
        var numBlocks = cryptArr.length / 16,
        cipherBlocks = [],
        i,
        plainBlocks = [],
        string = '';
        for (i = 0; i < numBlocks; i++) {
            cipherBlocks.push(cryptArr.slice(i * 16, (i + 1) * 16));
        }
        for (i = cipherBlocks.length - 1; i >= 0; i--) {
            plainBlocks[i] = decryptBlock(cipherBlocks[i], key);
            plainBlocks[i] = (i === 0) ? xorBlocks(plainBlocks[i], iv) : xorBlocks(plainBlocks[i], cipherBlocks[i - 1]);
        }
        for (i = 0; i < numBlocks - 1; i++) {
            string += block2s(plainBlocks[i]);
        }
        string += block2s(plainBlocks[i], true);
        return binary ? string : dec_utf8(string); 
    },

    encryptBlock = function(block, words) {
        Decrypt = false;
        var state = addRoundKey(block, words, 0),
        round;
        for (round = 1; round < (Nr + 1); round++) {
            state = subBytes(state);
            state = shiftRows(state);
            if (round < Nr) {
                state = mixColumns(state);
            }
            //last round? don't mixColumns
            state = addRoundKey(state, words, round);
        }

        return state;
    },

    decryptBlock = function(block, words) {
        Decrypt = true;
        var state = addRoundKey(block, words, Nr),
        round;
        for (round = Nr - 1; round > -1; round--) {
            state = shiftRows(state);
            state = subBytes(state);
            state = addRoundKey(state, words, round);
            if (round > 0) {
                state = mixColumns(state);
            }
            //last round? don't mixColumns
        }

        return state;
    },

    subBytes = function(state) {
        var S = Decrypt ? SBoxInv: SBox,
        temp = [],
        i;
        for (i = 0; i < 16; i++) {
            temp[i] = S[state[i]];
        }
        return temp;
    },

    shiftRows = function(state) {
        var temp = [],
        shiftBy = Decrypt ? [0, 13, 10, 7, 4, 1, 14, 11, 8, 5, 2, 15, 12, 9, 6, 3] : [0, 5, 10, 15, 4, 9, 14, 3, 8, 13, 2, 7, 12, 1, 6, 11],
        i;
        for (i = 0; i < 16; i++) {
            temp[i] = state[shiftBy[i]];
        }
        return temp;
    },

    mixColumns = function(state) {
        var t = [],
        c;
        if (!Decrypt) {
            for (c = 0; c < 4; c++) {
                t[c * 4] = G2X[state[c * 4]] ^ G3X[state[1 + c * 4]] ^ state[2 + c * 4] ^ state[3 + c * 4];
                t[1 + c * 4] = state[c * 4] ^ G2X[state[1 + c * 4]] ^ G3X[state[2 + c * 4]] ^ state[3 + c * 4];
                t[2 + c * 4] = state[c * 4] ^ state[1 + c * 4] ^ G2X[state[2 + c * 4]] ^ G3X[state[3 + c * 4]];
                t[3 + c * 4] = G3X[state[c * 4]] ^ state[1 + c * 4] ^ state[2 + c * 4] ^ G2X[state[3 + c * 4]];
            }
        }else {
            for (c = 0; c < 4; c++) {
                t[c*4] = GEX[state[c*4]] ^ GBX[state[1+c*4]] ^ GDX[state[2+c*4]] ^ G9X[state[3+c*4]];
                t[1+c*4] = G9X[state[c*4]] ^ GEX[state[1+c*4]] ^ GBX[state[2+c*4]] ^ GDX[state[3+c*4]];
                t[2+c*4] = GDX[state[c*4]] ^ G9X[state[1+c*4]] ^ GEX[state[2+c*4]] ^ GBX[state[3+c*4]];
                t[3+c*4] = GBX[state[c*4]] ^ GDX[state[1+c*4]] ^ G9X[state[2+c*4]] ^ GEX[state[3+c*4]];
            }
        }
        
        return t;
    },

    addRoundKey = function(state, words, round) {
        var temp = [],
        i;
        for (i = 0; i < 16; i++) {
            temp[i] = state[i] ^ words[round][i];
        }
        return temp;
    },

    xorBlocks = function(block1, block2) {
        var temp = [],
        i;
        for (i = 0; i < 16; i++) {
            temp[i] = block1[i] ^ block2[i];
        }
        return temp;
    },

    expandKey = function(key) {
        // Expects a 1d number array
        var w = [],
        temp = [],
        i,
        r,
        t,
        flat = [],
        j;

        for (i = 0; i < Nk; i++) {
            r = [key[4 * i], key[4 * i + 1], key[4 * i + 2], key[4 * i + 3]];
            w[i] = r;
        }

        for (i = Nk; i < (4 * (Nr + 1)); i++) {
            w[i] = [];
            for (t = 0; t < 4; t++) {
                temp[t] = w[i - 1][t];
            }
            if (i % Nk === 0) {
                temp = subWord(rotWord(temp));
                temp[0] ^= Rcon[i / Nk - 1];
            } else if (Nk > 6 && i % Nk == 4) {
                temp = subWord(temp);
            }
            for (t = 0; t < 4; t++) {
                w[i][t] = w[i - Nk][t] ^ temp[t];
            }
        }
        for (i = 0; i < (Nr + 1); i++) {
            flat[i] = [];
            for (j = 0; j < 4; j++) {
                flat[i].push(w[i * 4 + j][0], w[i * 4 + j][1], w[i * 4 + j][2], w[i * 4 + j][3]);
            }
        }
        return flat;
    },

    subWord = function(w) {
        // apply SBox to 4-byte word w
        for (var i = 0; i < 4; i++) {
            w[i] = SBox[w[i]];
        }
        return w;
    },

    rotWord = function(w) {
        // rotate 4-byte word w left by one byte
        var tmp = w[0],
        i;
        for (i = 0; i < 4; i++) {
            w[i] = w[i + 1];
        }
        w[3] = tmp;
        return w;
    },


    // S-box
    SBox = [
    99, 124, 119, 123, 242, 107, 111, 197, 48, 1, 103, 43, 254, 215, 171,
    118, 202, 130, 201, 125, 250, 89, 71, 240, 173, 212, 162, 175, 156, 164,
    114, 192, 183, 253, 147, 38, 54, 63, 247, 204, 52, 165, 229, 241, 113,
    216, 49, 21, 4, 199, 35, 195, 24, 150, 5, 154, 7, 18, 128, 226,
    235, 39, 178, 117, 9, 131, 44, 26, 27, 110, 90, 160, 82, 59, 214,
    179, 41, 227, 47, 132, 83, 209, 0, 237, 32, 252, 177, 91, 106, 203,
    190, 57, 74, 76, 88, 207, 208, 239, 170, 251, 67, 77, 51, 133, 69,
    249, 2, 127, 80, 60, 159, 168, 81, 163, 64, 143, 146, 157, 56, 245,
    188, 182, 218, 33, 16, 255, 243, 210, 205, 12, 19, 236, 95, 151, 68,
    23, 196, 167, 126, 61, 100, 93, 25, 115, 96, 129, 79, 220, 34, 42,
    144, 136, 70, 238, 184, 20, 222, 94, 11, 219, 224, 50, 58, 10, 73,
    6, 36, 92, 194, 211, 172, 98, 145, 149, 228, 121, 231, 200, 55, 109,
    141, 213, 78, 169, 108, 86, 244, 234, 101, 122, 174, 8, 186, 120, 37,
    46, 28, 166, 180, 198, 232, 221, 116, 31, 75, 189, 139, 138, 112, 62,
    181, 102, 72, 3, 246, 14, 97, 53, 87, 185, 134, 193, 29, 158, 225,
    248, 152, 17, 105, 217, 142, 148, 155, 30, 135, 233, 206, 85, 40, 223,
    140, 161, 137, 13, 191, 230, 66, 104, 65, 153, 45, 15, 176, 84, 187,
    22],

    // Precomputed lookup table for the inverse SBox
    SBoxInv = [
    82, 9, 106, 213, 48, 54, 165, 56, 191, 64, 163, 158, 129, 243, 215,
    251, 124, 227, 57, 130, 155, 47, 255, 135, 52, 142, 67, 68, 196, 222,
    233, 203, 84, 123, 148, 50, 166, 194, 35, 61, 238, 76, 149, 11, 66,
    250, 195, 78, 8, 46, 161, 102, 40, 217, 36, 178, 118, 91, 162, 73,
    109, 139, 209, 37, 114, 248, 246, 100, 134, 104, 152, 22, 212, 164, 92,
    204, 93, 101, 182, 146, 108, 112, 72, 80, 253, 237, 185, 218, 94, 21,
    70, 87, 167, 141, 157, 132, 144, 216, 171, 0, 140, 188, 211, 10, 247,
    228, 88, 5, 184, 179, 69, 6, 208, 44, 30, 143, 202, 63, 15, 2,
    193, 175, 189, 3, 1, 19, 138, 107, 58, 145, 17, 65, 79, 103, 220,
    234, 151, 242, 207, 206, 240, 180, 230, 115, 150, 172, 116, 34, 231, 173,
    53, 133, 226, 249, 55, 232, 28, 117, 223, 110, 71, 241, 26, 113, 29,
    41, 197, 137, 111, 183, 98, 14, 170, 24, 190, 27, 252, 86, 62, 75,
    198, 210, 121, 32, 154, 219, 192, 254, 120, 205, 90, 244, 31, 221, 168,
    51, 136, 7, 199, 49, 177, 18, 16, 89, 39, 128, 236, 95, 96, 81,
    127, 169, 25, 181, 74, 13, 45, 229, 122, 159, 147, 201, 156, 239, 160,
    224, 59, 77, 174, 42, 245, 176, 200, 235, 187, 60, 131, 83, 153, 97,
    23, 43, 4, 126, 186, 119, 214, 38, 225, 105, 20, 99, 85, 33, 12,
    125],
    // Rijndael Rcon
    Rcon = [1, 2, 4, 8, 16, 32, 64, 128, 27, 54, 108, 216, 171, 77, 154, 47, 94,
    188, 99, 198, 151, 53, 106, 212, 179, 125, 250, 239, 197, 145],

    G2X = [
    0x00, 0x02, 0x04, 0x06, 0x08, 0x0a, 0x0c, 0x0e, 0x10, 0x12, 0x14, 0x16,
    0x18, 0x1a, 0x1c, 0x1e, 0x20, 0x22, 0x24, 0x26, 0x28, 0x2a, 0x2c, 0x2e,
    0x30, 0x32, 0x34, 0x36, 0x38, 0x3a, 0x3c, 0x3e, 0x40, 0x42, 0x44, 0x46,
    0x48, 0x4a, 0x4c, 0x4e, 0x50, 0x52, 0x54, 0x56, 0x58, 0x5a, 0x5c, 0x5e,
    0x60, 0x62, 0x64, 0x66, 0x68, 0x6a, 0x6c, 0x6e, 0x70, 0x72, 0x74, 0x76,
    0x78, 0x7a, 0x7c, 0x7e, 0x80, 0x82, 0x84, 0x86, 0x88, 0x8a, 0x8c, 0x8e,
    0x90, 0x92, 0x94, 0x96, 0x98, 0x9a, 0x9c, 0x9e, 0xa0, 0xa2, 0xa4, 0xa6,
    0xa8, 0xaa, 0xac, 0xae, 0xb0, 0xb2, 0xb4, 0xb6, 0xb8, 0xba, 0xbc, 0xbe,
    0xc0, 0xc2, 0xc4, 0xc6, 0xc8, 0xca, 0xcc, 0xce, 0xd0, 0xd2, 0xd4, 0xd6,
    0xd8, 0xda, 0xdc, 0xde, 0xe0, 0xe2, 0xe4, 0xe6, 0xe8, 0xea, 0xec, 0xee,
    0xf0, 0xf2, 0xf4, 0xf6, 0xf8, 0xfa, 0xfc, 0xfe, 0x1b, 0x19, 0x1f, 0x1d,
    0x13, 0x11, 0x17, 0x15, 0x0b, 0x09, 0x0f, 0x0d, 0x03, 0x01, 0x07, 0x05,
    0x3b, 0x39, 0x3f, 0x3d, 0x33, 0x31, 0x37, 0x35, 0x2b, 0x29, 0x2f, 0x2d,
    0x23, 0x21, 0x27, 0x25, 0x5b, 0x59, 0x5f, 0x5d, 0x53, 0x51, 0x57, 0x55,
    0x4b, 0x49, 0x4f, 0x4d, 0x43, 0x41, 0x47, 0x45, 0x7b, 0x79, 0x7f, 0x7d,
    0x73, 0x71, 0x77, 0x75, 0x6b, 0x69, 0x6f, 0x6d, 0x63, 0x61, 0x67, 0x65,
    0x9b, 0x99, 0x9f, 0x9d, 0x93, 0x91, 0x97, 0x95, 0x8b, 0x89, 0x8f, 0x8d,
    0x83, 0x81, 0x87, 0x85, 0xbb, 0xb9, 0xbf, 0xbd, 0xb3, 0xb1, 0xb7, 0xb5,
    0xab, 0xa9, 0xaf, 0xad, 0xa3, 0xa1, 0xa7, 0xa5, 0xdb, 0xd9, 0xdf, 0xdd,
    0xd3, 0xd1, 0xd7, 0xd5, 0xcb, 0xc9, 0xcf, 0xcd, 0xc3, 0xc1, 0xc7, 0xc5,
    0xfb, 0xf9, 0xff, 0xfd, 0xf3, 0xf1, 0xf7, 0xf5, 0xeb, 0xe9, 0xef, 0xed,
    0xe3, 0xe1, 0xe7, 0xe5
    ],

    G3X = [
    0x00, 0x03, 0x06, 0x05, 0x0c, 0x0f, 0x0a, 0x09, 0x18, 0x1b, 0x1e, 0x1d,
    0x14, 0x17, 0x12, 0x11, 0x30, 0x33, 0x36, 0x35, 0x3c, 0x3f, 0x3a, 0x39,
    0x28, 0x2b, 0x2e, 0x2d, 0x24, 0x27, 0x22, 0x21, 0x60, 0x63, 0x66, 0x65,
    0x6c, 0x6f, 0x6a, 0x69, 0x78, 0x7b, 0x7e, 0x7d, 0x74, 0x77, 0x72, 0x71,
    0x50, 0x53, 0x56, 0x55, 0x5c, 0x5f, 0x5a, 0x59, 0x48, 0x4b, 0x4e, 0x4d,
    0x44, 0x47, 0x42, 0x41, 0xc0, 0xc3, 0xc6, 0xc5, 0xcc, 0xcf, 0xca, 0xc9,
    0xd8, 0xdb, 0xde, 0xdd, 0xd4, 0xd7, 0xd2, 0xd1, 0xf0, 0xf3, 0xf6, 0xf5,
    0xfc, 0xff, 0xfa, 0xf9, 0xe8, 0xeb, 0xee, 0xed, 0xe4, 0xe7, 0xe2, 0xe1,
    0xa0, 0xa3, 0xa6, 0xa5, 0xac, 0xaf, 0xaa, 0xa9, 0xb8, 0xbb, 0xbe, 0xbd,
    0xb4, 0xb7, 0xb2, 0xb1, 0x90, 0x93, 0x96, 0x95, 0x9c, 0x9f, 0x9a, 0x99,
    0x88, 0x8b, 0x8e, 0x8d, 0x84, 0x87, 0x82, 0x81, 0x9b, 0x98, 0x9d, 0x9e,
    0x97, 0x94, 0x91, 0x92, 0x83, 0x80, 0x85, 0x86, 0x8f, 0x8c, 0x89, 0x8a,
    0xab, 0xa8, 0xad, 0xae, 0xa7, 0xa4, 0xa1, 0xa2, 0xb3, 0xb0, 0xb5, 0xb6,
    0xbf, 0xbc, 0xb9, 0xba, 0xfb, 0xf8, 0xfd, 0xfe, 0xf7, 0xf4, 0xf1, 0xf2,
    0xe3, 0xe0, 0xe5, 0xe6, 0xef, 0xec, 0xe9, 0xea, 0xcb, 0xc8, 0xcd, 0xce,
    0xc7, 0xc4, 0xc1, 0xc2, 0xd3, 0xd0, 0xd5, 0xd6, 0xdf, 0xdc, 0xd9, 0xda,
    0x5b, 0x58, 0x5d, 0x5e, 0x57, 0x54, 0x51, 0x52, 0x43, 0x40, 0x45, 0x46,
    0x4f, 0x4c, 0x49, 0x4a, 0x6b, 0x68, 0x6d, 0x6e, 0x67, 0x64, 0x61, 0x62,
    0x73, 0x70, 0x75, 0x76, 0x7f, 0x7c, 0x79, 0x7a, 0x3b, 0x38, 0x3d, 0x3e,
    0x37, 0x34, 0x31, 0x32, 0x23, 0x20, 0x25, 0x26, 0x2f, 0x2c, 0x29, 0x2a,
    0x0b, 0x08, 0x0d, 0x0e, 0x07, 0x04, 0x01, 0x02, 0x13, 0x10, 0x15, 0x16,
    0x1f, 0x1c, 0x19, 0x1a
    ],

    G9X = [
    0x00, 0x09, 0x12, 0x1b, 0x24, 0x2d, 0x36, 0x3f, 0x48, 0x41, 0x5a, 0x53,
    0x6c, 0x65, 0x7e, 0x77, 0x90, 0x99, 0x82, 0x8b, 0xb4, 0xbd, 0xa6, 0xaf,
    0xd8, 0xd1, 0xca, 0xc3, 0xfc, 0xf5, 0xee, 0xe7, 0x3b, 0x32, 0x29, 0x20,
    0x1f, 0x16, 0x0d, 0x04, 0x73, 0x7a, 0x61, 0x68, 0x57, 0x5e, 0x45, 0x4c,
    0xab, 0xa2, 0xb9, 0xb0, 0x8f, 0x86, 0x9d, 0x94, 0xe3, 0xea, 0xf1, 0xf8,
    0xc7, 0xce, 0xd5, 0xdc, 0x76, 0x7f, 0x64, 0x6d, 0x52, 0x5b, 0x40, 0x49,
    0x3e, 0x37, 0x2c, 0x25, 0x1a, 0x13, 0x08, 0x01, 0xe6, 0xef, 0xf4, 0xfd,
    0xc2, 0xcb, 0xd0, 0xd9, 0xae, 0xa7, 0xbc, 0xb5, 0x8a, 0x83, 0x98, 0x91,
    0x4d, 0x44, 0x5f, 0x56, 0x69, 0x60, 0x7b, 0x72, 0x05, 0x0c, 0x17, 0x1e,
    0x21, 0x28, 0x33, 0x3a, 0xdd, 0xd4, 0xcf, 0xc6, 0xf9, 0xf0, 0xeb, 0xe2,
    0x95, 0x9c, 0x87, 0x8e, 0xb1, 0xb8, 0xa3, 0xaa, 0xec, 0xe5, 0xfe, 0xf7,
    0xc8, 0xc1, 0xda, 0xd3, 0xa4, 0xad, 0xb6, 0xbf, 0x80, 0x89, 0x92, 0x9b,
    0x7c, 0x75, 0x6e, 0x67, 0x58, 0x51, 0x4a, 0x43, 0x34, 0x3d, 0x26, 0x2f,
    0x10, 0x19, 0x02, 0x0b, 0xd7, 0xde, 0xc5, 0xcc, 0xf3, 0xfa, 0xe1, 0xe8,
    0x9f, 0x96, 0x8d, 0x84, 0xbb, 0xb2, 0xa9, 0xa0, 0x47, 0x4e, 0x55, 0x5c,
    0x63, 0x6a, 0x71, 0x78, 0x0f, 0x06, 0x1d, 0x14, 0x2b, 0x22, 0x39, 0x30,
    0x9a, 0x93, 0x88, 0x81, 0xbe, 0xb7, 0xac, 0xa5, 0xd2, 0xdb, 0xc0, 0xc9,
    0xf6, 0xff, 0xe4, 0xed, 0x0a, 0x03, 0x18, 0x11, 0x2e, 0x27, 0x3c, 0x35,
    0x42, 0x4b, 0x50, 0x59, 0x66, 0x6f, 0x74, 0x7d, 0xa1, 0xa8, 0xb3, 0xba,
    0x85, 0x8c, 0x97, 0x9e, 0xe9, 0xe0, 0xfb, 0xf2, 0xcd, 0xc4, 0xdf, 0xd6,
    0x31, 0x38, 0x23, 0x2a, 0x15, 0x1c, 0x07, 0x0e, 0x79, 0x70, 0x6b, 0x62,
    0x5d, 0x54, 0x4f, 0x46
    ],

    GBX = [
    0x00, 0x0b, 0x16, 0x1d, 0x2c, 0x27, 0x3a, 0x31, 0x58, 0x53, 0x4e, 0x45,
    0x74, 0x7f, 0x62, 0x69, 0xb0, 0xbb, 0xa6, 0xad, 0x9c, 0x97, 0x8a, 0x81,
    0xe8, 0xe3, 0xfe, 0xf5, 0xc4, 0xcf, 0xd2, 0xd9, 0x7b, 0x70, 0x6d, 0x66,
    0x57, 0x5c, 0x41, 0x4a, 0x23, 0x28, 0x35, 0x3e, 0x0f, 0x04, 0x19, 0x12,
    0xcb, 0xc0, 0xdd, 0xd6, 0xe7, 0xec, 0xf1, 0xfa, 0x93, 0x98, 0x85, 0x8e,
    0xbf, 0xb4, 0xa9, 0xa2, 0xf6, 0xfd, 0xe0, 0xeb, 0xda, 0xd1, 0xcc, 0xc7,
    0xae, 0xa5, 0xb8, 0xb3, 0x82, 0x89, 0x94, 0x9f, 0x46, 0x4d, 0x50, 0x5b,
    0x6a, 0x61, 0x7c, 0x77, 0x1e, 0x15, 0x08, 0x03, 0x32, 0x39, 0x24, 0x2f,
    0x8d, 0x86, 0x9b, 0x90, 0xa1, 0xaa, 0xb7, 0xbc, 0xd5, 0xde, 0xc3, 0xc8,
    0xf9, 0xf2, 0xef, 0xe4, 0x3d, 0x36, 0x2b, 0x20, 0x11, 0x1a, 0x07, 0x0c,
    0x65, 0x6e, 0x73, 0x78, 0x49, 0x42, 0x5f, 0x54, 0xf7, 0xfc, 0xe1, 0xea,
    0xdb, 0xd0, 0xcd, 0xc6, 0xaf, 0xa4, 0xb9, 0xb2, 0x83, 0x88, 0x95, 0x9e,
    0x47, 0x4c, 0x51, 0x5a, 0x6b, 0x60, 0x7d, 0x76, 0x1f, 0x14, 0x09, 0x02,
    0x33, 0x38, 0x25, 0x2e, 0x8c, 0x87, 0x9a, 0x91, 0xa0, 0xab, 0xb6, 0xbd,
    0xd4, 0xdf, 0xc2, 0xc9, 0xf8, 0xf3, 0xee, 0xe5, 0x3c, 0x37, 0x2a, 0x21,
    0x10, 0x1b, 0x06, 0x0d, 0x64, 0x6f, 0x72, 0x79, 0x48, 0x43, 0x5e, 0x55,
    0x01, 0x0a, 0x17, 0x1c, 0x2d, 0x26, 0x3b, 0x30, 0x59, 0x52, 0x4f, 0x44,
    0x75, 0x7e, 0x63, 0x68, 0xb1, 0xba, 0xa7, 0xac, 0x9d, 0x96, 0x8b, 0x80,
    0xe9, 0xe2, 0xff, 0xf4, 0xc5, 0xce, 0xd3, 0xd8, 0x7a, 0x71, 0x6c, 0x67,
    0x56, 0x5d, 0x40, 0x4b, 0x22, 0x29, 0x34, 0x3f, 0x0e, 0x05, 0x18, 0x13,
    0xca, 0xc1, 0xdc, 0xd7, 0xe6, 0xed, 0xf0, 0xfb, 0x92, 0x99, 0x84, 0x8f,
    0xbe, 0xb5, 0xa8, 0xa3
    ],

    GDX = [
    0x00, 0x0d, 0x1a, 0x17, 0x34, 0x39, 0x2e, 0x23, 0x68, 0x65, 0x72, 0x7f,
    0x5c, 0x51, 0x46, 0x4b, 0xd0, 0xdd, 0xca, 0xc7, 0xe4, 0xe9, 0xfe, 0xf3,
    0xb8, 0xb5, 0xa2, 0xaf, 0x8c, 0x81, 0x96, 0x9b, 0xbb, 0xb6, 0xa1, 0xac,
    0x8f, 0x82, 0x95, 0x98, 0xd3, 0xde, 0xc9, 0xc4, 0xe7, 0xea, 0xfd, 0xf0,
    0x6b, 0x66, 0x71, 0x7c, 0x5f, 0x52, 0x45, 0x48, 0x03, 0x0e, 0x19, 0x14,
    0x37, 0x3a, 0x2d, 0x20, 0x6d, 0x60, 0x77, 0x7a, 0x59, 0x54, 0x43, 0x4e,
    0x05, 0x08, 0x1f, 0x12, 0x31, 0x3c, 0x2b, 0x26, 0xbd, 0xb0, 0xa7, 0xaa,
    0x89, 0x84, 0x93, 0x9e, 0xd5, 0xd8, 0xcf, 0xc2, 0xe1, 0xec, 0xfb, 0xf6,
    0xd6, 0xdb, 0xcc, 0xc1, 0xe2, 0xef, 0xf8, 0xf5, 0xbe, 0xb3, 0xa4, 0xa9,
    0x8a, 0x87, 0x90, 0x9d, 0x06, 0x0b, 0x1c, 0x11, 0x32, 0x3f, 0x28, 0x25,
    0x6e, 0x63, 0x74, 0x79, 0x5a, 0x57, 0x40, 0x4d, 0xda, 0xd7, 0xc0, 0xcd,
    0xee, 0xe3, 0xf4, 0xf9, 0xb2, 0xbf, 0xa8, 0xa5, 0x86, 0x8b, 0x9c, 0x91,
    0x0a, 0x07, 0x10, 0x1d, 0x3e, 0x33, 0x24, 0x29, 0x62, 0x6f, 0x78, 0x75,
    0x56, 0x5b, 0x4c, 0x41, 0x61, 0x6c, 0x7b, 0x76, 0x55, 0x58, 0x4f, 0x42,
    0x09, 0x04, 0x13, 0x1e, 0x3d, 0x30, 0x27, 0x2a, 0xb1, 0xbc, 0xab, 0xa6,
    0x85, 0x88, 0x9f, 0x92, 0xd9, 0xd4, 0xc3, 0xce, 0xed, 0xe0, 0xf7, 0xfa,
    0xb7, 0xba, 0xad, 0xa0, 0x83, 0x8e, 0x99, 0x94, 0xdf, 0xd2, 0xc5, 0xc8,
    0xeb, 0xe6, 0xf1, 0xfc, 0x67, 0x6a, 0x7d, 0x70, 0x53, 0x5e, 0x49, 0x44,
    0x0f, 0x02, 0x15, 0x18, 0x3b, 0x36, 0x21, 0x2c, 0x0c, 0x01, 0x16, 0x1b,
    0x38, 0x35, 0x22, 0x2f, 0x64, 0x69, 0x7e, 0x73, 0x50, 0x5d, 0x4a, 0x47,
    0xdc, 0xd1, 0xc6, 0xcb, 0xe8, 0xe5, 0xf2, 0xff, 0xb4, 0xb9, 0xae, 0xa3,
    0x80, 0x8d, 0x9a, 0x97
    ],

    GEX = [
    0x00, 0x0e, 0x1c, 0x12, 0x38, 0x36, 0x24, 0x2a, 0x70, 0x7e, 0x6c, 0x62,
    0x48, 0x46, 0x54, 0x5a, 0xe0, 0xee, 0xfc, 0xf2, 0xd8, 0xd6, 0xc4, 0xca,
    0x90, 0x9e, 0x8c, 0x82, 0xa8, 0xa6, 0xb4, 0xba, 0xdb, 0xd5, 0xc7, 0xc9,
    0xe3, 0xed, 0xff, 0xf1, 0xab, 0xa5, 0xb7, 0xb9, 0x93, 0x9d, 0x8f, 0x81,
    0x3b, 0x35, 0x27, 0x29, 0x03, 0x0d, 0x1f, 0x11, 0x4b, 0x45, 0x57, 0x59,
    0x73, 0x7d, 0x6f, 0x61, 0xad, 0xa3, 0xb1, 0xbf, 0x95, 0x9b, 0x89, 0x87,
    0xdd, 0xd3, 0xc1, 0xcf, 0xe5, 0xeb, 0xf9, 0xf7, 0x4d, 0x43, 0x51, 0x5f,
    0x75, 0x7b, 0x69, 0x67, 0x3d, 0x33, 0x21, 0x2f, 0x05, 0x0b, 0x19, 0x17,
    0x76, 0x78, 0x6a, 0x64, 0x4e, 0x40, 0x52, 0x5c, 0x06, 0x08, 0x1a, 0x14,
    0x3e, 0x30, 0x22, 0x2c, 0x96, 0x98, 0x8a, 0x84, 0xae, 0xa0, 0xb2, 0xbc,
    0xe6, 0xe8, 0xfa, 0xf4, 0xde, 0xd0, 0xc2, 0xcc, 0x41, 0x4f, 0x5d, 0x53,
    0x79, 0x77, 0x65, 0x6b, 0x31, 0x3f, 0x2d, 0x23, 0x09, 0x07, 0x15, 0x1b,
    0xa1, 0xaf, 0xbd, 0xb3, 0x99, 0x97, 0x85, 0x8b, 0xd1, 0xdf, 0xcd, 0xc3,
    0xe9, 0xe7, 0xf5, 0xfb, 0x9a, 0x94, 0x86, 0x88, 0xa2, 0xac, 0xbe, 0xb0,
    0xea, 0xe4, 0xf6, 0xf8, 0xd2, 0xdc, 0xce, 0xc0, 0x7a, 0x74, 0x66, 0x68,
    0x42, 0x4c, 0x5e, 0x50, 0x0a, 0x04, 0x16, 0x18, 0x32, 0x3c, 0x2e, 0x20,
    0xec, 0xe2, 0xf0, 0xfe, 0xd4, 0xda, 0xc8, 0xc6, 0x9c, 0x92, 0x80, 0x8e,
    0xa4, 0xaa, 0xb8, 0xb6, 0x0c, 0x02, 0x10, 0x1e, 0x34, 0x3a, 0x28, 0x26,
    0x7c, 0x72, 0x60, 0x6e, 0x44, 0x4a, 0x58, 0x56, 0x37, 0x39, 0x2b, 0x25,
    0x0f, 0x01, 0x13, 0x1d, 0x47, 0x49, 0x5b, 0x55, 0x7f, 0x71, 0x63, 0x6d,
    0xd7, 0xd9, 0xcb, 0xc5, 0xef, 0xe1, 0xf3, 0xfd, 0xa7, 0xa9, 0xbb, 0xb5,
    0x9f, 0x91, 0x83, 0x8d
    ],

    enc = function(string, pass, binary) {
        // string, password in plaintext
        var salt = randArr(8),
        pbe = openSSLKey(s2a(pass, binary), salt),
        key = pbe.key,
        iv = pbe.iv,
        cipherBlocks,
        saltBlock = [[83, 97, 108, 116, 101, 100, 95, 95].concat(salt)];
        string = s2a(string, binary);
        cipherBlocks = rawEncrypt(string, key, iv);
        // Spells out 'Salted__'
        cipherBlocks = saltBlock.concat(cipherBlocks);
        return Base64.encode(cipherBlocks);
    },

    dec = function(string, pass, binary) {
        // string, password in plaintext
        var cryptArr = Base64.decode(string),
        salt = cryptArr.slice(8, 16),
        pbe = openSSLKey(s2a(pass, binary), salt),
        key = pbe.key,
        iv = pbe.iv;
        cryptArr = cryptArr.slice(16, cryptArr.length);
        // Take off the Salted__ffeeddcc
        string = rawDecrypt(cryptArr, key, iv, binary);
        return string;
    },
    
    MD5 = function(numArr) {

        function rotateLeft(lValue, iShiftBits) {
            return (lValue << iShiftBits) | (lValue >>> (32 - iShiftBits));
        }

        function addUnsigned(lX, lY) {
            var lX4,
            lY4,
            lX8,
            lY8,
            lResult;
            lX8 = (lX & 0x80000000);
            lY8 = (lY & 0x80000000);
            lX4 = (lX & 0x40000000);
            lY4 = (lY & 0x40000000);
            lResult = (lX & 0x3FFFFFFF) + (lY & 0x3FFFFFFF);
            if (lX4 & lY4) {
                return (lResult ^ 0x80000000 ^ lX8 ^ lY8);
            }
            if (lX4 | lY4) {
                if (lResult & 0x40000000) {
                    return (lResult ^ 0xC0000000 ^ lX8 ^ lY8);
                } else {
                    return (lResult ^ 0x40000000 ^ lX8 ^ lY8);
                }
            } else {
                return (lResult ^ lX8 ^ lY8);
            }
        }

        function f(x, y, z) {
            return (x & y) | ((~x) & z);
        }
        function g(x, y, z) {
            return (x & z) | (y & (~z));
        }
        function h(x, y, z) {
            return (x ^ y ^ z);
        }
        function funcI(x, y, z) {
            return (y ^ (x | (~z)));
        }

        function ff(a, b, c, d, x, s, ac) {
            a = addUnsigned(a, addUnsigned(addUnsigned(f(b, c, d), x), ac));
            return addUnsigned(rotateLeft(a, s), b);
        }

        function gg(a, b, c, d, x, s, ac) {
            a = addUnsigned(a, addUnsigned(addUnsigned(g(b, c, d), x), ac));
            return addUnsigned(rotateLeft(a, s), b);
        }

        function hh(a, b, c, d, x, s, ac) {
            a = addUnsigned(a, addUnsigned(addUnsigned(h(b, c, d), x), ac));
            return addUnsigned(rotateLeft(a, s), b);
        }

        function ii(a, b, c, d, x, s, ac) {
            a = addUnsigned(a, addUnsigned(addUnsigned(funcI(b, c, d), x), ac));
            return addUnsigned(rotateLeft(a, s), b);
        }

        function convertToWordArray(numArr) {
            var lWordCount,
            lMessageLength = numArr.length,
            lNumberOfWords_temp1 = lMessageLength + 8,
            lNumberOfWords_temp2 = (lNumberOfWords_temp1 - (lNumberOfWords_temp1 % 64)) / 64,
            lNumberOfWords = (lNumberOfWords_temp2 + 1) * 16,
            lWordArray = [],
            lBytePosition = 0,
            lByteCount = 0;
            while (lByteCount < lMessageLength) {
                lWordCount = (lByteCount - (lByteCount % 4)) / 4;
                lBytePosition = (lByteCount % 4) * 8;
                lWordArray[lWordCount] = (lWordArray[lWordCount] | (numArr[lByteCount] << lBytePosition));
                lByteCount++;
            }
            lWordCount = (lByteCount - (lByteCount % 4)) / 4;
            lBytePosition = (lByteCount % 4) * 8;
            lWordArray[lWordCount] = lWordArray[lWordCount] | (0x80 << lBytePosition);
            lWordArray[lNumberOfWords - 2] = lMessageLength << 3;
            lWordArray[lNumberOfWords - 1] = lMessageLength >>> 29;
            return lWordArray;
        }

        function wordToHex(lValue) {
            var lByte,
            lCount,
            wordToHexArr = [];
            for (lCount = 0; lCount <= 3; lCount++) {
                lByte = (lValue >>> (lCount * 8)) & 255;
                wordToHexArr = wordToHexArr.concat(lByte);
             }
            return wordToHexArr;
        }

        /*function utf8Encode(string) {
            string = string.replace(/\r\n/g, "\n");
            var utftext = "",
            n,
            c;

            for (n = 0; n < string.length; n++) {

                c = string.charCodeAt(n);

                if (c < 128) {
                    utftext += String.fromCharCode(c);
                }
                else if ((c > 127) && (c < 2048)) {
                    utftext += String.fromCharCode((c >> 6) | 192);
                    utftext += String.fromCharCode((c & 63) | 128);
                }
                else {
                    utftext += String.fromCharCode((c >> 12) | 224);
                    utftext += String.fromCharCode(((c >> 6) & 63) | 128);
                    utftext += String.fromCharCode((c & 63) | 128);
                }

            }

            return utftext;
        }*/

        var x = [],
        k,
        AA,
        BB,
        CC,
        DD,
        a,
        b,
        c,
        d,
        S11 = 7,
        S12 = 12,
        S13 = 17,
        S14 = 22,
        S21 = 5,
        S22 = 9,
        S23 = 14,
        S24 = 20,
        S31 = 4,
        S32 = 11,
        S33 = 16,
        S34 = 23,
        S41 = 6,
        S42 = 10,
        S43 = 15,
        S44 = 21;

        x = convertToWordArray(numArr);

        a = 0x67452301;
        b = 0xEFCDAB89;
        c = 0x98BADCFE;
        d = 0x10325476;

        for (k = 0; k < x.length; k += 16) {
            AA = a;
            BB = b;
            CC = c;
            DD = d;
            a = ff(a, b, c, d, x[k + 0], S11, 0xD76AA478);
            d = ff(d, a, b, c, x[k + 1], S12, 0xE8C7B756);
            c = ff(c, d, a, b, x[k + 2], S13, 0x242070DB);
            b = ff(b, c, d, a, x[k + 3], S14, 0xC1BDCEEE);
            a = ff(a, b, c, d, x[k + 4], S11, 0xF57C0FAF);
            d = ff(d, a, b, c, x[k + 5], S12, 0x4787C62A);
            c = ff(c, d, a, b, x[k + 6], S13, 0xA8304613);
            b = ff(b, c, d, a, x[k + 7], S14, 0xFD469501);
            a = ff(a, b, c, d, x[k + 8], S11, 0x698098D8);
            d = ff(d, a, b, c, x[k + 9], S12, 0x8B44F7AF);
            c = ff(c, d, a, b, x[k + 10], S13, 0xFFFF5BB1);
            b = ff(b, c, d, a, x[k + 11], S14, 0x895CD7BE);
            a = ff(a, b, c, d, x[k + 12], S11, 0x6B901122);
            d = ff(d, a, b, c, x[k + 13], S12, 0xFD987193);
            c = ff(c, d, a, b, x[k + 14], S13, 0xA679438E);
            b = ff(b, c, d, a, x[k + 15], S14, 0x49B40821);
            a = gg(a, b, c, d, x[k + 1], S21, 0xF61E2562);
            d = gg(d, a, b, c, x[k + 6], S22, 0xC040B340);
            c = gg(c, d, a, b, x[k + 11], S23, 0x265E5A51);
            b = gg(b, c, d, a, x[k + 0], S24, 0xE9B6C7AA);
            a = gg(a, b, c, d, x[k + 5], S21, 0xD62F105D);
            d = gg(d, a, b, c, x[k + 10], S22, 0x2441453);
            c = gg(c, d, a, b, x[k + 15], S23, 0xD8A1E681);
            b = gg(b, c, d, a, x[k + 4], S24, 0xE7D3FBC8);
            a = gg(a, b, c, d, x[k + 9], S21, 0x21E1CDE6);
            d = gg(d, a, b, c, x[k + 14], S22, 0xC33707D6);
            c = gg(c, d, a, b, x[k + 3], S23, 0xF4D50D87);
            b = gg(b, c, d, a, x[k + 8], S24, 0x455A14ED);
            a = gg(a, b, c, d, x[k + 13], S21, 0xA9E3E905);
            d = gg(d, a, b, c, x[k + 2], S22, 0xFCEFA3F8);
            c = gg(c, d, a, b, x[k + 7], S23, 0x676F02D9);
            b = gg(b, c, d, a, x[k + 12], S24, 0x8D2A4C8A);
            a = hh(a, b, c, d, x[k + 5], S31, 0xFFFA3942);
            d = hh(d, a, b, c, x[k + 8], S32, 0x8771F681);
            c = hh(c, d, a, b, x[k + 11], S33, 0x6D9D6122);
            b = hh(b, c, d, a, x[k + 14], S34, 0xFDE5380C);
            a = hh(a, b, c, d, x[k + 1], S31, 0xA4BEEA44);
            d = hh(d, a, b, c, x[k + 4], S32, 0x4BDECFA9);
            c = hh(c, d, a, b, x[k + 7], S33, 0xF6BB4B60);
            b = hh(b, c, d, a, x[k + 10], S34, 0xBEBFBC70);
            a = hh(a, b, c, d, x[k + 13], S31, 0x289B7EC6);
            d = hh(d, a, b, c, x[k + 0], S32, 0xEAA127FA);
            c = hh(c, d, a, b, x[k + 3], S33, 0xD4EF3085);
            b = hh(b, c, d, a, x[k + 6], S34, 0x4881D05);
            a = hh(a, b, c, d, x[k + 9], S31, 0xD9D4D039);
            d = hh(d, a, b, c, x[k + 12], S32, 0xE6DB99E5);
            c = hh(c, d, a, b, x[k + 15], S33, 0x1FA27CF8);
            b = hh(b, c, d, a, x[k + 2], S34, 0xC4AC5665);
            a = ii(a, b, c, d, x[k + 0], S41, 0xF4292244);
            d = ii(d, a, b, c, x[k + 7], S42, 0x432AFF97);
            c = ii(c, d, a, b, x[k + 14], S43, 0xAB9423A7);
            b = ii(b, c, d, a, x[k + 5], S44, 0xFC93A039);
            a = ii(a, b, c, d, x[k + 12], S41, 0x655B59C3);
            d = ii(d, a, b, c, x[k + 3], S42, 0x8F0CCC92);
            c = ii(c, d, a, b, x[k + 10], S43, 0xFFEFF47D);
            b = ii(b, c, d, a, x[k + 1], S44, 0x85845DD1);
            a = ii(a, b, c, d, x[k + 8], S41, 0x6FA87E4F);
            d = ii(d, a, b, c, x[k + 15], S42, 0xFE2CE6E0);
            c = ii(c, d, a, b, x[k + 6], S43, 0xA3014314);
            b = ii(b, c, d, a, x[k + 13], S44, 0x4E0811A1);
            a = ii(a, b, c, d, x[k + 4], S41, 0xF7537E82);
            d = ii(d, a, b, c, x[k + 11], S42, 0xBD3AF235);
            c = ii(c, d, a, b, x[k + 2], S43, 0x2AD7D2BB);
            b = ii(b, c, d, a, x[k + 9], S44, 0xEB86D391);
            a = addUnsigned(a, AA);
            b = addUnsigned(b, BB);
            c = addUnsigned(c, CC);
            d = addUnsigned(d, DD);
        }

        return wordToHex(a).concat(wordToHex(b), wordToHex(c), wordToHex(d));
    },
    

    Base64 = (function(){
        // Takes a Nx16x1 byte array and converts it to Base64
        var _chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/',
        chars = _chars.split(''),
        
        encode = function(b, withBreaks) {
            var flatArr = [],
            b64 = '',
            i,
            broken_b64;
            totalChunks = Math.floor(b.length * 16 / 3);
            for (i = 0; i < b.length * 16; i++) {
                flatArr.push(b[Math.floor(i / 16)][i % 16]);
            }
            for (i = 0; i < flatArr.length; i = i + 3) {
                b64 += chars[flatArr[i] >> 2];
                b64 += chars[((flatArr[i] & 3) << 4) | (flatArr[i + 1] >> 4)];
                if (! (flatArr[i + 1] === undefined)) {
                    b64 += chars[((flatArr[i + 1] & 15) << 2) | (flatArr[i + 2] >> 6)];
                } else {
                    b64 += '=';
                }
                if (! (flatArr[i + 2] === undefined)) {
                    b64 += chars[flatArr[i + 2] & 63];
                } else {
                    b64 += '=';
                }
            }
            // OpenSSL is super particular about line breaks
            broken_b64 = b64.slice(0, 64) + '\n';
            for (i = 1; i < (Math.ceil(b64.length / 64)); i++) {
                broken_b64 += b64.slice(i * 64, i * 64 + 64) + (Math.ceil(b64.length / 64) == i + 1 ? '': '\n');
            }
            return broken_b64;
        },
        
        decode = function(string) {
            string = string.replace(/\n/g, '');
            var flatArr = [],
            c = [],
            b = [],
            i;
            for (i = 0; i < string.length; i = i + 4) {
                c[0] = _chars.indexOf(string.charAt(i));
                c[1] = _chars.indexOf(string.charAt(i + 1));
                c[2] = _chars.indexOf(string.charAt(i + 2));
                c[3] = _chars.indexOf(string.charAt(i + 3));

                b[0] = (c[0] << 2) | (c[1] >> 4);
                b[1] = ((c[1] & 15) << 4) | (c[2] >> 2);
                b[2] = ((c[2] & 3) << 6) | c[3];
                flatArr.push(b[0], b[1], b[2]);
            }
            flatArr = flatArr.slice(0, flatArr.length - (flatArr.length % 16));
            return flatArr;
        };
        
        //internet explorer
        if(typeof Array.indexOf === "function") {
            _chars = chars;
        }
        
        /*
        //other way to solve internet explorer problem
        if(!Array.indexOf){
            Array.prototype.indexOf = function(obj){
                for(var i=0; i<this.length; i++){
                    if(this[i]===obj){
                        return i;
                    }
                }
                return -1;
            }
        }
        */
        
        
        return {
            "encode": encode,
            "decode": decode
        };
    })();

    return {
        "size": size,
        "h2a":h2a,
        "expandKey":expandKey,
        "encryptBlock":encryptBlock,
        "decryptBlock":decryptBlock,
        "Decrypt":Decrypt,
        "s2a":s2a,
        "rawEncrypt":rawEncrypt,
        "dec":dec,
        "openSSLKey":openSSLKey,
        "a2h":a2h,
        "enc":enc,
        "Hash":{"MD5":MD5},
        "Base64":Base64
    };

})();

if ( typeof define === "function" ) {
    define(function () { return GibberishAES; });
}
/*
 * RIFFWAVE.js v0.03 - Audio encoder for HTML5 <audio> elements.
 * Copyleft 2011 by Pedro Ladaria <pedro.ladaria at Gmail dot com>
 *
 * Public Domain
 *
 * Changelog:
 *
 * 0.01 - First release
 * 0.02 - New faster base64 encoding
 * 0.03 - Support for 16bit samples
 *
 * Notes:
 *
 * 8 bit data is unsigned: 0..255
 * 16 bit data is signed: âˆ’32,768..32,767
 *
 */

var FastBase64 =
{

   chars : "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=",
   encLookup : [],

   Init : function()
   {
      for (var i = 0; i < 4096; i++)
      {
         this.encLookup[i] = this.chars[i >> 6] + this.chars[i & 0x3F];
      }
   },

   Encode : function(src)
   {
      var len = src.length;
      var dst = '';
      var i = 0;
      while (len > 2)
      {
         n = (src[i] << 16) | (src[i + 1] << 8) | src[i + 2];
         dst += this.encLookup[n >> 12] + this.encLookup[n & 0xFFF];
         len -= 3;
         i += 3;
      }
      if (len > 0)
      {
         var n1 = (src[i] & 0xFC) >> 2;
         var n2 = (src[i] & 0x03) << 4;
         if (len > 1)
            n2 |= (src[++i] & 0xF0) >> 4;
         dst += this.chars[n1];
         dst += this.chars[n2];
         if (len == 2)
         {
            var n3 = (src[i++] & 0x0F) << 2;
            n3 |= (src[i] & 0xC0) >> 6;
            dst += this.chars[n3];
         }
         if (len == 1)
            dst += '=';
         dst += '=';
      }
      return dst;
   } // end Encode
}

FastBase64.Init();

var RIFFWAVE = function(config)
{
   config = config ||
   {
   };

   this.data = [];
   // Array containing audio samples
   this.wav = [];
   // Array containing the generated wave file
   this.dataURI = '';
   // http://en.wikipedia.org/wiki/Data_URI_scheme

   this.header = Ext.apply(
   {
      // OFFS SIZE NOTES
      chunkId : [0x52, 0x49, 0x46, 0x46], // 0    4    "RIFF" = 0x52494646
      chunkSize : 0, // 4    4    36+SubChunk2Size = 4+(8+SubChunk1Size)+(8+SubChunk2Size)
      format : [0x57, 0x41, 0x56, 0x45], // 8    4    "WAVE" = 0x57415645
      subChunk1Id : [0x66, 0x6d, 0x74, 0x20], // 12   4    "fmt " = 0x666d7420
      subChunk1Size : 16, // 16   4    16 for PCM
      audioFormat : 1, // 20   2    PCM = 1
      numChannels : 1, // 22   2    Mono = 1, Stereo = 2...
      sampleRate : 8000, // 24   4    8000, 44100...
      byteRate : 0, // 28   4    SampleRate*NumChannels*BitsPerSample/8
      blockAlign : 0, // 32   2    NumChannels*BitsPerSample/8
      bitsPerSample : 8, // 34   2    8 bits = 8, 16 bits = 16
      subChunk2Id : [0x64, 0x61, 0x74, 0x61], // 36   4    "data" = 0x64617461
      subChunk2Size : 0 // 40   4    data size = NumSamples*NumChannels*BitsPerSample/8
   }, config['header']);

   function u32ToArray(i)
   {
      return [i & 0xFF, (i >> 8) & 0xFF, (i >> 16) & 0xFF, (i >> 24) & 0xFF];
   }

   function u16ToArray(i)
   {
      return [i & 0xFF, (i >> 8) & 0xFF];
   }

   function split16bitArray(data)
   {
      var r = [];
      var j = 0;
      var len = data.length;
      for (var i = 0; i < len; i++)
      {
         r[j++] = data[i] & 0xFF;
         r[j++] = (data[i] >> 8) & 0xFF;
      }
      return r;
   }


   this.Make = function(data)
   {
      if ((config['data'] instanceof Array) || (( typeof (Int16Array) != 'undefined') && (config['data'] instanceof Int16Array)))
      {
         this.data = data;
         this.header.blockAlign = (this.header.numChannels * this.header.bitsPerSample) >> 3;
         this.header.byteRate = this.header.blockAlign * this.header.sampleRate;
         this.header.subChunk2Size = this.data.length * (this.header.bitsPerSample >> 3);
         this.header.chunkSize = 36 + this.header.subChunk2Size;
      }
      console.debug("RIFFWAVE - " + Ext.encode(this.header));
   };
   this.MakeData = function(data)
   {
      this.wav = this.header.chunkId.concat(u32ToArray(this.header.chunkSize), this.header.format, this.header.subChunk1Id, u32ToArray(this.header.subChunk1Size), u16ToArray(this.header.audioFormat), u16ToArray(this.header.numChannels), u32ToArray(this.header.sampleRate), u32ToArray(this.header.byteRate), u16ToArray(this.header.blockAlign), u16ToArray(this.header.bitsPerSample), this.header.subChunk2Id, u32ToArray(this.header.subChunk2Size), (this.header.bitsPerSample == 16) ? split16bitArray(this.data) : this.data);
      this.dataURI = 'data:audio/wav;base64,' + FastBase64.Encode(this.wav);
   };

   if ((config['data'] instanceof Array) || (( typeof (Int16Array) != 'undefined') && (config['data'] instanceof Int16Array)))
   {
      this.Make(config['data']);
      if (!config['headerOnly'])
      {
         this.MakeData(config['data']);
      }
   }
};
// end RIFFWAVE
//
//  PushNotification.js
//
// Based on the Push Notifications Cordova Plugin by Olivier Louvignes on 06/05/12.
// Modified by Max Konev on 18/05/12.
//
// Pushwoosh Push Notifications Plugin for Cordova iOS
// www.pushwoosh.com
//
// MIT Licensed
if (window.cordova || window.Cordova || window.PhoneGap)
{
   (function(cordova)
   {

      function PushNotification()
      {
      }

      // Call this to register for push notifications and retreive a deviceToken
      PushNotification.prototype.registerDevice = function(config, success, fail)
      {
         cordova.exec(success, fail, "PushNotification", "registerDevice", config ? [config] : []);
      };

      // Call this to set tags for the device
      PushNotification.prototype.setTags = function(config, success, fail)
      {
         cordova.exec(success, fail, "PushNotification", "setTags", config ? [config] : []);
      };

      // Call this to send geo location for the device
      PushNotification.prototype.sendLocation = function(config, success, fail)
      {
         cordova.exec(success, fail, "PushNotification", "sendLocation", config ? [config] : []);
      };

      PushNotification.prototype.onDeviceReady = function()
      {
         cordova.exec(null, null, "PushNotification", "onDeviceReady", []);
      };

      //Android Only----
      PushNotification.prototype.unregisterDevice = function(success, fail)
      {
         cordova.exec(success, fail, "PushNotification", "unregisterDevice", []);
      };

      //config params: {msg:"message", seconds:30, userData:"optional"}
      PushNotification.prototype.createLocalNotification = function(config, success, fail)
      {
         cordova.exec(success, fail, "PushNotification", "createLocalNotification", config ? [config] : []);
      };

      PushNotification.prototype.clearLocalNotification = function()
      {
         cordova.exec(null, null, "PushNotification", "clearLocalNotification", []);
      };

      //advanced background task to track device position and not drain the battery
      PushNotification.prototype.startGeoPushes = function(success, fail)
      {
         cordova.exec(success, fail, "PushNotification", "startGeoPushes", []);
      };

      PushNotification.prototype.stopGeoPushes = function(success, fail)
      {
         cordova.exec(success, fail, "PushNotification", "stopGeoPushes", []);
      };

      //sets multi notification mode on
      PushNotification.prototype.setMultiNotificationMode = function(success, fail)
      {
         cordova.exec(success, fail, "PushNotification", "setMultiNotificationMode", []);
      };

      //sets single notification mode
      PushNotification.prototype.setSingleNotificationMode = function(success, fail)
      {
         cordova.exec(success, fail, "PushNotification", "setSingleNotificationMode", []);
      };

      //type: 0 default, 1 no sound, 2 always
      PushNotification.prototype.setSoundType = function(type, success, fail)
      {
         cordova.exec(success, fail, "PushNotification", "setSoundType", [type]);
      };

      //type: 0 default, 1 no vibration, 2 always
      PushNotification.prototype.setVibrateType = function(type, success, fail)
      {
         cordova.exec(success, fail, "PushNotification", "setVibrateType", [type]);
      };

      PushNotification.prototype.setLightScreenOnNotification = function(on, success, fail)
      {
         cordova.exec(success, fail, "PushNotification", "setLightScreenOnNotification", [on]);
      };

      //set to enable led blinking when notification arrives and display is off
      PushNotification.prototype.setEnableLED = function(on, success, fail)
      {
         cordova.exec(success, fail, "PushNotification", "setEnableLED", [on]);
      };

      //{goal:'name', count:3} (count is optional)
      PushNotification.prototype.sendGoalAchieved = function(config, success, fail)
      {
         cordova.exec(success, fail, "PushNotification", "sendGoalAchieved", config ? [config] : []);
      };

      //Android End----

      //iOS only----
      PushNotification.prototype.startLocationTracking = function(backgroundMode, success, fail)
      {
         cordova.exec(success, fail, "PushNotification", "startLocationTracking", backgroundMode ? [
         {
            mode : backgroundMode
         }] : []);
      };

      PushNotification.prototype.stopLocationTracking = function(success, fail)
      {
         cordova.exec(success, fail, "PushNotification", "stopLocationTracking", []);
      };

      // Call this to get a detailed status of remoteNotifications
      PushNotification.prototype.getRemoteNotificationStatus = function(callback)
      {
         cordova.exec(callback, callback, "PushNotification", "getRemoteNotificationStatus", []);
      };

      // Call this to set the application icon badge
      PushNotification.prototype.setApplicationIconBadgeNumber = function(badgeNumber, callback)
      {
         cordova.exec(callback, callback, "PushNotification", "setApplicationIconBadgeNumber", [
         {
            badge : badgeNumber
         }]);
      };

      // Call this to clear all notifications from the notification center
      PushNotification.prototype.cancelAllLocalNotifications = function(callback)
      {
         cordova.exec(callback, callback, "PushNotification", "cancelAllLocalNotifications", []);
      };
      //iOS End----

      // Event spawned when a notification is received while the application is active
      PushNotification.prototype.notificationCallback = function(notification)
      {
         var ev = document.createEvent('HTMLEvents');
         ev.notification = notification;
         ev.initEvent('push-notification', true, true, arguments);
         document.dispatchEvent(ev);
      };

      cordova.addConstructor(function()
      {
         if (!window.plugins)
            window.plugins =
            {
            };
         window.plugins.pushNotification = new PushNotification();
      });

   })(window.cordova || window.Cordova || window.PhoneGap);
}
window.plugins = window.plugins ||
{
};

(function(cordova)
{
   var preLoadSendCommon =
   {
      _mobile : function(cntlr, checkUseProximity, proximityWin, win, fail)
      {
         var me = gblController, _viewport = cntlr.getViewPortCntlr(), callback = Ext.bind(function(useProximity, _cntlr, _win)
         {
            _win = _win || Ext.emptyFn;

            setLoadMask(false);
            Ext.defer(function()
            {
               if (useProximity === true)
               {
                  var proceed, cancel;
                  me.pendingBroadcast = true;
                  $('#earnPtsProceed').one('tap', proceed = function(e)
                  {
                     me.pendingBroadcast = false;
                     $('#earnPtsProceed').off('tap', proceed).off('click', proceed);
                     $('#earnPtsCancel').off('tap', cancel);
                     _win(useProximity);
                     return false;
                  }).one('click', proceed);
                  $('#earnPtsCancel').one('tap', cancel = function(e)
                  {
                     me.pendingBroadcast = false;
                     $('#earnPtsCancel').off('tap', cancel).off('click', cancel);
                     $('#earnPtsProceed').off('tap', proceed);
                     return false;
                  }).one('click', cancel);
                  $('#earnptspageview').trigger('kickbak:preLoad');
               }
               else
               {
                  $('#earnptspageview').trigger('kickbak:loyalty');
               }
            }, 0.25 * 1000, _cntlr);
         }, null, [cntlr, win], true);

         fail = fail || Ext.emptyFn;

         setLoadMask(true);
         //
         // Talk to server to see if we use Proximity Sensor or not
         //
         Ext.defer(function()
         {
            if (checkUseProximity)
            {
               $(document).one('locationupdate', function(position)
               {
                  proximityWin();
               });
               _viewport.getGeoLocation();
            }
            //
            // We must use Loyalty Card or Phone Number
            //
            else
            {
               try
               {
                  var merchant = _viewport.getVenue().getMerchant(), features_config = merchant.get('features_config');
                  //
                  // Check if the venue supports Proximity Sensor or not
                  //
                  if (features_config['enable_mobile'])
                  {
                     proximityWin();
                  }
                  else
                  {
                     callback(false);
                  }
               }
               catch(e)
               {
                  fail();
               }
            }
         }, 0.25 * 1000);

         return callback;
      },
      _native : function(cntlr, checkUseProximity, proximityWin, win, fail)
      {
         var _viewport = cntlr.getViewPortCntlr(), callback = Ext.bind(function(useProximity, _cntlr, _win)
         {
            var viewport = _cntlr.getViewPortCntlr(), _cleanup = function()
            {
               viewport.popUpInProgress = false;
               _cntlr._actions.hide();
               _cntlr._actions.destroy();
               delete _cntlr._actions;
            };

            _win = _win || Ext.emptyFn;

            Ext.Viewport.setMasked(null);
            Ext.defer(function()
            {
               if (!_cntlr._actions)
               {
                  _cntlr._actions = Ext.create('Genesis.view.widgets.PopupItemDetail', (useProximity === true) ?
                  {
                     iconType : 'prizewon',
                     icon : 'phoneInHand',
                     title : cntlr.showToServerMsg(),
                     buttons : [
                     {
                        text : 'Cancel',
                        ui : 'cancel',
                        handler : _cleanup
                     },
                     {
                        text : 'Proceed',
                        ui : 'action',
                        handler : function()
                        {
                           _cleanup();
                           _win(useProximity);
                        }
                     }]
                  } :
                  {
                     iconType : 'prizewon',
                     icon : 'loyaltycard',
                     title : cntlr.showToLoyaltyCardMsg(),
                     buttons : [
                     {
                        text : 'Dismiss',
                        ui : 'cancel',
                        handler : _cleanup
                     }]
                  });
                  Ext.Viewport.add(_cntlr._actions);
               }
               viewport.popUpInProgress = true;
               _cntlr._actions.show();
            }, 0.25 * 1000);
         }, null, [cntlr, win], true);

         fail = fail || Ext.emptyFn;

         Ext.Viewport.setMasked(
         {
            xtype : 'loadmask',
            message : cntlr.prepareToSendMerchantDeviceMsg
         });

         //
         // Talk to server to see if we use Proximity Sensor or not
         //
         Ext.defer(function()
         {
            if (checkUseProximity)
            {
               _viewport.on('locationupdate', function(position)
               {
                  proximityWin();
               }, null,
               {
                  single : true
               });
               _viewport.getGeoLocation();
            }
            //
            // We must use Loyalty Card or Phone Number
            //
            else
            {
               try
               {
                  var merchant = _viewport.getVenue().getMerchant(), features_config = merchant.get('features_config');
                  //
                  // Check if the venue supports Proximity Sensor or not
                  //
                  if (features_config['enable_mobile'])
                  {
                     proximityWin();
                  }
                  else
                  {
                     callback(false);
                  }
               }
               catch(e)
               {
                  fail();
               }
            }
         }, 0.25 * 1000);

         return callback;
      }
   };

   if (Genesis.fn.isNative())
   {
      window.plugins.proximityID =
      {
         init : function(s_vol_ratio, r_vol_ratio)
         {
            cordova.exec(function()
            {
               console.log("ProximityIDPlugin Initialized");
            }, function(reason)
            {
               console.log("Failed to initialize the ProximityIDPlugin! Reason[" + reason + "]");
            }, "ProximityIDPlugin", "init", [s_vol_ratio + "", r_vol_ratio + ""]);

            window.AudioContext = window.AudioContext || window.webkitAudioContext;
         },
         preLoadSend : function(cntlr, checkUseProximity, win, fail)
         {
            var callback = preLoadSendCommon[(cntlr !== gblController)  ? '_native' : '_mobile'](cntlr, checkUseProximity, function()
            {
               //
               // To give loading mask a chance to render
               //
               Ext.defer(function()
               {
                  cordova.exec(function()
                  {
                     callback(true);
                  }, fail, "ProximityIDPlugin", "preLoadIdentity", []);
               }, 0.25 * 1000, this);
            }, win, fail);
         },
         send : function(win, fail)
         {
            cordova.exec(win, fail, "ProximityIDPlugin", "sendIdentity", []);
         },
         scan : function(win, fail, samples, missedThreshold, magThreshold, overlapRatio)
         {
            cordova.exec(win, fail, "ProximityIDPlugin", "scanIdentity", [samples, missedThreshold, magThreshold, overlapRatio]);
         },
         stop : function()
         {
            cordova.exec(function()
            {
               console.log("Stopped ProximityIDPlugin");
            }, function(reason)
            {
               console.log("Failed to stop the ProximityIDPlugin " + reason);
            }, "ProximityIDPlugin", "stop", []);
         },
         setVolume : function(vol)
         {
            cordova.exec(Ext.emptyFn, Ext.emptyFn, "ProximityIDPlugin", "setVolume", [vol]);
         }
      };

      cordova.addConstructor(function()
      {
      });
   }
   else
   {
      _filesAssetCount++;

      window.plugins.proximityID =
      {
         loFreq : 17000.0,
         hiFreq : 20000.0,
         FREQ_GAP : 500.0,
         NUM_SIGNALS : 3,
         SHORT_MAX : parseInt(0xFFFF / 2),
         sampleRate : 44100,
         duration : 1 * 44100,
         bufSize : 16 * 1024,
         bitRate : 128,
         MATCH_THRESHOLD : 2,
         bw : 0,
         sampleConfig : null,
         freqs : null,
         context : null,
         gainNode : null,
         oscillators : null,
         audio : null,
         bytesEncoded : null,
         unsupportedBrowserMsg : 'This browser does not support our Proximity Scanning feature',
         convertToMono : function(input)
         {
            var me = this;
            var splitter = me.context.createChannelSplitter(2);
            var merger = me.context.createChannelMerger(2);

            input.connect(splitter);
            splitter.connect(merger, 0, 0);
            splitter.connect(merger, 0, 1);
            return merger;
         },
         init : function(s_vol_ratio, r_vol_ratio)
         {
            var me = this;

            me.bw = (me.hiFreq - me.loFreq) / me.NUM_SIGNALS;

            Genesis.constants.s_vol = s_vol_ratio * 100;
            // Reduce volume by 50%
            Genesis.constants.r_vol = r_vol_ratio * 100;

            window.AudioContext = window.AudioContext || window.webkitAudioContext;
            console.debug("Initialized Proximity API");
         },
         b64toF32 : function(input)
         {
            var binary = atob(input);
            var len = binary.length;
            var buffer = new ArrayBuffer(len);
            var view = new Float32Array(buffer);
            /*
             while (--len)
             {
             view[len] = binary.charCodeAt(len);
             }
             */

            return view;
         },
         generateData : function(offset, length)
         {
            var me = this, i, c, s_vol = Genesis.constants.s_vol / 100, data = new Float32Array(length), _s_vol = s_vol;

            c = [];
            for ( i = 0; i < me.freqs.length; i++)
            {
               c[i] = 2 * Math.PI * me.freqs[i] / me.sampleRate;
            }
            for ( i = 0; i < length; i++)
            {
               //
               // Create Cross Fade
               //
               /*
               if ((i + offset) < (me.duration / 15))
               {
               _s_vol = s_vol * (i + offset + 1) / (me.duration / 15);
               }
               else if ((i + offset) > (me.duration * 8.5 / 10))
               {
               _s_vol = s_vol * 10 * (1 - ((i + offset + 1) / me.duration));
               }
               */
               // convert to 16 bit pcm sound array
               // assumes the sample buffer is normalised.
               for ( j = 0; j < (me.freqs.length); j++)
               {
                  data[i] += Math.sin(c[j] * (i + offset));
               }
               data[i] = _s_vol * data[i] / (me.freqs.length);
            }

            return data;
         },
         webAudioFnHandler : function(s_vol, callback)
         {
            var me = this, context = me.context, gain = me.gainNode;

            // Create the audio context
            if (!context)
            {
               context = me.context = new window.AudioContext();
               context.createGain = context.createGain || context.createGainNode;
               gain = me.gainNode = context.createGain();
               gain.connect(context.destination);
            }

            me.getFreqs();
            // Reduce the volume.
            gain.gain.value = s_vol;

            me.oscillators = [];
            for ( i = 0; i < me.freqs.length; i++)
            {
               var osc = me.oscillators[i] = context.createOscillator();
               osc.type = 0;
               osc.frequency.value = me.freqs[i];
               osc.connect(gain);
            }

            console.debug("OSC Gain : " + s_vol);

            callback(true);
         },
         audioFnHandler : function(config, s_vol, win)
         {
            var me = this, data = config['data'] = [], _s_vol = s_vol;
            me.getFreqs();

            for (var i = 0; i < (me.duration); i++)
            {
               var val = 0.0;
               //
               // Create Cross Fade
               //
               /*
               if (i < (me.duration / 15))
               {
               _s_vol = s_vol * (i + 1) / (me.duration / 15);
               }
               else if (i > (me.duration * 8.5 / 10))
               {
               _s_vol = s_vol * 10 * (1 - ((i + 1) / me.duration));
               }
               */
               // convert to 16 bit pcm sound array
               // assumes the sample buffer is normalised.
               for (var j = 0; j < me.freqs.length; j++)
               {
                  val += Math.sin(2 * Math.PI * me.freqs[j] * i / me.sampleRate);
               }
               val /= me.freqs.length;

               val = Math.round(_s_vol * ((me.SHORT_MAX + 1) + (val * me.SHORT_MAX)));
               data[i] = val;
            }

            //
            // Browser support WAV files
            //
            me.audio = new Audio(new RIFFWAVE(config).dataURI);
            me.audio.volume = 1.0;

            console.debug("WAV Gain : " + s_vol);

            win(true);
         },
         mp3WorkerFnHandler : function(e)
         {
            var me = this;

            switch (e.data.cmd)
            {
               case 'init' :
               {
                  me._duration = me.duration;
                  me.bytesEncoded = Math.min(me._duration, me.bufSize);
                  delete me.sampleConfig['data'];
                  //console.debug("MP3 Init");

                  _codec.postMessage(
                  {
                     cmd : 'encode',
                     buf : me.generateData(0, me.bytesEncoded)
                  });
                  break;
               }
               case 'data' :
               {
                  if (!me.sampleConfig['data'])
                  {
                     me.sampleConfig['data'] = String.fromCharCode.apply(null, e.data.buf);
                  }
                  else
                  {
                     me.sampleConfig['data'] += String.fromCharCode.apply(null, e.data.buf);
                  }
                  //console.debug("MP3 Encoded " + me.bytesEncoded + "bytes, returned " + e.data.buf.length + "bytes");

                  me._duration -= me.bytesEncoded;
                  if (me._duration > 0)
                  {
                     me.bytesEncoded = Math.min(me._duration, me.bufSize);
                     _codec.postMessage(
                     {
                        cmd : 'encode',
                        buf : me.generateData(me.duration - me._duration, me.bytesEncoded)
                     });
                  }
                  else
                  {
                     _codec.postMessage(
                     {
                        cmd : 'finish'
                     });
                  }
                  break;
               }
               case 'end' :
               {
                  me.sampleConfig['data'] += String.fromCharCode.apply(null, e.data.buf);
                  me.sampleConfig['data'] = 'data:audio/mpeg;base64,' + base64.encode(me.sampleConfig['data']);
                  //console.debug("Final MP3 File Length = " + me.sampleConfig['data'].length);
                  me.audio = new Audio(me.sampleConfig['data']);
                  me.audio.volume = 1.0;

                  console.debug("MP3 Gain : " + Genesis.constants.s_vol / 100);
                  me.sampleConfig['callback']();
                  delete me.sampleConfig;
               }
            }
         },
         mp3FnHandler : function(config, s_vol, useProximity, win)
         {
            var me = this;

            if (!_codec.onmessage || (_codec.onmessage == Ext.emptyFn))
            {
               _codec.onmessage = Ext.bind(me.mp3WorkerFnHandler, me);
            }

            me.getFreqs();

            config['callback'] = function()
            {
               win(true);
            };

            me.sampleConfig = config;

            _codec.postMessage(
            {
               cmd : 'init',
               config :
               {
                  samplerate : me.sampleRate,
                  bitrate : me.bitRate,
                  mode : 3, // MONO
                  channels : 1
               }
            });
         },
         getFreqs : function()
         {
            var me = this, stay, i;

            do
            {
               stay = false;
               for ( i = 0; i < me.NUM_SIGNALS - 1; i++)
               {
                  me.freqs[i] = //
                  parseInt(Math.random() * me.bw) + //
                  parseInt(i * me.bw) + //
                  parseInt(me.loFreq);
               }
               i = me.NUM_SIGNALS - 1;
               me.freqs[i] = //
               parseInt(Math.random() / 2 * me.bw) + //
               parseInt(i * me.bw) + //
               parseInt(me.loFreq);

               for ( i = 0; i < (me.NUM_SIGNALS - 1); i++)
               {
                  if ((me.freqs[i] + me.FREQ_GAP) > me.freqs[i + 1])
                  {
                     stay = true;
                     break;
                  }
               }
            } while (stay);
         },
         preLoadSend : function(cntlr, checkUseProximity, win, fail)
         {
            var me = this, s_vol = Genesis.constants.s_vol / 100, config =
            {
               header :
               {
                  sampleRate : me.sampleRate,
                  numChannels : 1,
                  bitsPerSample : 16
               },
               data : []
            };

            me.freqs = [];

            var callback = preLoadSendCommon['_mobile'](cntlr, checkUseProximity, function()
            {
               //
               // Use Web Audio
               //
               if ( typeof (window.AudioContext) != 'undefined')
               {
                  me.webAudioFnHandler(s_vol, callback);
               }
               else
               {
                  //
                  // Browser support WAV files
                  //
                  me.duration = 1 * 44100;
                  if (!_codec)
                  {
                     Ext.defer(me.audioFnHandler, 0.25 * 1000, me, [config, s_vol, callback]);
                  }
                  //
                  // Convert to MP3 first
                  //
                  else
                  {
                     Ext.defer(me.mp3FnHandler, 0.25 * 1000, me, [config, s_vol, callback]);
                  }
               }
            }, win, fail);
         },
         send : function(win, fail)
         {
            var me = this;

            if (me.oscillators)
            {
               for (var i = 0; i < me.freqs.length; i++)
               {
                  me.oscillators[i].noteOn && me.oscillators[i].noteOn(0);
               }
               win(
               {
                  freqs : me.freqs
               });
            }
            else if (me.audio)
            {
               me.audio.play();
               me.audioTimer = setInterval(function()
               {
                  if (me.audio.currentTime >= 0.95)
                  {
                     //console.log("Locating LocalID ...");
                     me.audio.currentTime = 0;
                  }
               }, 50);
               win(
               {
                  freqs : me.freqs
               });
            }
            else
            {
               fail();
            }
         },
         onFreqCalculated : function(freqs, error)
         {
            var me = this;

            if (freqs && me._onFreqSuccess)
            {
               me._onFreqSuccess(
               {
                  freqs : freqs
               });
            }
            else if (me._onFreqFail)
            {
               me._onFreqFail(error);
            }
            delete me._onFreqSuccess;
            delete me._onFreqFail;
         },
         scan : function(win, fail, samples, missedThreshold, magThreshold, overlapRatio)
         {
            var me = this, context = me.context;

            if (Genesis.fn.isNative())
            //if (true)
            {
               me.matchCount = 0;
               if (!me.fftWorker)
               {
                  var worker = me.fftWorker = new Worker('worker/fft.min.js');
                  worker.onmessage = function(e)
                  {
                     var i, result = eval('[' + e.data + ']')[0];
                     switch (result['cmd'])
                     {
                        case 'init':
                        {
                           console.debug("Local Identity Detector Initialized");
                           break;
                        }
                        case 'forward':
                        {
                           console.debug("Matching Freqs = [" + result['freqs'] + "]");

                           if (me.freqs)
                           {
                              for ( i = 0; i < result['freqs'].length; i++)
                              {
                                 if (me.freqs[i] != result['freqs'][i])
                                 {
                                    me.matchCount = -1;
                                    delete me.freqs;
                                    break;
                                 }
                              }

                              me.matchCount++;
                           }
                           else
                           {
                              me.freqs = result['freqs'];
                           }

                           if (me.matchCount >= me.MATCH_THRESHOLD)
                           {
                              me.matchCount = 0;
                              win(
                              {
                                 freqs : me.freqs
                              });
                           }
                           break;
                        }
                     }
                  };
                  worker.postMessage(
                  {
                     cmd : 'init',
                     config :
                     {
                        sampleRate : me.sampleRate,
                        fftSize : me.bufSize
                     }
                  });
               }

               if (!me.context)
               {
                  context = me.context = new window.AudioContext();
                  context.createScriptProcessor = context.createScriptProcessor || context.createJavaScriptNode;
               }

               if (!me.javascriptNode)
               {
                  // setup a javascript node
                  me.javascriptNode = context.createScriptProcessor(me.bufSize, 1, 1);
                  me.javascriptNode.onaudioprocess = function(e)
                  {
                     me.fftWorker.postMessage(
                     {
                        cmd : 'forward',
                        buf : e.inputBuffer.getChannelData(0)
                     });
                  };
               }

               if (navigator.webkitGetUserMedia)
               {
                  navigator.webkitGetUserMedia(
                  {
                     audio : true
                  }, function(stream)
                  {
                     if (me.microphone)
                     {
                        me.microphone.disconnect();
                     }
                     delete me.freqs;
                     me.javascriptNode.connect(me.context.destination);
                     me.microphone = me.convertToMono(context.createMediaStreamSource(stream));
                     me.microphone.connect(me.javascriptNode);
                     console.debug("Local Identity detecting host ...");
                  });
               }
               else
               {
                  Ext.device.Notification.show(
                  {
                     title : 'Local Identity',
                     message : me.unsupportedBrowserMsg,
                     buttons : ['OK'],
                     callback : Ext.emptyFn
                  });
               }
            }
            //
            // Call Native code to get Data Stream
            //
            else if (merchantMode)
            {
               delete me.freqs;
               if (window.pos)
               {
                  window.pos.wssocket.send('proximityID_start' + Genesis.db.getLocalDB()['sensitivity']);
                  me._onFreqSuccess = win;
                  me._onFreqFail = fail;
               }
               else
               {
                  //
                  // Nothing to do, wait until POS connection is established before trying
                  //
               }
            }
         },
         stop : function()
         {
            var me = this;

            clearInterval(me.audioTimer);
            delete me.audioTimer;

            if (me.oscillators)
            {
               for (var i = 0; i < me.freqs.length; i++)
               {
                  me.oscillators[i].disconnect();
               }
               delete me.oscillators;
            }
            else if (me.audio)
            {
               me.audio.pause();
               me.audio.currentTime = 0;
               delete me.audio;
            }

            if (me.microphone)
            {
               me.javascriptNode.disconnect();
               me.microphone.disconnect();
               delete me.microphone;
            }

            if (!Genesis.fn.isNative() && merchantMode)
            {
               if (window.pos)
               {
                  me.incomingDataExpected = false;
                  window.pos.wssocket.send('proximityID_stop');
               }
            }
         },
         setVolume : function(vol)
         {
            var me = this;
            if (me.context)
            {
               if (me.gainNode)
               {
                  // Set the volume.
                  me.gainNode.gain.value = Math.max(0, vol / 100);
               }
            }
            else if (me.audio)
            {
               me.audio.volume = vol / 100;
            }

         }
      };
   }
})(window.cordova || window.Cordova || window.PhoneGap);
var LowLatencyAudio =
{

   preloadFX : function(id, assetPath, success, fail)
   {
      return cordova.exec(success, fail, "LowLatencyAudio", "preloadFX", [id, assetPath]);
   },

   preloadAudio : function(id, assetPath, voices, success, fail)
   {
      return cordova.exec(success, fail, "LowLatencyAudio", "preloadAudio", [id, assetPath, voices]);
   },

   play : function(id, success, fail)
   {
      return cordova.exec(success, fail, "LowLatencyAudio", "play", [id]);
   },

   stop : function(id, success, fail)
   {
      return cordova.exec(success, fail, "LowLatencyAudio", "stop", [id]);
   },

   loop : function(id, success, fail)
   {
      return cordova.exec(success, fail, "LowLatencyAudio", "loop", [id]);
   },

   unload : function(id, success, fail)
   {
      return cordova.exec(success, fail, "LowLatencyAudio", "unload", [id]);
   }
}; // =============================================================
// EarnPtsPage
// =============================================================
(function()
{
   var imagePath = function(image)
   {
      return '../resources/themes/images/v1/ios/' + image + '.svg';
   };

   $(document).ready(function()
   {
      var message = $('#earnptspageview .x-docked-top .x-innerhtml'), image = $('#earnPtsImage');

      $.Event('kickbak:loyalty');
      $.Event('kickbak:preLoad');
      $.Event('kickbak:broadcast');

      $('#earnptspageview').on('kickbak:loyalty', function(e)
      {
         //
         // Show Loyalty Card instead
         //
         image[0].style.opacity = 0;
         $('#earnPtsImage img')[0].src = imagePath('prizewon/loyaltycard');

         $('#earnPtsChoiceButtons').addClass('x-item-hidden');
         $('#earnPtsDismissButtons').addClass('x-item-hidden');

         message.html(gblController.showToServerMsg());

         image.animate(
         {
            opacity : 1
         },
         {
            duration : 1 * 1000,
            easing : 'linear',
            complete : function()
            {
            }
         });
      }).on('kickbak:preLoad', function(e)
      {
         //var transition = (mobile.style.display == '');
         var transition = false;

         $('#earnPtsChoiceButtons').removeClass('x-item-hidden');
         $('#earnPtsDismissButtons').addClass('x-item-hidden');

         $('#earnPtsImage img')[0].src = imagePath('prizewon/phoneInHand');
         image[0].style.opacity = (transition) ? 0 : 1;
         image[0].style.display = '';

         message.html(gblController.prepareToSendMerchantDeviceMsg);

         if (transition)
         {
            image.animate(
            {
               opacity : 1
            },
            {
               duration : 0.75 * 1000,
               easing : 'linear',
               complete : function()
               {
               }
            });
         }
         else
         {
            $("#earnptspageview").animate(
            {
               top : 0 + 'px'
            },
            {
               duration : 0.75 * 1000,
               easing : 'ease-out',
               complete : function()
               {
               }
            });
         }
      }).on('kickbak:broadcast', function(e)
      {
         image[0].style.opacity = 0;
         $('#earnPtsImage img')[0].src = imagePath('prizewon/transmit');

         $('#earnPtsChoiceButtons').addClass('x-item-hidden');
         $('#earnPtsDismissButtons').removeClass('x-item-hidden');

         message.html(gblController.lookingForMerchantDeviceMsg());

         image.animate(
         {
            opacity : 1
         },
         {
            duration : 0.75 * 1000,
            easing : 'linear',
            complete : function()
            {
            }
         });
      });
   });
})();
var mainAppInit = false, href = location.href;

var proximityInit = function()
{
   //
   // Sender/Receiver Volume Settings
   // ===============================
   // - For Mobile Phones
   //
   // Client Device always transmits
   //
   var s_vol_ratio, r_vol_ratio, c = Genesis.constants, desktop = !($.os && ($.os.phone || $.os.tablet));

   if (desktop || $.os.ios)
   //if (Ext.os.is('iOS') || Ext.os.is('Desktop'))
   {
      //(tx)
      s_vol_ratio = 100;
      //Default Volume laying flat on a surface (tx)
      c.s_vol = 50;

      r_vol_ratio = 0.5;
      //(rx)
      c.conseqMissThreshold = 1;
      c.magThreshold = 20000;
      // More samples for better accuracy
      c.numSamples = 4 * 1024;
      //Default Overlap of FFT signal analysis over previous samples
      c.sigOverlapRatio = 0.25;
   }
   else if ($.os.android || $.os.webos || $.os.blackberry || $.os.bb10 || $.os.rimtabletos)
   //else if (Ext.os.is('Android') || Ext.os.is('BlackBerry'))
   {
      //(tx)
      s_vol_ratio = 0.25;
      //Default Volume laying flat on a surface (tx)
      c.s_vol = 25;

      //(rx)
      r_vol_ratio = 0.4;
      c.conseqMissThreshold = 1;
      c.magThreshold = 20000;
      c.numSamples = 4 * 1024;
      //Default Overlap of FFT signal analysis over previous samples
      c.sigOverlapRatio = 0.25;
   }

   c.proximityTxTimeout = 20 * 1000;
   c.proximityRxTimeout = 40 * 1000;
   Genesis.fn.printProximityConfig();
   window.plugins.proximityID.init(s_vol_ratio, r_vol_ratio);
};
var soundInit = function()
{
   var me = gblController;
   //
   // Initialize Sound Files, make it non-blocking
   //
   me.sound_files =
   {
   };
   var soundList = [//
   ['rouletteSpinSound', 'roulette_spin_sound', 'Media'], //
   ['winPrizeSound', 'win_prize_sound', 'Media'], //
   ['losePrizeSound', 'lose_prize_sound', 'Media'], //
   ['birthdaySound', 'birthday_surprise', 'Media'], //
   ['promoteSound', 'promote_sound', 'FX'], //
   ['clickSound', 'click_sound', 'FX'], //
   //['refreshListSound', 'refresh_list_sound', 'FX'], //
   ['beepSound', 'beep.wav', 'FX']];

   for (var i = 0; i < soundList.length; i++)
   {
      //console.debug("Preloading " + soundList[i][0] + " ...");
      me.loadSoundFile.apply(me, soundList[i]);
   }
};
var setChildBrowserVisibility = function(visible, hash, pushNotif)
{
   var db = Genesis.db.getLocalDB(true), version = '?v=' + Genesis.constants.clientVersion;

   hash = hash || '';
   if (visible)
   {
      //
      // Initiliazation
      //
      if (!mainAppInit)
      {
         if (Genesis.fn.isNative())
         {
            var profile;
            if (!($.os && ($.os.phone || $.os.tablet)))
            {
               profile = 'Desktop';
            }
            else if ($.os.ios)
            {
               profile = 'Iphone';
            }
            else
            //else if ($.os.android)
            {
               profile = 'Android';
            }

            var i = 0x000, callback = function(success, flag)
            {
               if (success && ((i |= flag) == 0x111))
               {
                  i = 0;

                  $('#loadingMask')['addClass']('x-item-hidden');

                  mainAppInit = true;
                  $("#checkexplorepageview").addClass('x-item-hidden');
                  //
                  // Startup Application
                  //

                  Ext.Loader.setConfig(
                  {
                     enabled : false,
                     paths :
                     {
                        Ext : _extPath,
                        Genesis : _appPath,
                        "Ext.ux" : _appPath
                     }
                  });

                  Ext.application(
                  {
                     requires : ['Ext.MessageBox', 'Ext.device.Notification', 'Ext.device.Camera', 'Ext.device.Orientation'],
                     profiles : [profile],
                     views : ['Document', 'client.UploadPhotosPage', 'client.ChallengePage', 'client.Rewards', 'client.Redemptions',
                     // //
                     'client.AccountsTransfer', 'client.SettingsPage', //
                     'LoginPage', 'SignInPage', 'client.MainPage', 'widgets.client.RedeemItemDetail', 'client.Badges', 'client.JackpotWinners', 'client.MerchantAccount',
                     // //
                     'client.MerchantDetails', 'client.Accounts', 'client.Prizes', 'Viewport'],
                     controllers : ['client.Challenges', 'client.Rewards', 'client.Redemptions', //
                     'client.Viewport', 'client.Login', 'client.MainPage', 'client.Badges', 'client.Merchants', 'client.Accounts', 'client.Settings', 'client.Checkins', 'client.JackpotWinners', 'client.Prizes'],
                     launch : function()
                     {
                        _application = this;
                        var viewport = _application.getController('client' + '.Viewport');

                        console.debug("Ext App Launch");

                        viewport.appName = appName;
                        QRCodeReader.prototype.scanType = "Default";
                        console.debug("QRCode Scanner Mode[" + QRCodeReader.prototype.scanType + "]");
                        if (pushNotif)
                        {
                           viewport.setApsPayload(pushNotif);
                        }
                        viewport.redirectTo('');

                        console.debug("Launched App");
                     },
                     appFolder : _appPath,
                     name : 'Genesis'
                  });
               }
            };

            setLoadMask(true);
            Genesis.fn.checkloadjscssfile('../lib/sencha-touch-all.js' + version, "js", function(success)
            {
               if (success)
               {
                  Genesis.fn.checkloadjscssfile('../core.js' + version, "js", Ext.bind(callback, null, [0x001], true));
                  Genesis.fn.checkloadjscssfile('../app/profile/' + profile + '.js' + version, "js", Ext.bind(callback, null, [0x010], true));
                  Genesis.fn.checkloadjscssfile('../client-all.js' + version, "js", Ext.bind(callback, null, [0x100], true));
               }
               else
               {
                  setNotificationVisibility(true, 'KICKBAK', "Error Loading Application Resource Files.", "Dismiss", Ext.emptyFn);
               }
            });
         }
         else
         {
            mainAppInit = true;
            if (pushNotif)
            {
            }
            else
            {
            }
            $(".iframe")[0].src = '../index.html' + version + '#' + hash;
            $(".iframe").removeClass('x-item-hidden');
         }
      }
      //
      // Back to Main Page
      //
      else if (db['auth_code'])
      {
         var viewport;
         if (Genesis.fn.isNative())
         {
            viewport = _application.getController('client' + '.Viewport');
            $("#checkexplorepageview").addClass('x-item-hidden');
            if (pushNotif)
            {
               viewport.setApsPayload(pushNotif);
               viewport.redirectTo('');
            }
            else if (!redirectToMerchantPage(db, viewport))
            {
               viewport.redirectTo('main');
            }
            $("#ext-viewport").removeClass('x-item-hidden');
         }
         else if ($(".iframe")[0].contentWindow._application)
         {
            viewport = $(".iframe")[0].contentWindow._application.getController('client' + '.Viewport');
            if (pushNotif)
            {
            }
            else if (!redirectToMerchantPage(db, viewport))
            {
               viewport.redirectTo('main');
            }
            $(".iframe").removeClass('x-item-hidden');
         }
      }
      //
      // Goto Login Page
      //
      else
      {
         if (Genesis.fn.isNative())
         {
            $("#checkexplorepageview").addClass('x-item-hidden');
            _application.getController('client' + '.Viewport').redirectTo('login');
            $("#ext-viewport").removeClass('x-item-hidden');
         }
         else if ($(".iframe")[0].contentWindow._application)
         {
            $(".iframe")[0].contentWindow._application.getController('client' + '.Viewport').redirectTo('login');
            $(".iframe").removeClass('x-item-hidden');
         }
      }
   }
   else
   {
      //
      // Refresh is not logged in
      //
      if (!db['auth_code'])
      {
         $('.body ul').html('');
         if (!($.os && $.os.ios && (parseFloat($.os.version) >= 7.0)))
         {
            $('#checkexplorepageview .body').infiniteScroll('reset');
         }
      }

      $("#earnPtsLoad span.x-button-label").text((db['auth_code']) ? 'Earn Points' : 'Sign In / Register');
      window.location.hash = '#' + hash;
      if (Genesis.fn.isNative())
      {
         $("#checkexplorepageview").removeClass('x-item-hidden');
         $("#ext-viewport").addClass('x-item-hidden');
      }
      else
      {
         $(".iframe").addClass('x-item-hidden');
      }
   }
};
var redirectToMerchantPage = function(db, viewport)
{
   var rc = false, ma_struct = db['ma_struct'];
   if (Ext.isDefined(ma_struct) && (ma_struct['id'] > 0))
   {
      // Mini App forwarding
      Genesis.db.removeLocalDBAttrib('ma_struct');
      viewport.getController('client' + '.Checkins').onExploreDisclose(null, ma_struct);
      rc = true;
   }

   return rc;
};
var setLoadMask = function(visible)
{
   $('#loadingMask')[visible ? 'removeClass' : 'addClass']('x-item-hidden');
};
var detectAccessToken = function(url)
{
   var db = Genesis.db.getLocalDB();
   if (db['fbLoginInProgress'] && (url.indexOf("access_token=") !== -1))
   {
      setChildBrowserVisibility(true, url.split("#")[1]);
   }
   else
   {
      setChildBrowserVisibility(false);
   }
};

/*
if (Ext.os.is('Android') && Genesis.fn.isNative())
{
navigator.app.exitApp();
}
else if (!Genesis.fn.isNative())
{
window.location.reload();
}
*/
// =============================================================
// System Utilities
// =============================================================
(function()
{
   var width, height, iscroll, disableHash = false;
   var setImageSize = function()
   {
      var image = $('#earnPtsImage img')[0];

      // specific OS
      if (!($.os && ($.os.phone || $.os.tablet)) || $.os.ios)
      {
         width = height = 2 * 57 * 1.5;
      }
      else// if ($.os.android || $.os.webos || $.os.blackberry || $.os.bb10 || $.os.rimtabletos)
      {
         if (window.devicePixelRatio > 1)
         {
            width = height = 4 * 48;
         }
         else
         {
            width = height = 4 * 36;
         }
      }
      var ratio = 1;
      if ($.os && $.os.phone)
      {
         ratio = (window.orientation === 0) ? 1 : window.screen.width / window.screen.height;
      }
      else
      {
         height = width *= 2;
      }
      image.style.height = (height * ratio) + 'px';
      image.style.width = (height * ratio) + 'px';
   };
   var orientationChange = function()
   {
      setImageSize();
      $('body')[(window.orientation == 0) ? 'addClass' : 'removeClass']('x-portrait');
      $('body')[(window.orientation == 0) ? 'removeClass' : 'addClass']('x-landscape');
   };
   var hideEarnPtsPage = function(e)
   {
      $("#earnptspageview").animate(
      {
         top : (-1 * Math.max(window.screen.height, window.screen.width)) + 'px'
      },
      {
         duration : 0.75 * 1000,
         easing : 'ease-in',
         complete : function()
         {
         }
      });
   };
   var refreshCheckExploreVenues = function()
   {
      var desktop = !($.os && ($.os.phone || $.os.tablet)), pfEvent = (desktop) ? 'click' : 'tap';
      var exploreVenue = function(e)
      {
         var me = gblController, target = e.currentTarget, ma_struct = Ext.decode(decodeURIComponent(target.attributes.getNamedItem('data')['value']));

         me.playSoundFile(me.sound_files['clickSound']);
         console.debug("Target ID : ", ma_struct['name'] + "(" + ma_struct['id'] + ")");
         Genesis.db.setLocalDBAttrib('ma_struct', ma_struct);
         setChildBrowserVisibility(true);
         return false;
      };
      $('.media').off().on(pfEvent, exploreVenue).swipeLeft(exploreVenue).swipeRight(exploreVenue);
   };
   var appLaunchCallbackFn = function()
   {
   };
   var getNearestVenues = function(start, refresh)
   {
      var me = gblController, viewport = me.getViewPortCntlr();
      var getAddress = function(values)
      {
         return (values['address'] + ",<br/>" + values['city'] + ", " + values['state'] + ", " + values['country'] + ",<br/>" + values['zipcode']);
      };
      var getDistance = function(values)
      {
         return ((values['distance'] > 0) ? values['distance'].toFixed(1) + 'km' : '');
      };

      setLoadMask(true);
      $(document).one('locationupdate', function(e, position)
      {
         var params =
         {
            latitude : position.coords.latitude,
            longitude : position.coords.longitude,
            start : start,
            limit : start + 20
         };
         ajax = $.ajax(
         {
            type : 'GET',
            url : serverHost + '/api/v1/venues/find_nearest',
            // data to be added to query string:
            data : params,
            // type of data we are expecting in return:
            dataType : 'json',
            timeout : 30 * 1000,
            context : document,
            success : function(data)
            {
               setLoadMask(false);
               if (!data)
               {
                  setNotificationVisibility(true, 'Warning', me.missingVenueInfoMsg(), "Dismiss", Ext.emptyFn);
                  return;
               }
               else if (data.data.length == 0)
               {
                  setNotificationVisibility(true, 'Explore', me.noVenueInfoMsg(), "Dismiss", Ext.emptyFn);
                  return;
               }

               var venues = "";
               console.debug("AJAX Response", data);

               if (refresh)
               {
                  $('.body ul').html(venues);
                  if (!($.os && $.os.ios && (parseFloat($.os.version) >= 7.0)))
                  {
                     $('#checkexplorepageview .body').infiniteScroll('reset');
                  }
               }

               for (var i = 0; i < data.data.length; i++)
               {
                  var venue = data.data[i];
                  // @formatter:off
                  venues +=  //
                  '<li class="media" data="'+ encodeURIComponent(Ext.encode(venue)) +'">'+
                     '<a class="pull-left" href="#"> <img src="' + venue['merchant']['photo']['url'] + '" class="media-object" data-src="holder.js/64x64" alt=""> </a>'+
                     '<div class="media-body">' +
                        '<div class="media-heading">' + venue['name'] + '</div>' +
                           '<div class="itemDistance">' + getDistance(venue) + '</div>' +
                           '<div class="itemDesc">' + getAddress(venue) + '</div>' +
                     '</div>' +
                  '</li>';
                  // @formatter:on
               }
               $('.body ul').append(venues);
               refreshCheckExploreVenues();

               if (!($.os && $.os.ios && (parseFloat($.os.version) >= 7.0)))
               {
                  iscroll.refresh();
                  if (refresh)
                  {
                     $('#checkexplorepageview .body').infiniteScroll('reset');
                  }
               }
            },
            error : function(xhr, type)
            {
               setLoadMask(false);
               setNotificationVisibility(true, 'Warning', me.missingVenueInfoMsg(), "Dismiss", Ext.emptyFn);
            }
         });
      });
      viewport.getGeoLocation();
   };
   var refreshCSRFToken = function()
   {
      var me = gblController, db = Genesis.db.getLocalDB(), device = Genesis.constants.device;

      if (!device)
      {
         console.log("Error Registering with PushNotification");
         device = null;
      }

      if (db['auth_code'])
      {
         var params =
         {
            version : Genesis.constants.clientVersion,
            device_pixel_ratio : window.devicePixelRatio,
            device : Ext.encode(device)
         };

         setLoadMask(true);
         ajax = $.ajax(
         {
            type : 'GET',
            url : serverHost + '/api/v1/tokens/get_csrf_token',
            // data to be added to query string:
            data : params,
            // type of data we are expecting in return:
            dataType : 'json',
            timeout : 30 * 1000,
            context : document,
            success : function(data)
            {
               Genesis.db.setLocalDBAttrib('csrf_code', data['metaData']['csrf_token']);
               // Return to previous Venue
               if (db['last_check_in'])
               {
                  me.getGeoLocation();
               }
               setLoadMask(false);
            },
            error : function(xhr, type)
            {
               setLoadMask(false);
               //me.resetView();
               //me.redirectTo('login');
            }
         });
      }
   };

   window.addEventListener('hashchange', function()
   {
      //
      // Only check for Hash change on MiniClient focus
      //
      if ($('iframe').hasClass('x-item-hidden') && !disableHash)
      {
         switch (window.location.hash.split('#')[1])
         {
            case 'explore' :
            {
               disableHash = true;
               window.location.hash = "";
               break;
            }
            default:
               if ($("#earnptspageview")[0].style.top.split('px')[0] == 0)
               {
                  hideEarnPtsPage();
               }
               break;
         }
      }
      else
      {
         disableHash = false;
      }
   });
   window.addEventListener("orientationchange", orientationChange);
   $(window).resize(orientationChange);

   if (!($.os && $.os.ios && (parseFloat($.os.version) >= 7.0)))
   {
      $(window).on('scroll', function(e)
      {
         setTimeout(function()
         {
            try
            {
               var totalHeight = parseInt(document.body.style.height.split('px')[0]) + getHeightOfIOSToolbars();

               //if (window.outerHeight > window.innerHeight)
               if (Math.abs(totalHeight - ((window.orientation === 0) ? window.screen.height : window.screen.width)) > 20)
               {
                  window.scrollTo(0, 0);
               }
            }
            catch(e)
            {
            }
         }, 0.1 * 1000);
      });

      $(document.body).on('touchmove', function(e)
      {
         e.preventDefault();
      });
   }
   $(document).ready(function()
   {
      var me = gblController, viewport = gblController.getViewPortCntlr(), //
      desktop = !($.os && ($.os.phone || $.os.tablet)), pfEvent = (desktop) ? 'click' : 'tap', //
      version = '?v=' + Genesis.constants.clientVersion;

      // =============================================================
      // Custom Events
      // =============================================================
      $.Event('ajaxBeforeSend');
      $.Event('locationupdate');

      if (!Genesis.fn.isNative())
      {
         // =============================================================
         // WebAudio Support
         // =============================================================

         //var canPlayAudio = (new Audio()).canPlayType('audio/wav; codecs=1');
         //if (!canPlayAudio)
         if ( typeof (webkitAudioContext) == 'undefined')
         {
            //
            // If Worker is not supported, preload it
            //
            if ( typeof (Worker) == 'undefined')
            {
               console.debug("HTML5 Workers not supported");

               var mp3Flags = 0x00;
               var callback = function(success, flag)
               {
                  if (!success)
                  {
                     setNotificationVisibility(true, 'KICKBAK', "Error Loading Application Resource Files.", "Reload", function()
                     {
                        window.location.reload();
                     });
                  }
                  else
                  {
                     if ((mp3Flags |= flag) == 0x11)
                     {
                        appLaunchCallbackFn(true, 0x100);
                        console.debug("Enable MP3 Encoder");
                     }
                  }
               };

               Genesis.fn.checkloadjscssfile('../lib/libmp3lame.min.js' + version, "js", Ext.bind(callback, null, [0x01], true));
               Genesis.fn.checkloadjscssfile('../worker/encoder.min.js' + version, "js", function(success)
               {
                  if (success)
                  {
                     _codec = new Worker('../worker/encoder.min.js' + version);
                  }
                  callback(success, 0x10);
               });
            }
            else
            {
               _codec = new Worker('../worker/encoder.min.js' + version);
               appLaunchCallbackFn(true, 0x100);
               console.debug("Enable MP3 Encoder");
            }
         }
         else
         {
            appLaunchCallbackFn(true, 0x100);
            console.debug("Enable WAV/WebAudio Encoder");
         }

         // =============================================================
         // SystemInit
         // =============================================================
         proximityInit();
         soundInit();
      }

      // =============================================================
      // Ajax Calls Customizations
      // =============================================================
      $.ajaxSettings.accepts.json = "*/*";
      var _param = $.param;
      $.param = function(obj, traditional)
      {
         var db = Genesis.db.getLocalDB();

         if (db['auth_code'])
         {
            obj['auth_token'] = db['auth_code'];
         }
         return _param(obj, traditional);
      }
      $(document).on('ajaxBeforeSend', function(e, xhr, options)
      {
         var db = Genesis.db.getLocalDB();

         // This gets fired for every Ajax request performed on the page.
         // The xhr object and $.ajax() options are available for editing.
         // Return false to cancel this request.
         options.headers = options.headers ||
         {
         };
         if (options.type == 'POST')
         {
            if (db['auth_code'])
            {
               options.headers = Ext.apply(options.headers,
               {
                  'X-CSRF-Token' : db['csrf_code'],
               });
               xhr.setRequestHeader('X-CSRF-Token', db['csrf_code']);
            }
            options.headers = Ext.apply(options.headers,
            {
               'Content-Type' : 'application/json'
            });
            xhr.setRequestHeader('Content-Type', 'application/json');
         }
      });

      // =============================================================
      // Refresh CSRF Token
      // =============================================================
      if (Genesis.constants.device || !Genesis.fn.isNative())
      {
         refreshCSRFToken();
      }
      else
      {
         $(document).on('kickbak:updateDeviceToken', refreshCSRFToken);
      }

      // =============================================================
      // System Initializations
      // =============================================================
      orientationChange();

      if (!($.os && ($.os.phone || $.os.tablet)) || $.os.ios)
      {
         $('body').addClass('x-ios');
         $('body').addClass('x-ios-' + parseInt((($.os) ? $.os.version : '6')));
      }
      else if ($.os.blackberry || $.os.bb10 || $.os.rimtabletos)
      {
         $('body').addClass('x-blackberry');
         $('body').addClass('x-blackberry-' + parseInt(($.os.version)));
      }
      else
      //else if ($.os.android)
      {
         $('body').addClass('x-android');
         $('body').addClass('x-android-' + parseInt(($.os.version)));
      }
      if (!($.os && ($.os.phone || $.os.tablet)))
      {
         $('body').addClass('x-desktop');
      }
      else
      {
         $('body').addClass(($.os.phone) ? 'x-phone' : 'x-tablet');
      }

      var _hide_ = function(e)
      {
         me.playSoundFile(me.sound_files['clickSound']);
         hideEarnPtsPage(e);
         return false;
      };
      $('#earnPtsCancel').on(pfEvent, _hide_);
      $('#earnPtsDismiss').on(pfEvent, _hide_);
      $('#earnptspageview')[0].style.top = (-1 * Math.max(window.screen.height, window.screen.width)) + 'px';

      // =============================================================
      // Venue Browse/Scroll
      // =============================================================
      var ajax, i = -1, iscrollInfinite = $('#checkexplorepageview .body');
      if (!($.os.ios && (parseFloat($.os.version) >= 7.0)))
      {
         $('#checkexplorepageview .body > div:first-child').addClass('scroller');
         iscroll = new IScroll('#checkexplorepageview .body',
         {
            scrollbars : true,
            mouseWheel : true,
            interactiveScrollbars : false
         });
         var origEventHandler = iscroll.handleEvent;
         iscrollInfinite.infiniteScroll(
         {
            threshold : window.screen.height,
            iScroll : iscroll,
            onEnd : function()
            {
               console.debug('No More Results');
            },
            onBottom : function(callback)
            {
               if ($('.media').length > 0)
               {
                  console.debug('At the end of the page. Loading more!');
                  getNearestVenues($('.media').length);
               }
               callback(true);
            }
         });

         iscroll.handleEvent = function(e)
         {
            origEventHandler.call(iscroll, e);
            switch ( e.type )
            {
               case 'touchmove':
               case 'MSPointerMove':
               case 'mousemove':
                  iscrollInfinite.data().infiniteScroll.iScroll.options.onScrollMove();
                  break;
            }
         };
      }
      else
      {
         $('#checkexplorepageview').addClass('noIScroll');
      }
      var pageX = 0, pageY = 0;
      var _getVenues_ = function(e)
      {
         x1 = parseInt(window.screen.width * (0.5 - (0.65 / 2))), x2 = parseInt(window.screen.width * 0.65);
         y1 = parseInt(window.screen.height * (0.5 - (0.65 / 2))), y2 = parseInt(window.screen.height * 0.65);

         //cursor:pointer
         //console.log("x=" + pageX + ", x1=" + x1 + ", x2=" + x2 + ", y=" + pageY + ", y1=" + y1 + ", y2=" + y2);
         if ((pageX >= x1 && pageX <= x2) && (pageY >= y1 && pageY <= y2))
         {
            var db = Genesis.db.getLocalDB();
            if (db['auth_code'])
            {
               //
               // Trigger when the list is empty
               //
               if ($('.media').length == 0)
               {
                  me.playSoundFile(me.sound_files['clickSound']);
                  getNearestVenues(0);
               }
            }
            else
            {
               me.playSoundFile(me.sound_files['clickSound']);
               setChildBrowserVisibility(true);
            }
         }
         return false;
      };
      $('#checkexplorepageview .body').on(pfEvent, _getVenues_);
      $('#checkexplorepageview .body').on('touchstart', function(e)
      {
         pageX = e.touches[0].clientX;
         pageY = e.touches[0].clientY;
      });
      // =============================================================
      // WelcomePage Actions
      // =============================================================
      var _ptsLoad_ = function()
      {
         me.playSoundFile(me.sound_files['clickSound']);
         var db = Genesis.db.getLocalDB();
         if (db['auth_code'])
         {
            $('#earnPtsProceed').trigger(pfEvent);
         }
         else
         {
            setChildBrowserVisibility(true);
         }
         return false;
      };
      $("#earnPtsLoad").on(pfEvent, _ptsLoad_);

      // =============================================================
      // ExplorePage Actions
      // =============================================================
      var _home_ = function(e)
      {
         var db = Genesis.db.getLocalDB();
         me.playSoundFile(me.sound_files['clickSound']);
         //refresh
         if (db['auth_code'] && ($(e.currentTarget).has('.x-button .x-button-icon.refresh').length > 0))
         {
            getNearestVenues(0, true);
         }
         else
         //home
         //else if ($(e.currentTarget).has('.x-button .x-button-icon.home'))
         {
            setChildBrowserVisibility(true);
         }
         return false;
      };
      $('#checkexplorepageview .header .x-layout-box-item').on(pfEvent, _home_);
      var _preLoad_ = function(e)
      {
         var task, privKey;

         if (me.pendingBroadcast)
         {
            return;
         }

         me.playSoundFile(me.sound_files['clickSound']);
         //
         // Check for Mobile Number Validation
         //
         var message = $('#earnptspageview .x-docked-top .x-innerhtml'), image = $('#earnPtsImage');
         var db = Genesis.db.getLocalDB(), venue = viewport.getVenue(), venueId, position = viewport.getLastPosition();

         me.identifiers = null;

         //
         // Get GeoLocation and frequency markers
         //
         //if (!notUseGeolocation)
         {
            venueId = -1;
            privKey = Genesis.fn.privKey =
            {
               'venueId' : venueId,
               'venue' : Genesis.constants.debugVenuePrivKey
            };
            privKey['r' + venueId] = privKey['p' + venueId] = db['csrf_code'];
         }

         window.plugins.proximityID.preLoadSend(gblController, true, Ext.bind(function(notUseGeolocation)
         {
            me.broadcastLocalID(function(idx)
            {
               me.identifiers = idx;
               $("#earnptspageview").trigger('kickbak:broadcast');

               console.debug("Broadcast underway ...");
               position = viewport.getLastPosition();
               if (notUseGeolocation || position)
               {
                  var ajax, localID = me.identifiers['localID'], venue = viewport.getVenue(), venueId = null;
                  var params =
                  {
                  };
                  //
                  // With or without Geolocation support
                  //
                  if (!venueId)
                  {
                     //
                     // We cannot use short cut method unless we have either GeoLocation or VenueId
                     //
                     if (!position)
                     {
                        //
                        // Stop broadcasting now ...
                        //
                        if (me.identifiers)
                        {
                           me.identifiers['cancelFn']();
                        }
                        hideEarnPtsPage();

                        setNotificationVisibility(true, 'KICKBAK', me.cannotDetermineLocationMsg, "Dismiss", Ext.emptyFn);
                        return;
                     }

                     params = Ext.apply(params,
                     {
                        data : me.self.encryptFromParams(
                        {
                           'frequency' : localID
                        }, 'reward'),
                        'latitude' : position.coords.latitude,
                        'longitude' : position.coords.longitude
                     });
                  }
                  else
                  {
                     params = Ext.apply(params,
                     {
                        data : me.self.encryptFromParams(
                        {
                           'frequency' : localID
                        }, 'reward'),
                        venue_id : venueId
                     });
                  }

                  //
                  // Triggers PrizeCheck and MetaDataChange
                  // - subject CustomerReward also needs to be reset to ensure property processing of objects
                  //
                  console.debug("Transmitting Reward Points Request ...");

                  var _dismiss_ = function(msg)
                  {
                     //$('#earnPtsDismiss').off(pfEvent, _dismiss_);

                     me.playSoundFile(me.sound_files['clickSound']);
                     if (ajax)
                     {
                        ajax.abort();
                     }
                     if (me.identifiers)
                     {
                        me.identifiers['cancelFn']();
                     }
                     setLoadMask(false);

                     setNotificationVisibility(true, 'Rewards', ( typeof (msg) != 'string') ? me.transactionCancelledMsg : msg, "Dismiss", function()
                     {
                     });
                     return false;
                  };
                  $('#earnPtsDismiss').one(pfEvent, _dismiss_);

                  ajax = $.ajax(
                  {
                     type : 'POST',
                     url : serverHost + '/api/v1/purchase_rewards/earn',
                     // data to be added to query string:
                     data : params,
                     // type of data we are expecting in return:
                     dataType : 'json',
                     timeout : 30 * 1000,
                     context : document,
                     success : function(data)
                     {
                        if (!data)
                        {
                           if (me.identifiers)
                           {
                              console.debug("AJAX Error Response", me.identifiers);
                           }
                           $('#earnPtsDismiss').trigger(pfEvent, [me.networkErrorMsg]);
                           return;
                        }

                        //
                        // Stop broadcasting now ...
                        //
                        if (me.identifiers)
                        {
                           me.identifiers['cancelFn']();
                        }
                        setLoadMask(false);

                        console.debug("AJAX Response", data);
                        setNotificationVisibility(true, 'Rewards', "", "OK", function()
                        {
                        });
                     },
                     error : function(xhr, type)
                     {
                        if (me.identifiers)
                        {
                           console.debug("AJAX Error Response", me.identifiers);
                        }
                        $('#earnPtsDismiss').trigger(pfEvent, [me.networkErrorMsg]);
                     }
                  });
               }
            }, function()
            {
               hideEarnPtsPage();
               //setLoadMask(false);
            });
         }, me, [false]));
         return false;
      };
      $('#earnPtsProceed').on(pfEvent, _preLoad_);

      // =============================================================
      // Facebook Access Token Detect
      // =============================================================
      detectAccessToken(href);
   });
})();
