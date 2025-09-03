import mongoose, { HydratedDocument, InferSchemaType, Schema } from "mongoose";

const fileSchema = new Schema({
  name: { type: String, required: true },
  type: {
    type: String,
    required: true,
    enum: ["image/jpeg", "image/png", "application/pdf"],
  },
  data: { type: Buffer, required: true },
});

type FileSchema = InferSchemaType<typeof fileSchema>;

/** A file document returned by a mongoose query */
interface FileDoc extends HydratedDocument<FileSchema> {}

/**
 * The base level populated file object to be returned by the API.
 */
class File implements FileSchema {
  constructor(
    public id: string,
    public name: string,
    public type: "image/jpeg" | "image/png" | "application/pdf",
    public data: Buffer
  ) {}

  static fromDoc(doc: FileDoc): File {
    return new File(doc._id.toString(), doc.name, doc.type, doc.data);
  }
}

const FileModel = mongoose.model<FileSchema>("File", fileSchema, "files");

export { File, FileDoc, FileModel, FileSchema };
