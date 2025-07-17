import { File, FileDoc, FileModel, FileSchema } from "./file.model";
import { Model } from "mongoose";
import { FileNotFoundError } from "./utils/file.errors";

class FileService {
  constructor(private fileModel: Model<FileSchema> = FileModel) {}

  /**
   * Retrieves all files from the database.
   * @returns An array of all files
   */
  async getAllFiles(): Promise<File[]> {
    const docs = await this.fileModel.find<FileDoc>().exec();
    return docs.map((doc) => File.fromDoc(doc));
  }

  /**
   * Retrieves a file by its unique identifier.
   * @param fileId The unique identifier of the file
   * @returns The file object if found
   * @throws A {@link FileNotFoundError} if the file with the specified id is not found
   */
  async getFileById(fileId: string): Promise<File> {
    const doc = await this.fileModel.findById<FileDoc>(fileId).exec();
    if (!doc) {
      throw new FileNotFoundError(`File with id ${fileId} not found`);
    }
    return File.fromDoc(doc);
  }

  /**
   * Creates a new file with the provided file data.
   * @param fileData File data used to create a new file (excluding id)
   * @returns The newly created file object
   */
  async createFile(fileData: Omit<File, "id">): Promise<File> {
    const file = new this.fileModel(fileData);
    const doc = await file.save();
    return File.fromDoc(doc);
  }

  /**
   * Deletes a file by its unique identifier.
   * @param fileId The unique identifier of the file to delete
   * @returns The deleted file object
   * @throws A {@link FileNotFoundError} if the file with the specified id is not found
   */
  async deleteFile(fileId: string): Promise<File> {
    const doc = await this.fileModel.findByIdAndDelete<FileDoc>(fileId).exec();
    if (!doc) {
      throw new FileNotFoundError(`File with id ${fileId} not found`);
    }
    return File.fromDoc(doc);
  }
}

export { FileService };
