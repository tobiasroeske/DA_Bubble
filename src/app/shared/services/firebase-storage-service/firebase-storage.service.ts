import { Injectable, inject } from '@angular/core';
import { Storage, StorageReference, deleteObject, getDownloadURL, getMetadata, ref, uploadBytes } from '@angular/fire/storage';

@Injectable({
  providedIn: 'root'
})
export class FirebaseStorageService {
  storage = inject(Storage);
  fileUrl!:string ;
  

  async uploadFile(path:string, file:File) {
    await uploadBytes(this.getStorageRef(path), file)
    .catch(err => console.log(err));
  }

  

  getStorageRef(path: string) {
    return ref(this.storage, path);
  }

  async getDownLoadUrl(path: string): Promise<string> {
    return (await getDownloadURL(this.getStorageRef(path)));
  }

  

  async deleteFile(path: string) {
    await deleteObject(this.getStorageRef(path))
    .catch(err => console.log(err));
  }

}


