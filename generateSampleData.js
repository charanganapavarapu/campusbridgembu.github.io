const mongoose = require('mongoose');
const User = require('./models/User');
const Course = require('./models/Course');
const Assessment = require('./models/Assessment');
const Achievement = require('./models/Achievement');
const LearnToEarn = require('./models/LearnToEarn');
const CodingChallenge = require('./models/CodingChallenge');

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/xhorizon', {
    useNewUrlParser: true,
    useUnifiedTopology: true
});

const sampleUsers = [
    {
        username: 'john_doe',
        email: 'john.doe@example.com',
        password: 'password123',
        role: 'student',
        points: 1500,
        profile: {
            name: 'John Doe',
            bio: 'Computer Science student passionate about AI and Machine Learning',
            avatar: 'https://i.pravatar.cc/150?img=1',
            skills: ['Python', 'JavaScript', 'Machine Learning']
        }
    },
    {
        username: 'jane_smith',
        email: 'jane.smith@example.com',
        password: 'password123',
        role: 'faculty',
        points: 2500,
        profile: {
            name: 'Jane Smith',
            bio: 'Professor of Computer Science with expertise in Data Structures',
            avatar: 'https://i.pravatar.cc/150?img=2',
            skills: ['Data Structures', 'Algorithms', 'Java']
        }
    }
];

const sampleCourses = [
    {
        title: 'Introduction to Programming',
        description: 'Learn the fundamentals of programming with Python',
        instructor: 'Jane Smith',
        duration: '8 weeks',
        level: 'Beginner',
        topics: ['Variables', 'Loops', 'Functions', 'Data Structures']
    },
    {
        title: 'Advanced Web Development',
        description: 'Master modern web development with React and Node.js',
        instructor: 'John Doe',
        duration: '12 weeks',
        level: 'Advanced',
        topics: ['React', 'Node.js', 'Express', 'MongoDB']
    }
];

const sampleAssessments = [
    {
        title: 'Python Basics Quiz',
        description: 'Test your knowledge of Python fundamentals',
        course: 'Introduction to Programming',
        duration: 30,
        questions: [
            {
                question: 'What is Python?',
                options: ['A snake', 'A programming language', 'A type of coffee', 'A car brand'],
                correctAnswer: 1
            }
        ]
    }
];

const sampleAchievements = [
    {
        title: 'Python Master',
        description: 'Completed all Python challenges',
        points: 500,
        icon: 'python-icon.png'
    }
];

const sampleChallenges = [
    {
        title: 'FizzBuzz Challenge',
        description: 'Implement the classic FizzBuzz problem',
        difficulty: 'Easy',
        points: 100,
        language: 'Python',
        testCases: [
            { input: 3, output: 'Fizz' },
            { input: 5, output: 'Buzz' },
            { input: 15, output: 'FizzBuzz' }
        ]
    }
];

const sampleLearnToEarn = [
    {
        title: 'Complete Python Course',
        description: 'Finish the complete Python programming course',
        reward: 1000,
        type: 'course_completion',
        requirements: {
            course: 'Introduction to Programming',
            minimumScore: 80
        }
    }
];

async function generateSampleData() {
    try {
        // Clear existing data
        await mongoose.connection.dropDatabase();
        console.log('Database cleared');

        // Create users
        const users = await User.create(sampleUsers);
        console.log('Sample users created');

        // Create courses
        const courses = await Course.create(sampleCourses);
        console.log('Sample courses created');

        // Create assessments
        const assessments = await Assessment.create(sampleAssessments);
        console.log('Sample assessments created');

        // Create achievements
        const achievements = await Achievement.create(sampleAchievements);
        console.log('Sample achievements created');

        // Create coding challenges
        const challenges = await CodingChallenge.create(sampleChallenges);
        console.log('Sample coding challenges created');

        // Create learn to earn tasks
        const learnToEarn = await LearnToEarn.create(sampleLearnToEarn);
        console.log('Sample learn to earn tasks created');

        console.log('Sample data generation completed successfully!');
        process.exit(0);
    } catch (error) {
        console.error('Error generating sample data:', error);
        process.exit(1);
    }
}

generateSampleData(); 