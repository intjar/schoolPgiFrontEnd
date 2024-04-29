 import * as CryptoJS from 'crypto-js';
import * as global from '../app/globels';
export class Common {   
    // // Encryption process
    public static Encrypt(data: any): any {
        let parsedBase64Key = CryptoJS.enc.Base64.parse(global.EncryptKey)
        // this is Base64-encoded encrypted data
        let encryptedData = CryptoJS.AES.encrypt(data, parsedBase64Key, {
            mode: CryptoJS.mode.ECB,
            padding: CryptoJS.pad.Pkcs7
        }).toString();
        return encryptedData;
    }
    // Decryption process
    public static Decrypt(encryptedData: any): any {
        let parsedBase64Key = CryptoJS.enc.Base64.parse(global.EncryptKey)
        let decryptedData = CryptoJS.AES.decrypt(encryptedData, parsedBase64Key, {
            mode: CryptoJS.mode.ECB,
            padding: CryptoJS.pad.Pkcs7
        }).toString(CryptoJS.enc.Utf8);
        return decryptedData
    }


}