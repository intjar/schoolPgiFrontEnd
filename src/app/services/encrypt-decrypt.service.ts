import { Injectable } from '@angular/core';
import * as CryptoJS from 'crypto-js';
import * as global from '../globels';
@Injectable({
  providedIn: 'root'
})
export class EncryptDecryptService {

  constructor() { }

  private key = CryptoJS.enc.Utf8.parse(global.EncryptKey);
  private iv = CryptoJS.enc.Utf8.parse(global.EncryptIV);


  Encrypt(text: any): any {
    var encrypted = CryptoJS.AES.encrypt(CryptoJS.enc.Utf8.parse(text), this.key, {
      keySize: 128 / 8,
      iv: this.iv,
      mode: CryptoJS.mode.CBC,
      padding: CryptoJS.pad.Pkcs7
    });
    return encrypted.toString();
  }
  Decrypt(decString: any) {
    var decrypted = CryptoJS.AES.decrypt(decString, this.key, {
      keySize: 128 / 8,
      iv: this.iv,
      mode: CryptoJS.mode.CBC,
      padding: CryptoJS.pad.Pkcs7
    });
    return decrypted.toString(CryptoJS.enc.Utf8);
  }

}
