import { Injectable, inject } from '@angular/core';
import { Storage, deleteObject, getDownloadURL, getMetadata, ref, uploadBytes } from '@angular/fire/storage';

@Injectable({
  providedIn: 'root'
})
export class FirebaseStorageService {
  storage = inject(Storage);
  fileUrl!: string;

  async uploadFile(path: string, file: File): Promise<void> {
    try {
      await uploadBytes(this.getStorageRef(path), file);
    } catch (err) {
      console.error('Error uploading file:', err);
      throw err; // Optional: re-throw the error if needed
    }
  }

  getStorageRef(path: string) {
    return ref(this.storage, path);
  }

  async getDownloadUrl(path: string): Promise<string> {
    try {
      return await getDownloadURL(this.getStorageRef(path));
    } catch (err) {
      console.error('Error getting download URL:', err);
      throw err; // Optional: re-throw the error if needed
    }
  }

  async deleteFile(path: string): Promise<void> {
    try {
      await deleteObject(this.getStorageRef(path));
    } catch (err) {
      console.error('Error deleting file:', err);
      throw err; // Optional: re-throw the error if needed
    }
  }
}


