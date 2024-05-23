import { Injectable, inject } from '@angular/core';
import { Storage, getDownloadURL, ref, uploadBytes } from '@angular/fire/storage';

@Injectable({
  providedIn: 'root'
})
export class FirebaseStorageService {
  storage = inject(Storage);
  fileUrl!:string 
  constructor() { }

  async uploadFile(path:string, file:any) {
    await uploadBytes(this.getStorageRef(path), file)
    .catch(err => console.log(err));
  }

  getStorageRef(path: string) {
    return ref(this.storage, path);
  }

  async getDownLoadUrl(path: string): Promise<string> {
    return (await getDownloadURL(this.getStorageRef(path)));
  }
}


