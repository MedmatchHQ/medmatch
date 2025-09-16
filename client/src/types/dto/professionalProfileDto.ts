export type ProfessionalProfileDto = {
  id: string;
  name: string;
  tag: string;
  accountId: string;
  entryDate: Date;
  about?: string;
  website?: string;
  mission?: string;
  location?: string;
};

export type InputProfessionalProfile = {
  name: string;
  tag: string;
  accountId: string;
  about?: string;
  website?: string;
  mission?: string;
  location?: string;
};