import { createTestAccount } from "#/modules/auth/utils/account.helpers";
import {
  InputStudentProfile,
  StudentProfile,
  StudentProfileDoc,
  StudentProfileModel,
} from "@/modules/student-profiles/student-profile.model";

const getStudentProfileData = async (): Promise<InputStudentProfile> => ({
  firstName: `Test Student ${Date.now()}`,
  lastName: "Doe",
  about: "Test student profile description",
  experiences: [],
  accountId: (await createTestAccount()).id,
});

/**
 * @param data Optional data to override the default student profile data.
 * Defaults to {@link getStudentProfileData}.
 */
async function createTestStudentProfile(
  data?: Partial<InputStudentProfile>
): Promise<StudentProfile> {
  const defaultProfile = await getStudentProfileData();

  const profileData = {
    ...defaultProfile,
    ...data,
  };

  const profile = new StudentProfileModel(profileData);
  const doc = await profile.save();
  await doc.populate(["picture", "resume"]);
  return StudentProfile.fromDoc(doc as StudentProfileDoc);
}

export { createTestStudentProfile, getStudentProfileData };
