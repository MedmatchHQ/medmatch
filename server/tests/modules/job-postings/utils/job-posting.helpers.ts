import { createTestProfessionalProfile } from "#/modules/professional-profiles/utils/professional-profile.helpers";
import {
  InputJobPosting,
  JobPosting,
  JobPostingModel,
  JobStatus,
  WorkType,
  HoursType,
} from "@/modules/job-postings/job-posting.model";

const getJobPostingData = async (): Promise<InputJobPosting> => {
  const company = await createTestProfessionalProfile();
  
  return {
    jobTitle: `Test Job ${Date.now()}`,
    companyRef: company.id,
    postDate: new Date(),
    location: "Test City, Test State",
    numAccepted: 5,
    jobStatus: JobStatus.ACTIVELY_HIRING,
    workType: WorkType.HYBRID,
    payRange: {
      min: 50000,
      max: 80000,
      currency: "USD",
      period: "yearly",
    },
    hours: {
      type: HoursType.FULL_TIME,
    },
    deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
    skillsTags: ["JavaScript", "TypeScript", "Node.js"],
    externalApplicationLink: "https://test-company.test/apply",
    about: "This is a test job posting about section with detailed description of the role and company.",
    qualifications: "Bachelor's degree in Computer Science or related field. 3+ years of experience.",
    responsibilities: "Develop and maintain web applications, collaborate with team members, write tests.",
  };
};

/**
 * @param data Optional data to override the default job posting data.
 * Defaults to {@link getJobPostingData}.
 */
async function createTestJobPosting(
  data?: Partial<InputJobPosting>
): Promise<JobPosting> {
  const defaultJobPosting = await getJobPostingData();

  const jobPostingData = {
    ...defaultJobPosting,
    ...data,
  };

  const jobPosting = new JobPostingModel(jobPostingData);
  const doc = await jobPosting.save();
  await doc.populate("companyRef", "name tag location");
  return JobPosting.fromDoc(doc as any);
}

/**
 * Creates multiple test job postings for a specific company
 */
async function createTestJobPostingsForCompany(
  companyId: string,
  count: number = 3
): Promise<JobPosting[]> {
  const jobPostings: JobPosting[] = [];
  
  for (let i = 0; i < count; i++) {
    const jobPosting = await createTestJobPosting({
      companyRef: companyId,
      jobTitle: `Test Job ${i + 1} for Company`,
      skillsTags: i === 0 ? ["JavaScript", "React"] : i === 1 ? ["Python", "Django"] : ["Java", "Spring"],
    });
    jobPostings.push(jobPosting);
  }
  
  return jobPostings;
}

export { 
  createTestJobPosting, 
  createTestJobPostingsForCompany,
  getJobPostingData 
};
