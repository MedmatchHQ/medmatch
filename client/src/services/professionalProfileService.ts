import apiClient from "@/lib/apiClient";
import { InputProfessionalProfile, ProfessionalProfileDto } from "@/types/dto/professionalProfileDto";

const withBase = (path: string) => `/api/professional-profiles${path}`;

async function getAllProfessionalProfiles(): Promise<ProfessionalProfileDto[]> {
  const res = await apiClient.get<ProfessionalProfileDto[]>(withBase("/"));
  return res.data.data;
}

async function getProfessionalProfileById(id: string): Promise<ProfessionalProfileDto | null> {
  const res = await apiClient.get<ProfessionalProfileDto>(withBase(`/${id}`));
  return res.data.data;
}

async function createProfessionalProfile(
  profile: InputProfessionalProfile
): Promise<ProfessionalProfileDto> {
  const res = await apiClient.post<ProfessionalProfileDto>(withBase("/"), profile);
  return res.data.data;
}

async function updateProfessionalProfile(
  id: string,
  profile: Partial<Omit<ProfessionalProfileDto, "id" | "entryDate">>
): Promise<ProfessionalProfileDto> {
  const res = await apiClient.patch<ProfessionalProfileDto>(withBase(`/${id}`), profile);
  return res.data.data;
}

async function deleteProfessionalProfile(id: string): Promise<ProfessionalProfileDto> {
  const res = await apiClient.delete<ProfessionalProfileDto>(withBase(`/${id}`));
  return res.data.data;
}

export {
  getAllProfessionalProfiles,
  getProfessionalProfileById,
  createProfessionalProfile,
  updateProfessionalProfile,
  deleteProfessionalProfile,
};