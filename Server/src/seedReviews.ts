import mongoose from "mongoose";
import { EmployeeReview } from "./models/EmployeeReview.js";
import { User } from "./models/User.js";
import dotenv from "dotenv";

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost:27017/cogno-hire";

async function seed() {
    try {
        await mongoose.connect(MONGODB_URI);
        console.log("Connected to MongoDB");

        const users = await User.find({ role: { $in: ["employer", "hr", "candidate"] } }).limit(5);
        if (users.length === 0) {
            console.log("No users found to associate reviews with. Please create some users first.");
            process.exit(0);
        }

        const employer = await User.findOne({ role: "employer" }) || users[0];

        const reviews = [
            {
                employeeId: users[0]._id,
                employeeName: users[0].name,
                position: "Senior Full Stack Developer",
                reviewerId: employer._id,
                reviewerName: employer.name,
                reviewDate: new Date(),
                overallRating: 4.5,
                categories: {
                    technical: 5,
                    communication: 4,
                    teamwork: 4,
                    productivity: 5,
                },
                status: "COMPLETED",
                managerFeedback: "Excellent performance this quarter. Consistently delivers high-quality code and takes initiative in architectural decisions.",
                areasForGrowth: "Could improve on delegating smaller tasks to junior team members to focus more on high-level strategy.",
                goals: [
                    "Lead the migration to the new microservices architecture",
                    "Mentor two junior developers in advanced React patterns",
                ],
                achievements: [
                    "Successfully launched the new candidate portal ahead of schedule",
                    "Reduced API response times by 30% through optimized database queries",
                ],
            },
            {
                employeeId: users[1 % users.length]._id,
                employeeName: users[1 % users.length].name,
                position: "Product Designer",
                reviewerId: employer._id,
                reviewerName: employer.name,
                reviewDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
                overallRating: 4.0,
                categories: {
                    technical: 4,
                    communication: 5,
                    teamwork: 4,
                    productivity: 3,
                },
                status: "COMPLETED",
                managerFeedback: "Great eye for design and user experience. Communication with the engineering team has significantly improved.",
                areasForGrowth: "Try to streamline the design-to-development handoff process to reduce back-and-forth.",
                goals: [
                    "Complete the new design system documentation",
                    "Conduct at least 5 user research sessions for the upcoming feature",
                ],
                achievements: [
                    "Redesigned the onboarding flow, increasing completion rate by 15%",
                    "Established a consistent icon library across all platforms",
                ],
            },
            {
                employeeId: users[2 % users.length]._id,
                employeeName: users[2 % users.length].name,
                position: "Junior Frontend Developer",
                reviewerId: employer._id,
                reviewerName: employer.name,
                reviewDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
                overallRating: 0,
                categories: {
                    technical: 3,
                    communication: 3,
                    teamwork: 4,
                    productivity: 3,
                },
                status: "SCHEDULED",
            },
        ];

        await EmployeeReview.deleteMany({});
        await EmployeeReview.insertMany(reviews);

        console.log("Successfully seeded employee reviews");
        process.exit(0);
    } catch (error) {
        console.error("Error seeding reviews:", error);
        process.exit(1);
    }
}

seed();
