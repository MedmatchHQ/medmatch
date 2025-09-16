import { createTestAccount } from "#/modules/auth/utils/account.helpers";
import {
  InputProfessionalProfile,
  ProfessionalProfile,
  ProfessionalProfileModel,
} from "@/modules/professional-profiles/professional-profile.model";

const getProfessionalProfileData =
  async (): Promise<InputProfessionalProfile> => ({
    name: `Test Professional ${Date.now()}`,
    about: "This is a test professional profile",
    website: "https://test-company.test",
    mission: "To provide excellent test services",
    location: "Test City, Test State",
    tag: "Company",
    accountId: (await createTestAccount()).id,
  });

/**
 * @param data Optional data to override the default professional profile data.
 * Defaults to {@link getProfessionalProfileData}.
 */
async function createTestProfessionalProfile(
  data?: Partial<InputProfessionalProfile>
): Promise<ProfessionalProfile> {
  const defaultProfile = await getProfessionalProfileData();

  const profileData = {
    ...defaultProfile,
    ...data,
  };

  const profile = new ProfessionalProfileModel(profileData);
  const doc = await profile.save();
  return ProfessionalProfile.fromDoc(doc);
}

export { createTestProfessionalProfile, getProfessionalProfileData };
