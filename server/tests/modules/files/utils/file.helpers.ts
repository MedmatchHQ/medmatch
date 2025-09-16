import { File, FileModel } from "@/modules/files/file.model";

const getFileData = (): Omit<File, "id"> => ({
  type: "image/png",
  name: `Test-${Date.now()}`,
  data: Buffer.from("test data"),
});

/**
 * @param data Optional data to override the default file data.
 * Defaults to {@link getFileData}.
 */
async function createTestFile(data?: Partial<File>): Promise<File> {
  const defaultFile = getFileData();

  const fileData = {
    ...defaultFile,
    ...data,
  };

  const file = new FileModel(fileData);
  const doc = await file.save();
  return File.fromDoc(doc);
}

export { createTestFile, getFileData };
