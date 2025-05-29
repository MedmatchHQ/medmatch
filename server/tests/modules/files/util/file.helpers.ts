import { FileModel, File } from "@/modules/files";

function defaultFileData(): Omit<File, "id"> {
  return {
    type: "image/png",
    name: `Test-${Date.now()}`,
    data: Buffer.from("test data"),
  };
}

async function createTestFile(data?: Partial<File>): Promise<File> {
  const defaultFile = defaultFileData();

  const fileData = {
    ...defaultFile,
    ...data,
  };

  const file = new FileModel(fileData);
  const doc = await file.save();
  return File.fromDoc(doc);
}

export { createTestFile, defaultFileData };
