require("dotenv").config();
const mongoose = require("mongoose");
const Course = require("../models/Course");
const User = require("../models/User");

const sampleCourses = [
  {
    courseCode: "CS101",
    name: "Introduction to Computer Science",
    description:
      "Fundamental concepts of computer science including programming basics, algorithms, and problem-solving techniques.",
    isActive: true,
  },
  {
    courseCode: "CS201",
    name: "Data Structures and Algorithms",
    description:
      "Study of fundamental data structures and algorithms including arrays, linked lists, trees, graphs, sorting, and searching.",
    isActive: true,
  },
  {
    courseCode: "CS301",
    name: "Database Management Systems",
    description:
      "Introduction to database design, SQL, normalization, transactions, and database administration.",
    isActive: true,
  },
  {
    courseCode: "CS401",
    name: "Operating Systems",
    description:
      "Study of operating system concepts including processes, threads, memory management, file systems, and concurrency.",
    isActive: true,
  },
  {
    courseCode: "CS501",
    name: "Software Engineering",
    description:
      "Software development methodologies, project management, testing, and best practices for large-scale software projects.",
    isActive: true,
  },
  {
    courseCode: "MATH101",
    name: "Calculus I",
    description:
      "Limits, derivatives, applications of derivatives, and introduction to integration.",
    isActive: true,
  },
  {
    courseCode: "MATH201",
    name: "Calculus II",
    description:
      "Integration techniques, applications of integration, sequences, series, and parametric equations.",
    isActive: true,
  },
  {
    courseCode: "MATH301",
    name: "Linear Algebra",
    description:
      "Vector spaces, matrices, determinants, eigenvalues, eigenvectors, and applications.",
    isActive: true,
  },
  {
    courseCode: "MATH401",
    name: "Discrete Mathematics",
    description:
      "Logic, sets, functions, relations, combinatorics, graph theory, and number theory.",
    isActive: true,
  },
  {
    courseCode: "PHYS101",
    name: "Physics I: Mechanics",
    description:
      "Classical mechanics including kinematics, Newton's laws, energy, momentum, and rotational motion.",
    isActive: true,
  },
  {
    courseCode: "PHYS201",
    name: "Physics II: Electricity and Magnetism",
    description:
      "Electric fields, magnetic fields, circuits, electromagnetic induction, and Maxwell's equations.",
    isActive: true,
  },
  {
    courseCode: "ENG101",
    name: "English Composition",
    description:
      "Writing and critical thinking skills with emphasis on essay writing, research, and academic discourse.",
    isActive: true,
  },
  {
    courseCode: "ENG201",
    name: "Technical Writing",
    description:
      "Professional and technical communication including reports, proposals, and documentation.",
    isActive: true,
  },
  {
    courseCode: "CHEM101",
    name: "General Chemistry I",
    description:
      "Atomic structure, periodic table, chemical bonding, stoichiometry, and thermochemistry.",
    isActive: true,
  },
  {
    courseCode: "CHEM201",
    name: "Organic Chemistry",
    description:
      "Structure, properties, and reactions of organic compounds including hydrocarbons and functional groups.",
    isActive: true,
  },
  {
    courseCode: "BIO101",
    name: "Introduction to Biology",
    description:
      "Cell biology, genetics, evolution, ecology, and diversity of life.",
    isActive: true,
  },
  {
    courseCode: "BIO201",
    name: "Molecular Biology",
    description:
      "DNA, RNA, protein synthesis, gene expression, and molecular techniques.",
    isActive: true,
  },
  {
    courseCode: "ECE101",
    name: "Introduction to Electrical Engineering",
    description:
      "Basic electrical circuits, Ohm's law, Kirchhoff's laws, and circuit analysis.",
    isActive: true,
  },
  {
    courseCode: "ECE201",
    name: "Digital Logic Design",
    description:
      "Boolean algebra, combinational and sequential logic, and digital circuit design.",
    isActive: true,
  },
  {
    courseCode: "ECE301",
    name: "Signals and Systems",
    description:
      "Continuous and discrete-time signals, Fourier analysis, and system analysis.",
    isActive: true,
  },
  {
    courseCode: "ME101",
    name: "Introduction to Mechanical Engineering",
    description:
      "Fundamentals of mechanical engineering including statics, dynamics, and materials.",
    isActive: true,
  },
  {
    courseCode: "ME201",
    name: "Thermodynamics",
    description:
      "Laws of thermodynamics, heat engines, refrigeration, and thermodynamic cycles.",
    isActive: true,
  },
  {
    courseCode: "ME301",
    name: "Fluid Mechanics",
    description:
      "Fluid statics, dynamics, Bernoulli's equation, and fluid flow analysis.",
    isActive: true,
  },
  {
    courseCode: "CE101",
    name: "Introduction to Civil Engineering",
    description:
      "Fundamentals of civil engineering including structures, materials, and design.",
    isActive: true,
  },
  {
    courseCode: "CE201",
    name: "Structural Analysis",
    description:
      "Analysis of trusses, beams, frames, and structural design principles.",
    isActive: true,
  },
  {
    courseCode: "ECON101",
    name: "Microeconomics",
    description:
      "Supply and demand, market structures, consumer behavior, and resource allocation.",
    isActive: true,
  },
  {
    courseCode: "ECON201",
    name: "Macroeconomics",
    description:
      "National income, inflation, unemployment, fiscal policy, and monetary policy.",
    isActive: true,
  },
  {
    courseCode: "MGMT101",
    name: "Principles of Management",
    description:
      "Management functions, organizational behavior, leadership, and decision-making.",
    isActive: true,
  },
  {
    courseCode: "MGMT201",
    name: "Marketing Management",
    description:
      "Marketing strategies, consumer behavior, branding, and market research.",
    isActive: true,
  },
  {
    courseCode: "ACCT101",
    name: "Financial Accounting",
    description:
      "Accounting principles, financial statements, and accounting cycle.",
    isActive: true,
  },
  {
    courseCode: "FIN101",
    name: "Corporate Finance",
    description:
      "Time value of money, capital budgeting, risk and return, and financial analysis.",
    isActive: true,
  },
  {
    courseCode: "STAT101",
    name: "Introduction to Statistics",
    description:
      "Descriptive statistics, probability, distributions, hypothesis testing, and regression.",
    isActive: true,
  },
  {
    courseCode: "STAT201",
    name: "Statistical Methods",
    description:
      "Advanced statistical techniques including ANOVA, regression analysis, and experimental design.",
    isActive: true,
  },
  {
    courseCode: "PSY101",
    name: "Introduction to Psychology",
    description:
      "Foundations of psychology including cognition, behavior, development, and mental health.",
    isActive: true,
  },
  {
    courseCode: "SOC101",
    name: "Introduction to Sociology",
    description: "Social structures, institutions, culture, and social change.",
    isActive: true,
  },
  {
    courseCode: "HIST101",
    name: "World History",
    description:
      "Major events, movements, and civilizations in world history from ancient to modern times.",
    isActive: true,
  },
  {
    courseCode: "PHIL101",
    name: "Introduction to Philosophy",
    description:
      "Fundamental philosophical questions including ethics, metaphysics, and epistemology.",
    isActive: true,
  },
  {
    courseCode: "ART101",
    name: "Art History",
    description: "Survey of Western art from ancient to contemporary periods.",
    isActive: true,
  },
  {
    courseCode: "MUS101",
    name: "Music Appreciation",
    description:
      "Introduction to classical and contemporary music, composers, and musical elements.",
    isActive: true,
  },
  {
    courseCode: "CS302",
    name: "Web Development",
    description:
      "HTML, CSS, JavaScript, and modern web frameworks for building interactive web applications.",
    isActive: true,
  },
  {
    courseCode: "CS402",
    name: "Machine Learning",
    description:
      "Supervised and unsupervised learning, neural networks, and machine learning applications.",
    isActive: true,
  },
  {
    courseCode: "CS502",
    name: "Computer Networks",
    description:
      "Network protocols, TCP/IP, routing, network security, and distributed systems.",
    isActive: true,
  },
  {
    courseCode: "CS602",
    name: "Artificial Intelligence",
    description:
      "AI techniques including search algorithms, knowledge representation, and intelligent agents.",
    isActive: true,
  },
  {
    courseCode: "CS702",
    name: "Cybersecurity",
    description:
      "Network security, cryptography, security protocols, and ethical hacking.",
    isActive: true,
  },
  {
    courseCode: "DATA101",
    name: "Introduction to Data Science",
    description:
      "Data analysis, visualization, statistical modeling, and data-driven decision making.",
    isActive: true,
  },
  {
    courseCode: "DATA201",
    name: "Big Data Analytics",
    description:
      "Hadoop, Spark, distributed computing, and large-scale data processing.",
    isActive: true,
  },
  {
    courseCode: "BUS101",
    name: "Business Communication",
    description:
      "Professional communication skills including presentations, meetings, and business writing.",
    isActive: true,
  },
  {
    courseCode: "LAW101",
    name: "Business Law",
    description:
      "Legal principles affecting business including contracts, torts, and business organizations.",
    isActive: true,
  },
  {
    courseCode: "HR101",
    name: "Human Resource Management",
    description:
      "Recruitment, training, performance management, and employee relations.",
    isActive: true,
  },
  {
    courseCode: "ENV101",
    name: "Environmental Science",
    description:
      "Ecosystems, environmental issues, sustainability, and conservation practices.",
    isActive: true,
  },
];

const seedCourses = async () => {
  try {
    console.log("🌱 Starting course seeding process...\n");

    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("Connected to MongoDB");

    // Get all faculty members
    const facultyMembers = await User.find({ role: "faculty", isActive: true });

    if (facultyMembers.length === 0) {
      console.error(
        "❌ No faculty members found. Please run seedUsers.js first."
      );
      process.exit(1);
    }

    console.log(`✅ Found ${facultyMembers.length} faculty members\n`);

    let createdCount = 0;
    let skippedCount = 0;

    for (let i = 0; i < sampleCourses.length; i++) {
      const courseData = sampleCourses[i];

      // Check if course already exists
      const existingCourse = await Course.findOne({
        courseCode: courseData.courseCode,
      });

      if (existingCourse) {
        console.log(
          `⏭️  Skipped: ${courseData.courseCode} - ${courseData.name} (already exists)`
        );
        skippedCount++;
        continue;
      }

      // Assign instructor (cycle through faculty members)
      const instructor = facultyMembers[i % facultyMembers.length];

      // Create course with instructor
      await Course.create({
        ...courseData,
        instructor: instructor._id,
      });

      console.log(
        `✅ Created: ${courseData.courseCode} - ${courseData.name} (Instructor: ${instructor.firstName} ${instructor.lastName})`
      );
      createdCount++;
    }

    console.log("\n" + "=".repeat(50));
    console.log(`📊 Summary:`);
    console.log(`   Created: ${createdCount} courses`);
    console.log(`   Skipped: ${skippedCount} courses (already exist)`);
    console.log(`   Total: ${sampleCourses.length} courses processed`);
    console.log("=".repeat(50));

    process.exit(0);
  } catch (error) {
    console.error("❌ Error seeding courses:", error.message);
    process.exit(1);
  }
};

seedCourses();
