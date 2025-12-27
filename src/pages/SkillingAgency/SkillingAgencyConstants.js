
export const myCourses = [
  {
    "id": "f136f094-3a6d-43cf-ab6c-58749b5b4706",
    "courseName": "Advance Java",
    "prerequisiteSkills": [
      { name: "Data types and Variables", mandatory: true, exp: 8 },
      { name: "Control System", mandatory: false, exp: 12 },
      { name: "Basic Algorithms", mandatory: true, exp: 9 },
      { name: "Command-line Navigation", mandatory: true, exp: 14 },
      { name: "Debugging Techniques", mandatory: false, exp: 5 },
      { name: "spring", mandatory: false, exp: 5, exclude: true }
    ],
    "courseDetails": {
      "description": "This course covers advanced topics in Java programming, focusing on in-depth understanding and practical application.",
      "topics": [
        {
          "name": "Advanced Java Concepts",
          "duration": 4,
          "phase": "Weeks"
        },
        {
          "name": "Database Connectivity with JDBC",
          "duration": 3,
          "phase": "Weeks"
        },
        {
          "name": "Multithreading and Concurrency",
          "duration": 2,
          "phase": "Weeks"
        },
        {
          "name": "JavaServer Faces (JSF)",
          "duration": 3,
          "phase": "Weeks"
        },
        {
          "name": "Spring Framework",
          "duration": 4,
          "phase": "Weeks"
        }
      ]
    },

    "createdAt": "2023-12-02"
  },
  {
    "id": "adc2e29f-5dfa-4119-b1b5-df244a566570",
    "courseName": "Web Development",
    "prerequisiteSkills": [
      { name: "HTML/CSS", mandatory: true, exp: 4 },
      { name: "Javascript", mandatory: true, exp: 7 },
      { name: "Responsive Design", mandatory: true, exp: 5 },
      { name: "Git", mandatory: false, exp: 11 },
      { name: "Restful APIs", mandatory: false, exp: 4 },
      { name: "DOM", mandatory: true, exp: 3 },
      { name: "django", mandatory: false, exp: 5, exclude: true },
      { name: "spring", mandatory: false, exp: 5, exclude: true }
    ],

    "courseDetails": {
      "description": "Learn the essentials of web development, including front-end and back-end technologies.",
      "topics": [
        {
          "name": "HTML/CSS Basics",
          "duration": 2,
          "phase": "Weeks"
        },
        {
          "name": "JavaScript Fundamentals",
          "duration": 3,
          "phase": "Weeks"
        },
        {
          "name": "Responsive Design Principles",
          "duration": 2,
          "phase": "Weeks"
        },
        {
          "name": "Version Control with Git",
          "duration": 2,
          "phase": "Weeks"
        },
        {
          "name": "Introduction to Restful APIs",
          "duration": 2,
          "phase": "Weeks"
        },
        {
          "name": "DOM Manipulation",
          "duration": 2,
          "phase": "Weeks"
        }
        // Add more topics as needed
      ]
    },


    "createdAt": "2023-11-22"
  },
  {
    "id": "63bb4242-79e6-4d2d-8d30-587cc79ab8c1",
    "courseName": "Advance Python ",
    "prerequisiteSkills": [
      { name: "Basic Python", mandatory: true, exp: 3 },
      { name: "Data Structures", mandatory: true, exp: 5 },
      { name: "OOPS", mandatory: true, exp: 4 },
      { name: "Basic Algorithms", mandatory: false, exp: 3 },
      { name: "Debugging Python", mandatory: true, exp: 12 },
      { name: "Git", mandatory: false, exp: 3, exclude: true }
    ],
    "courseDetails": {
      "description": "Explore advanced concepts in Python programming and enhance your problem-solving skills.",
      "topics": [
        {
          "name": "Advanced Python Features",
          "duration": 3,
          "phase": "Weeks"
        },
        {
          "name": "Advanced Data Structures",
          "duration": 2,
          "phase": "Weeks"
        },
        {
          "name": "Object-Oriented Programming in Python",
          "duration": 2,
          "phase": "Weeks"
        },
        {
          "name": "Advanced Algorithms",
          "duration": 3,
          "phase": "Weeks"
        },
        {
          "name": "Effective Debugging Techniques",
          "duration": 2,
          "phase": "Weeks"
        },
        {
          "name": "Version Control with Git",
          "duration": 2,
          "phase": "Weeks"
        }
        // Add more topics as needed
      ]
    },
    "createdAt": "2023-11-12"
  },
  {
    "id": "63c5fd50-6487-4298-8314-e086cd8d682c",
    "courseName": "Data Science ",
    "prerequisiteSkills": [
      { "name": "Python", "mandatory": true, "exp": 4 },
      { "name": "Data Manipulation Libraries", "mandatory": false, "exp": 6 },
      { "name": "Statistical Concepts", "mandatory": true, "exp": 9 },
      { "name": "Data Visualization Skills", "mandatory": false, "exp": 2 },
      { "name": "Machine Learning Libraries", "mandatory": false, "exp": 10 },
      { "name": "Jupyter Notebooks", "mandatory": true, "exp": 3 },
      { name: "OOPS", mandatory: true, exp: 4, exclude: true },
    ],
    "courseDetails": {
      "description": "Dive into the world of data science and learn the skills needed to analyze and interpret complex data sets.",
      "topics": [
        {
          "name": "Introduction to Data Science",
          "duration": 2,
          "phase": "Weeks"
        },
        {
          "name": "Data Manipulation and Cleaning",
          "duration": 3,
          "phase": "Weeks"
        },
        {
          "name": "Statistical Analysis",
          "duration": 3,
          "phase": "Weeks"
        },
        {
          "name": "Data Visualization Techniques",
          "duration": 2,
          "phase": "Weeks"
        },
        {
          "name": "Machine Learning Fundamentals",
          "duration": 4,
          "phase": "Weeks"
        },
        {
          "name": "Exploratory Data Analysis with Jupyter Notebooks",
          "duration": 2,
          "phase": "Weeks"
        }
        // Add more topics as needed
      ]
    },
    "createdAt": "2023-11-02"
  },
  {
    "id": "63c5fd50-6487-4298-8314-e086cd8d682z",
    "courseName": "Data Science ",
    "prerequisiteSkills": [
      { "name": "Python", "mandatory": true, "exp": 4 },
      { "name": "Data Manipulation Libraries", "mandatory": false, "exp": 6 },
      { "name": "Statistical Concepts", "mandatory": true, "exp": 9 },
      { "name": "Data Visualization Skills", "mandatory": false, "exp": 2 },
      { "name": "Machine Learning Libraries", "mandatory": false, "exp": 10 },
      { "name": "Jupyter Notebooks", "mandatory": true, "exp": 3 },
      { name: "OOPS", mandatory: true, exp: 4, exclude: true },
    ],
    "courseDetails": {
      "description": "Dive into the world of data science and learn the skills needed to analyze and interpret complex data sets.",
      "topics": [
        {
          "name": "Introduction to Data Science",
          "duration": 2,
          "phase": "Weeks"
        },
        {
          "name": "Data Manipulation and Cleaning",
          "duration": 3,
          "phase": "Weeks"
        },
        {
          "name": "Statistical Analysis",
          "duration": 3,
          "phase": "Weeks"
        },
        {
          "name": "Data Visualization Techniques",
          "duration": 2,
          "phase": "Weeks"
        },
        {
          "name": "Machine Learning Fundamentals",
          "duration": 4,
          "phase": "Weeks"
        },
        {
          "name": "Exploratory Data Analysis with Jupyter Notebooks",
          "duration": 2,
          "phase": "Weeks"
        }
        // Add more topics as needed
      ]
    },
    "createdAt": "2023-11-02"
  },
  {
    "id": "63c5fd50-6487-4298-8314-e086cd8d682f",
    "courseName": "Data Science ",
    "prerequisiteSkills": [
      { "name": "Python", "mandatory": true, "exp": 4 },
      { "name": "Data Manipulation Libraries", "mandatory": false, "exp": 6 },
      { "name": "Statistical Concepts", "mandatory": true, "exp": 9 },
      { "name": "Data Visualization Skills", "mandatory": false, "exp": 2 },
      { "name": "Machine Learning Libraries", "mandatory": false, "exp": 10 },
      { "name": "Jupyter Notebooks", "mandatory": true, "exp": 3 },
      { name: "OOPS", mandatory: true, exp: 4, exclude: true },
    ],
    "courseDetails": {
      "description": "Dive into the world of data science and learn the skills needed to analyze and interpret complex data sets.",
      "topics": [
        {
          "name": "Introduction to Data Science",
          "duration": 2,
          "phase": "Weeks"
        },
        {
          "name": "Data Manipulation and Cleaning",
          "duration": 3,
          "phase": "Weeks"
        },
        {
          "name": "Statistical Analysis",
          "duration": 3,
          "phase": "Weeks"
        },
        {
          "name": "Data Visualization Techniques",
          "duration": 2,
          "phase": "Weeks"
        },
        {
          "name": "Machine Learning Fundamentals",
          "duration": 4,
          "phase": "Weeks"
        },
        {
          "name": "Exploratory Data Analysis with Jupyter Notebooks",
          "duration": 2,
          "phase": "Weeks"
        }
        // Add more topics as needed
      ]
    },
    "createdAt": "2023-11-02"
  },
  {
    "id": "63c5fd50-6487-4298-8314-e086cd8d682f",
    "courseName": "Data Science ",
    "prerequisiteSkills": [
      { "name": "Python", "mandatory": true, "exp": 4 },
      { "name": "Data Manipulation Libraries", "mandatory": false, "exp": 6 },
      { "name": "Statistical Concepts", "mandatory": true, "exp": 9 },
      { "name": "Data Visualization Skills", "mandatory": false, "exp": 2 },
      { "name": "Machine Learning Libraries", "mandatory": false, "exp": 10 },
      { "name": "Jupyter Notebooks", "mandatory": true, "exp": 3 },
      { name: "OOPS", mandatory: true, exp: 4, exclude: true },
    ],
    "courseDetails": {
      "description": "Dive into the world of data science and learn the skills needed to analyze and interpret complex data sets.",
      "topics": [
        {
          "name": "Introduction to Data Science",
          "duration": 2,
          "phase": "Weeks"
        },
        {
          "name": "Data Manipulation and Cleaning",
          "duration": 3,
          "phase": "Weeks"
        },
        {
          "name": "Statistical Analysis",
          "duration": 3,
          "phase": "Weeks"
        },
        {
          "name": "Data Visualization Techniques",
          "duration": 2,
          "phase": "Weeks"
        },
        {
          "name": "Machine Learning Fundamentals",
          "duration": 4,
          "phase": "Weeks"
        },
        {
          "name": "Exploratory Data Analysis with Jupyter Notebooks",
          "duration": 2,
          "phase": "Weeks"
        }
        // Add more topics as needed
      ]
    },
    "createdAt": "2023-11-02"
  },
  {
    "id": "63c5fd50-6487-4298-8314-e086cd8d682f",
    "courseName": "Data Science ",
    "prerequisiteSkills": [
      { "name": "Python", "mandatory": true, "exp": 4 },
      { "name": "Data Manipulation Libraries", "mandatory": false, "exp": 6 },
      { "name": "Statistical Concepts", "mandatory": true, "exp": 9 },
      { "name": "Data Visualization Skills", "mandatory": false, "exp": 2 },
      { "name": "Machine Learning Libraries", "mandatory": false, "exp": 10 },
      { "name": "Jupyter Notebooks", "mandatory": true, "exp": 3 },
      { name: "OOPS", mandatory: true, exp: 4, exclude: true },
    ],
    "courseDetails": {
      "description": "Dive into the world of data science and learn the skills needed to analyze and interpret complex data sets.",
      "topics": [
        {
          "name": "Introduction to Data Science",
          "duration": 2,
          "phase": "Weeks"
        },
        {
          "name": "Data Manipulation and Cleaning",
          "duration": 3,
          "phase": "Weeks"
        },
        {
          "name": "Statistical Analysis",
          "duration": 3,
          "phase": "Weeks"
        },
        {
          "name": "Data Visualization Techniques",
          "duration": 2,
          "phase": "Weeks"
        },
        {
          "name": "Machine Learning Fundamentals",
          "duration": 4,
          "phase": "Weeks"
        },
        {
          "name": "Exploratory Data Analysis with Jupyter Notebooks",
          "duration": 2,
          "phase": "Weeks"
        }
        // Add more topics as needed
      ]
    },
    "createdAt": "2023-11-02"
  },

]






// export const allCourses =

//   [
//     {
//       "id": "5fb8c945-00a2-4b3a-9d8d-3c5b78b5212a",
//       "courseName": "Advance Java",
//       "prerequisiteSkills": [
//         { "name": "Data types and Variables", "mandatory": false, "exp": 0 },
//         { "name": "Control System", "mandatory": false, "exp": 0 },
//         { "name": "Basic Algorithms", "mandatory": false, "exp": 0 },
//         { "name": "Command-line Navigation", "mandatory": false, "exp": 0 },
//         { "name": "Debugging Techniques", "mandatory": false, "exp": 0 },
//         { "name": "spring", "mandatory": false, "exp": 0 }
//       ]
//     },
//     {
//       "id": "156db9b1-54fb-4c36-b68a-3c42c82204c0",
//       "courseName": "Web Development",
//       "prerequisiteSkills": [
//         { "name": "HTML/CSS", "mandatory": false, "exp": 0 },
//         { "name": "Javascript", "mandatory": false, "exp": 0 },
//         { "name": "Responsive Design", "mandatory": false, "exp": 0 },
//         { "name": "Git", "mandatory": false, "exp": 0 },
//         { "name": "Restful APIs", "mandatory": false, "exp": 0 },
//         { "name": "DOM", "mandatory": false, "exp": 0 },
//         { "name": "django", "mandatory": false, "exp": 0, "exclude": true },
//         { "name": "spring", "mandatory": false, "exp": 0, "exclude": true }
//       ]
//     },
//     {
//       "id": "0b8f58f9-d6a5-4c62-a6e7-704d75a6a4a5",
//       "courseName": "Advance Python",
//       "prerequisiteSkills": [
//         { "name": "Basic Python", "mandatory": false, "exp": 0 },
//         { "name": "Data Structures", "mandatory": false, "exp": 0 },
//         { "name": "OOPS", "mandatory": false, "exp": 0 },
//         { "name": "Basic Algorithms", "mandatory": false, "exp": 0 },
//         { "name": "Debugging Python", "mandatory": false, "exp": 0 },
//         { "name": "Git", "mandatory": false, "exp": 0 }
//       ]
//     },
//     {
//       "id": "cb16d738-fa86-4edf-a56f-63e96e1f4853",
//       "courseName": "Data Science",
//       "prerequisiteSkills": [
//         { "name": "Python", "mandatory": false, "exp": 0 },
//         { "name": "Data Manipulation Libraries", "mandatory": false, "exp": 0 },
//         { "name": "Statistical Concepts", "mandatory": false, "exp": 0 },
//         { "name": "Data Visualization Skills", "mandatory": false, "exp": 0 },
//         { "name": "Machine Learning Libraries", "mandatory": false, "exp": 0 },
//         { "name": "Jupyter Notebooks", "mandatory": false, "exp": 0 }
//       ]
//     },
//     {
//       "id": "6ef4c9a2-9a2a-4a79-9443-5a27d6c717f3",
//       "courseName": "Cybersecurity",
//       "prerequisiteSkills": [
//         { "name": "Fundamentals and Protocols", "mandatory": false, "exp": 0 },
//         { "name": "Operating System", "mandatory": false, "exp": 0 },
//         { "name": "Scripting Skills", "mandatory": false, "exp": 0 },
//         { "name": "Security Tools", "mandatory": false, "exp": 0 },
//         { "name": "Encryption Algorithms", "mandatory": false, "exp": 0 },
//         { "name": "Penetration Testing", "mandatory": false, "exp": 0 }
//       ]
//     },
//     {
//       "id": "f2c70b2b-56a0-4a6d-bdbd-5d73c7207393",
//       "courseName": "App Development",
//       "prerequisiteSkills": [
//         { "name": "Java", "mandatory": false, "exp": 0 },
//         { "name": "Mobile App Architecture", "mandatory": false, "exp": 0 },
//         { "name": "Frameworks", "mandatory": false, "exp": 0 },
//         { "name": "Git", "mandatory": false, "exp": 0 },
//         { "name": "UI/UX Design", "mandatory": false, "exp": 0 },
//         { "name": "Profiling", "mandatory": false, "exp": 0 }
//       ]
//     },
//     {
//       "id": "79d9aee7-6c12-43d4-b9ac-2606c6701a9c",
//       "courseName": "Machine Learning",
//       "prerequisiteSkills": [
//         { "name": "Python", "mandatory": false, "exp": 0 },
//         { "name": "Linear Algebra", "mandatory": false, "exp": 0 },
//         { "name": "Probability", "mandatory": false, "exp": 0 },
//         { "name": "Data Preprocessing", "mandatory": false, "exp": 0 },
//         { "name": "Validation Techniques", "mandatory": false, "exp": 0 },
//         { "name": "Neural Networks Learning", "mandatory": false, "exp": 0 }
//       ]
//     },
//     {
//       "id": "64b2d00b-91a3-4b7e-86c3-d78412c437a9",
//       "courseName": "Cloud Computing",
//       "prerequisiteSkills": [
//         { "name": "Cloud Environments", "mandatory": false, "exp": 0 },
//         { "name": "Virtualization", "mandatory": false, "exp": 0 },
//         { "name": "Cloud Service", "mandatory": false, "exp": 0 },
//         { "name": "Code (IaC) Tools", "mandatory": false, "exp": 0 },
//         { "name": "Containerization Tools", "mandatory": false, "exp": 0 },
//         { "name": "Containerization Tools", "mandatory": false, "exp": 0 }
//       ]
//     },

//     {
//       "id": "3a4d1c25-6aa5-48e1-9f86-264d9b6d3eef",
//       "courseName": "Advance DB",
//       "prerequisiteSkills": [
//         { "name": "SQL", "mandatory": false, "exp": 0 },
//         { "name": "Relational Database", "mandatory": false, "exp": 0 },
//         { "name": "Data Modeling Skills", "mandatory": false, "exp": 0 },
//         { "name": "Management Systems", "mandatory": false, "exp": 0 },
//         { "name": "NoSQL Databases", "mandatory": false, "exp": 0 },
//         { "name": "Optimization Skills", "mandatory": false, "exp": 0 }
//       ]
//     },


//   ]




export const allCourses = [
  {
    "id": "f136f094-3a6d-43cf-ab6c-58749b5b4706",
    "courseName": "Advance Java",
    "prerequisiteSkills": [
      { name: "Data types and Variables", mandatory: true, exp: 8 },
      { name: "Control System", mandatory: false, exp: 12 },
      { name: "Basic Algorithms", mandatory: true, exp: 9 },
      { name: "Command-line Navigation", mandatory: true, exp: 14 },
      { name: "Debugging Techniques", mandatory: false, exp: 5 },
      { name: "spring", mandatory: false, exp: 5, exclude: true }
    ],
    "courseDetails": {
      "description": "This course covers advanced topics in Java programming, focusing on in-depth understanding and practical application.",
      "topics": [
        {
          "name": "Advanced Java Concepts",
          "duration": 4,
          "phase": "Weeks"
        },
        {
          "name": "Database Connectivity with JDBC",
          "duration": 3,
          "phase": "Weeks"
        },
        {
          "name": "Multithreading and Concurrency",
          "duration": 2,
          "phase": "Weeks"
        },
        {
          "name": "JavaServer Faces (JSF)",
          "duration": 3,
          "phase": "Weeks"
        },
        {
          "name": "Spring Framework",
          "duration": 4,
          "phase": "Weeks"
        }
      ]
    },
    "createdAt": "2023-12-02"
  },
  {
    "id": "5fb8c945-00a2-4b3a-9d8d-3c5b78b5212a",
    "courseName": "Web Development",
    "prerequisiteSkills": [
      { "name": "HTML/CSS", "mandatory": false, "exp": 0 },
      { "name": "Javascript", "mandatory": false, "exp": 0 },
      { "name": "Responsive Design", "mandatory": false, "exp": 0 },
      { "name": "Git", "mandatory": false, "exp": 0 },
      { "name": "Restful APIs", "mandatory": false, "exp": 0 },
      { "name": "DOM", "mandatory": false, "exp": 0 },
      { "name": "django", "mandatory": false, "exp": 0, "exclude": true },
      { "name": "spring", "mandatory": false, "exp": 0, "exclude": true }
    ],
    "courseDetails": {
      "description": "This course focuses on web development technologies, covering HTML, CSS, JavaScript, and other related topics.",
      "topics": [
        {
          "name": "HTML/CSS Basics",
          "duration": 2,
          "phase": "Weeks"
        },
        {
          "name": "Javascript Fundamentals",
          "duration": 3,
          "phase": "Weeks"
        },
        {
          "name": "Responsive Design Principles",
          "duration": 2,
          "phase": "Weeks"
        },
        {
          "name": "Version Control with Git",
          "duration": 2,
          "phase": "Weeks"
        },
        {
          "name": "Introduction to Restful APIs",
          "duration": 2,
          "phase": "Weeks"
        }
      ]
    }
  },
  {
    "id": "0b8f58f9-d6a5-4c62-a6e7-704d75a6a4a5",
    "courseName": "Advance Python",
    "prerequisiteSkills": [
      { "name": "Basic Python", "mandatory": false, "exp": 0 },
      { "name": "Data Structures", "mandatory": false, "exp": 0 },
      { "name": "OOPS", "mandatory": false, "exp": 0 },
      { "name": "Basic Algorithms", "mandatory": false, "exp": 0 },
      { "name": "Debugging Python", "mandatory": false, "exp": 0 },
      { "name": "Git", "mandatory": false, "exp": 0 }
    ],
    "courseDetails": {
      "description": "This course delves into advanced Python programming concepts, covering data structures, object-oriented programming, and more.",
      "topics": [
        {
          "name": "Advanced Python Features",
          "duration": 3,
          "phase": "Weeks"
        },
        {
          "name": "Data Structures and Algorithms in Python",
          "duration": 4,
          "phase": "Weeks"
        },
        {
          "name": "Object-Oriented Programming in Python",
          "duration": 3,
          "phase": "Weeks"
        }
      ]
    }
  },

  {
    "id": "cb16d738-fa86-4edf-a56f-63e96e1f4853",
    "courseName": "Data Science",
    "prerequisiteSkills": [
      { "name": "Python", "mandatory": false, "exp": 0 },
      { "name": "Data Manipulation Libraries", "mandatory": false, "exp": 0 },
      { "name": "Statistical Concepts", "mandatory": false, "exp": 0 },
      { "name": "Data Visualization Skills", "mandatory": false, "exp": 0 },
      { "name": "Machine Learning Libraries", "mandatory": false, "exp": 0 },
      { "name": "Jupyter Notebooks", "mandatory": false, "exp": 0 }
    ],
    "courseDetails": {
      "description": "This course explores the field of data science, covering Python for data manipulation, statistical concepts, and machine learning techniques.",
      "topics": [
        {
          "name": "Introduction to Data Science",
          "duration": 2,
          "phase": "Weeks"
        },
        {
          "name": "Data Manipulation and Analysis with Python",
          "duration": 3,
          "phase": "Weeks"
        },
        {
          "name": "Statistical Concepts in Data Science",
          "duration": 2,
          "phase": "Weeks"
        },
        {
          "name": "Data Visualization Techniques",
          "duration": 3,
          "phase": "Weeks"
        },
        {
          "name": "Machine Learning Fundamentals",
          "duration": 4,
          "phase": "Weeks"
        }
      ]
    }
  },
  {
    "id": "6ef4c9a2-9a2a-4a79-9443-5a27d6c717f3",
    "courseName": "Cybersecurity",
    "prerequisiteSkills": [
      { "name": "Fundamentals and Protocols", "mandatory": false, "exp": 0 },
      { "name": "Operating System", "mandatory": false, "exp": 0 },
      { "name": "Scripting Skills", "mandatory": false, "exp": 0 },
      { "name": "Security Tools", "mandatory": false, "exp": 0 },
      { "name": "Encryption Algorithms", "mandatory": false, "exp": 0 },
      { "name": "Penetration Testing", "mandatory": false, "exp": 0 }
    ],
    "courseDetails": {
      "description": "This course covers cybersecurity fundamentals, protocols, and practical skills for securing computer systems.",
      "topics": [
        {
          "name": "Cybersecurity Fundamentals",
          "duration": 3,
          "phase": "Weeks"
        },
        {
          "name": "Operating System Security",
          "duration": 2,
          "phase": "Weeks"
        },
        {
          "name": "Scripting for Cybersecurity",
          "duration": 2,
          "phase": "Weeks"
        },
        {
          "name": "Introduction to Security Tools",
          "duration": 3,
          "phase": "Weeks"
        },
        {
          "name": "Encryption Algorithms and Techniques",
          "duration": 3,
          "phase": "Weeks"
        },
        {
          "name": "Penetration Testing Practices",
          "duration": 3,
          "phase": "Weeks"
        }
      ]
    }
  },


  {
    "id": "f2c70b2b-56a0-4a6d-bdbd-5d73c7207393",
    "courseName": "App Development",
    "prerequisiteSkills": [
      { "name": "Java", "mandatory": false, "exp": 0 },
      { "name": "Mobile App Architecture", "mandatory": false, "exp": 0 },
      { "name": "Frameworks", "mandatory": false, "exp": 0 },
      { "name": "Git", "mandatory": false, "exp": 0 },
      { "name": "UI/UX Design", "mandatory": false, "exp": 0 },
      { "name": "Profiling", "mandatory": false, "exp": 0 }
    ],
    "courseDetails": {
      "description": "This course focuses on mobile app development, covering Java, mobile app architecture, and UI/UX design principles.",
      "topics": [
        {
          "name": "Java for Mobile App Development",
          "duration": 2,
          "phase": "Weeks"
        },
        {
          "name": "Mobile App Architecture and Frameworks",
          "duration": 3,
          "phase": "Weeks"
        },
        {
          "name": "Version Control with Git",
          "duration": 2,
          "phase": "Weeks"
        },
        {
          "name": "UI/UX Design Principles",
          "duration": 3,
          "phase": "Weeks"
        },
        {
          "name": "App Profiling and Optimization",
          "duration": 2,
          "phase": "Weeks"
        }
      ]
    }
  },
  {
    "id": "79d9aee7-6c12-43d4-b9ac-2606c6701a9c",
    "courseName": "Machine Learning",
    "prerequisiteSkills": [
      { "name": "Python", "mandatory": false, "exp": 0 },
      { "name": "Linear Algebra", "mandatory": false, "exp": 0 },
      { "name": "Probability", "mandatory": false, "exp": 0 },
      { "name": "Data Preprocessing", "mandatory": false, "exp": 0 },
      { "name": "Validation Techniques", "mandatory": false, "exp": 0 },
      { "name": "Neural Networks Learning", "mandatory": false, "exp": 0 }
    ],
    "courseDetails": {
      "description": "This course delves into machine learning concepts, covering Python, linear algebra, probability, and neural networks.",
      "topics": [
        {
          "name": "Foundations of Machine Learning",
          "duration": 3,
          "phase": "Weeks"
        },
        {
          "name": "Mathematics for Machine Learning",
          "duration": 4,
          "phase": "Weeks"
        },
        {
          "name": "Data Preprocessing and Validation",
          "duration": 3,
          "phase": "Weeks"
        },
        {
          "name": "Neural Networks and Deep Learning",
          "duration": 4,
          "phase": "Weeks"
        }
      ]
    }
  },
  {
    "id": "64b2d00b-91a3-4b7e-86c3-d78412c437a9",
    "courseName": "Cloud Computing",
    "prerequisiteSkills": [
      { "name": "Cloud Environments", "mandatory": false, "exp": 0 },
      { "name": "Virtualization", "mandatory": false, "exp": 0 },
      { "name": "Cloud Service", "mandatory": false, "exp": 0 },
      { "name": "Code (IaC) Tools", "mandatory": false, "exp": 0 },
      { "name": "Containerization Tools", "mandatory": false, "exp": 0 }
    ],
    "courseDetails": {
      "description": "This course explores cloud computing concepts, covering cloud environments, virtualization, and containerization.",
      "topics": [
        {
          "name": "Introduction to Cloud Computing",
          "duration": 3,
          "phase": "Weeks"
        },
        {
          "name": "Virtualization and Cloud Services",
          "duration": 3,
          "phase": "Weeks"
        },
        {
          "name": "Infrastructure as Code (IaC)",
          "duration": 2,
          "phase": "Weeks"
        },
        {
          "name": "Containerization and Orchestration",
          "duration": 4,
          "phase": "Weeks"
        }
      ]
    }
  },
  // Repeat the same pattern for other courses...


  {
    "id": "3a4d1c25-6aa5-48e1-9f86-264d9b6d3eef",
    "courseName": "Advance DB",
    "prerequisiteSkills": [
      { "name": "SQL", "mandatory": false, "exp": 0 },
      { "name": "Relational Database", "mandatory": false, "exp": 0 },
      { "name": "Data Modeling Skills", "mandatory": false, "exp": 0 },
      { "name": "Management Systems", "mandatory": false, "exp": 0 },
      { "name": "NoSQL Databases", "mandatory": false, "exp": 0 },
      { "name": "Optimization Skills", "mandatory": false, "exp": 0 }
    ],
    "courseDetails": {
      "description": "This course covers advanced topics in database management, including SQL, relational databases, and optimization techniques.",
      "topics": [
        {
          "name": "Advanced SQL Concepts",
          "duration": 3,
          "phase": "Weeks"
        },
        {
          "name": "Relational Database Design",
          "duration": 3,
          "phase": "Weeks"
        },
        {
          "name": "Data Modeling and Management",
          "duration": 2,
          "phase": "Weeks"
        },
        {
          "name": "Introduction to NoSQL Databases",
          "duration": 2,
          "phase": "Weeks"
        },
        {
          "name": "Optimization Strategies",
          "duration": 3,
          "phase": "Weeks"
        }
      ]
    }
  },
]







export const premiumServicePrices= [
  {
    "country": "US",
    "currency": "USD",
    "price": 59.9
  },
  {
    "country": "Canada",
    "currency": "CAD",
    "price": 79.99
  },
  {
    "country": "UK",
    "currency": "GBP",
    "price": 44.99
  },
  {
    "country": "Germany",
    "currency": "EUR",
    "price": 54.99
  },
  {
    "country": "Japan",
    "currency": "JPY",
    "price": 6499.99
  },
  {
    "country": "Australia",
    "currency": "AUD",
    "price": 89.99
  },
  {
    "country": "India",
    "currency": "INR",
    "price": 3999.99
  },
  {
    "country": "Brazil",
    "currency": "BRL",
    "price": 299.99
  },
  {
    "country": "South Africa",
    "currency": "ZAR",
    "price": 899.99
  },
  {
    "country": "China",
    "currency": "CNY",
    "price": 389.99
  },
  {
    "country": "Russia",
    "currency": "RUB",
    "price": 4299.99
  },
  {
    "country": "Mexico",
    "currency": "MXN",
    "price": 1349.99
  },
  {
    "country": "South Korea",
    "currency": "KRW",
    "price": 69900.0
  },
  {
    "country": "Saudi Arabia",
    "currency": "SAR",
    "price": 224.99
  },
  {
    "country": "Singapore",
    "currency": "SGD",
    "price": 79.99
  },
  {
    "country": "Nigeria",
    "currency": "NGN",
    "price": 24999.99
  },
  {
    "country": "France",
    "currency": "EUR",
    "price": 54.99
  },
  {
    "country": "Italy",
    "currency": "EUR",
    "price": 54.99
  },
  {
    "country": "Spain",
    "currency": "EUR",
    "price": 54.99
  },
  {
    "country": "Portugal",
    "currency": "EUR",
    "price": 54.99
  },
  {
    "country": "Netherlands",
    "currency": "EUR",
    "price": 54.99
  },
  {
    "country": "Switzerland",
    "currency": "CHF",
    "price": 59.99
  },
  {
    "country": "Sweden",
    "currency": "SEK",
    "price": 599.99
  },
  {
    "country": "Norway",
    "currency": "NOK",
    "price": 549.99
  },
  {
    "country": "Denmark",
    "currency": "DKK",
    "price": 419.99
  },
  {
    "country": "Finland",
    "currency": "EUR",
    "price": 54.99
  },
  {
    "country": "Ireland",
    "currency": "EUR",
    "price": 54.99
  },
  {
    "country": "Austria",
    "currency": "EUR",
    "price": 54.99
  },
  {
    "country": "Belgium",
    "currency": "EUR",
    "price": 54.99
  },
  {
    "country": "Poland",
    "currency": "PLN",
    "price": 239.99
  },
  {
    "country": "Czech Republic",
    "currency": "CZK",
    "price": 1199.99
  },
  {
    "country": "Hungary",
    "currency": "HUF",
    "price": 16499.99
  },
  {
    "country": "Turkey",
    "currency": "TRY",
    "price": 299.99
  },
  {
    "country": "Greece",
    "currency": "EUR",
    "price": 54.99
  },
  {
    "country": "Argentina",
    "currency": "ARS",
    "price": 4799.99
  },
  {
    "country": "Chile",
    "currency": "CLP",
    "price": 37999.99
  },
  {
    "country": "Colombia",
    "currency": "COP",
    "price": 219999.99
  },
  {
    "country": "Peru",
    "currency": "PEN",
    "price": 209.99
  },
  {
    "country": "Egypt",
    "currency": "EGP",
    "price": 1149.99
  },
  {
    "country": "Morocco",
    "currency": "MAD",
    "price": 549.99
  },
  {
    "country": "Kenya",
    "currency": "KES",
    "price": 6499.99
  },
  {
    "country": "Vietnam",
    "currency": "VND",
    "price": 1379999.99
  },
  {
    "country": "Malaysia",
    "currency": "MYR",
    "price": 249.99
  },
  {
    "country": "Philippines",
    "currency": "PHP",
    "price": 3149.99
  }
  // Add more countries as needed
]






export const languages = [
  { value: 'English', label: 'English' },
  { value: 'Hindi', label: 'Hindi' },
  { value: 'Spanish', label: 'Spanish' },
  { value: 'French', label: 'French' },
  { value: 'German', label: 'German' },
  { value: 'Chinese', label: 'Chinese' },
  { value: 'Japanese', label: 'Japanese' },
  { value: 'Korean', label: 'Korean' },
  { value: 'Italian', label: 'Italian' },
  { value: 'Portuguese', label: 'Portuguese' },
  { value: 'Russian', label: 'Russian' },
  { value: 'Arabic', label: 'Arabic' },
  { value: 'Dutch', label: 'Dutch' },
  { value: 'Swedish', label: 'Swedish' },
  { value: 'Turkish', label: 'Turkish' },
  { value: 'Finnish', label: 'Finnish' },
  { value: 'Danish', label: 'Danish' },
  { value: 'Norwegian', label: 'Norwegian' },
  { value: 'Polish', label: 'Polish' },
  { value: 'Greek', label: 'Greek' },
  { value: 'Czech', label: 'Czech' },
];

export const myLanguages = [
  { value: 'English', label: 'English' },
  { value: 'Hindi', label: 'Hindi' },

];