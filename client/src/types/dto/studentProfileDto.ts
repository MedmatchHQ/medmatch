import { FileDto } from "@/types/dto/fileDto";

export type ExperienceDto = {
  id: string;
  jobTitle: string;
  startDate: Date;
  endDate?: Date;
  description?: string;
};

export type StudentProfileDto = {
  id: string;
  firstName: string;
  lastName: string;
  fullName: string;
  accountId: string;
  entryDate: Date;
  about?: string;
  picture?: FileDto;
  resume?: FileDto;
  experiences: ExperienceDto[];
};

export type InputExperience = {
  jobTitle: string;
  startDate: Date;
  endDate?: Date;
  description?: string;
};

export type InputStudentProfile = {
  firstName: string;
  lastName: string;
  about?: string;
  picture?: string;
  resume?: string;
  experiences: InputExperience[];
  accountId: string;
};
