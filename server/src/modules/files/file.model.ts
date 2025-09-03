import mongoose, { Schema, HydratedDocument, InferSchemaType } from "mongoose";

const ALLOWED_FILE_TYPES = [
  "image/jpeg",
  "image/png",
  "application/pdf",
] as const;

type FileType = (typeof ALLOWED_FILE_TYPES)[number];

const fileSchema = new Schema({
  name: { type: String, required: true },
  type: {
    type: String,
    required: true,
    enum: ALLOWED_FILE_TYPES,
  },
  data: { type: Buffer, required: true },
});

type FileSchema = InferSchemaType<typeof fileSchema>;

/** A file document returned by a mongoose query */
interface FileDoc extends HydratedDocument<FileSchema> {}

/**
 * The base level populated file object to be returned by the API.
 */
class File {
  constructor(public id: string, public name: string, public type: FileType) {}

  static fromDoc(doc: FileDoc): File {
    return new File(doc._id.toString(), doc.name, doc.type);
  }
}

const FileModel = mongoose.model<FileSchema>("File", fileSchema, "files");

export { FileModel, File, FileDoc, FileSchema };
