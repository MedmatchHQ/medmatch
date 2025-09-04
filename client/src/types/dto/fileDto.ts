export type FileDto = {
  id: string;
  name: string;
  type: string;
};

export type FileDataDto = {
  name: string;
  type: string;
  data: ArrayBuffer;
};
