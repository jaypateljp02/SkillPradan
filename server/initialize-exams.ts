import { MemStorage } from './storage';

/**
 * Initialize exams with a rich set of questions across different skill levels and technologies
 */
export async function initializeExams(storage: MemStorage) {
  console.log("Creating skill exams and questions...");
  
  // JavaScript - Beginner Exam
  const jsBeginnerExam = await storage.createSkillExam({
    skillName: "JavaScript",
    proficiencyLevel: "beginner",
    passingScore: 70,
    timeLimit: 20,
    isActive: true,
    createdById: 1
  });
  
  // JavaScript Beginner Questions
  const jsBeginnerQuestions = [
    {
      questionText: "What is the correct way to declare a JavaScript variable?",
      questionType: "multiple_choice",
      options: ["var myVar = 10;", "variable myVar = 10;", "v myVar = 10;", "let myVar := 10;"],
      correctAnswer: "var myVar = 10;",
      explanation: "In JavaScript, variables can be declared using var, let, or const.",
      difficultyLevel: "easy",
      points: 10
    },
    {
      questionText: "Which of the following is a JavaScript data type?",
      questionType: "multiple_choice",
      options: ["integer", "boolean", "character", "decimal"],
      correctAnswer: "boolean",
      explanation: "JavaScript has several data types including boolean, string, number, object, null and undefined.",
      difficultyLevel: "easy",
      points: 10
    },
    {
      questionText: "What will be the output of console.log(2 + '2')?",
      questionType: "multiple_choice",
      options: ["4", "22", "error", "undefined"],
      correctAnswer: "22",
      explanation: "In JavaScript, when you add a number and a string, the number is converted to a string and the two strings are concatenated.",
      difficultyLevel: "easy",
      points: 10
    },
    {
      questionText: "How do you create a comment in JavaScript?",
      questionType: "multiple_choice",
      options: ["// This is a comment", "<!-- This is a comment -->", "# This is a comment", "** This is a comment **"],
      correctAnswer: "// This is a comment",
      explanation: "Single-line comments in JavaScript start with // and multi-line comments are enclosed within /* */.",
      difficultyLevel: "easy",
      points: 10
    },
    {
      questionText: "What does the typeof operator do?",
      questionType: "multiple_choice",
      options: ["Returns the data type of a variable", "Creates a new type", "Converts between types", "Checks if two variables are equal"],
      correctAnswer: "Returns the data type of a variable",
      explanation: "The typeof operator returns a string indicating the type of the operand.",
      difficultyLevel: "easy",
      points: 10
    }
  ];
  
  for (const question of jsBeginnerQuestions) {
    await storage.createExamQuestion({
      examId: jsBeginnerExam.id,
      ...question
    });
  }
  
  // JavaScript - Intermediate Exam
  const jsIntermediateExam = await storage.createSkillExam({
    skillName: "JavaScript",
    proficiencyLevel: "intermediate",
    passingScore: 75,
    timeLimit: 30,
    isActive: true,
    createdById: 1
  });
  
  // JavaScript Intermediate Questions
  const jsIntermediateQuestions = [
    {
      questionText: "What will be the output of the following code?\n\nconsole.log(typeof [])",
      questionType: "multiple_choice",
      options: ["array", "object", "list", "undefined"],
      correctAnswer: "object",
      explanation: "In JavaScript, arrays are actually objects, so typeof [] returns 'object'.",
      difficultyLevel: "medium",
      points: 15
    },
    {
      questionText: "Which method is used to add one or more elements to the end of an array and returns the new length of the array?",
      questionType: "multiple_choice",
      options: ["push()", "append()", "add()", "concat()"],
      correctAnswer: "push()",
      explanation: "The push() method adds one or more elements to the end of an array and returns the new length of the array.",
      difficultyLevel: "medium",
      points: 15
    },
    {
      questionText: "What is the correct way to write a promise in JavaScript?",
      questionType: "multiple_choice",
      options: [
        "new Promise(resolve, reject) => { }", 
        "new Promise((resolve, reject) => { })", 
        "Promise((resolve, reject) => { })", 
        "Promise.new((resolve, reject) => { })"
      ],
      correctAnswer: "new Promise((resolve, reject) => { })",
      explanation: "A Promise in JavaScript is created using the new Promise constructor, which takes a function with resolve and reject parameters.",
      difficultyLevel: "medium",
      points: 15
    },
    {
      questionText: "What is the purpose of the 'async' keyword in JavaScript?",
      questionType: "multiple_choice",
      options: [
        "It defines a function that returns a Promise", 
        "It makes a function run in a separate thread", 
        "It prevents a function from being called more than once", 
        "It automatically catches errors in a function"
      ],
      correctAnswer: "It defines a function that returns a Promise",
      explanation: "The async keyword before a function makes the function return a Promise and allows the use of await inside it.",
      difficultyLevel: "medium",
      points: 15
    },
    {
      questionText: "What is closure in JavaScript?",
      questionType: "multiple_choice",
      options: [
        "A way to end a function execution", 
        "A built-in method to close browser windows", 
        "A function that has access to variables from its outer function even after the outer function has finished executing", 
        "A design pattern to prevent memory leaks"
      ],
      correctAnswer: "A function that has access to variables from its outer function even after the outer function has finished executing",
      explanation: "A closure in JavaScript is a function that has access to its own scope, the outer function's variables, and global variables.",
      difficultyLevel: "hard",
      points: 20
    }
  ];
  
  for (const question of jsIntermediateQuestions) {
    await storage.createExamQuestion({
      examId: jsIntermediateExam.id,
      ...question
    });
  }
  
  // JavaScript - Advanced Exam
  const jsAdvancedExam = await storage.createSkillExam({
    skillName: "JavaScript",
    proficiencyLevel: "advanced",
    passingScore: 80,
    timeLimit: 45,
    isActive: true,
    createdById: 1
  });
  
  // JavaScript Advanced Questions
  const jsAdvancedQuestions = [
    {
      questionText: "What is the output of the following code?\n\nlet a = {x: 1};\nlet b = {x: 1};\nconsole.log(a === b);",
      questionType: "multiple_choice",
      options: ["true", "false", "undefined", "1"],
      correctAnswer: "false",
      explanation: "In JavaScript, when comparing objects with ===, it checks if they reference the same object in memory, not if they have the same content.",
      difficultyLevel: "hard",
      points: 20
    },
    {
      questionText: "What does the 'prototype' property in JavaScript allow you to do?",
      questionType: "multiple_choice",
      options: [
        "Create a new instance of an object", 
        "Define a blueprint for creating objects", 
        "Add properties and methods to all instances of an object type", 
        "Restrict access to object properties"
      ],
      correctAnswer: "Add properties and methods to all instances of an object type",
      explanation: "The prototype property allows you to add properties and methods to all instances of a particular object type.",
      difficultyLevel: "hard",
      points: 20
    },
    {
      questionText: "What is event delegation in JavaScript?",
      questionType: "multiple_choice",
      options: [
        "Assigning events to parent elements which then cascade to child elements", 
        "Using setTimeout to delay event execution", 
        "Using a library like jQuery to handle events", 
        "Creating custom events"
      ],
      correctAnswer: "Assigning events to parent elements which then cascade to child elements",
      explanation: "Event delegation is a technique where instead of adding an event listener to each child element, the event listener is added to a parent element and events that occur on descendants bubble up to be handled.",
      difficultyLevel: "hard",
      points: 20
    }
  ];
  
  for (const question of jsAdvancedQuestions) {
    await storage.createExamQuestion({
      examId: jsAdvancedExam.id,
      ...question
    });
  }
  
  // Python - Beginner Exam
  const pythonBeginnerExam = await storage.createSkillExam({
    skillName: "Python",
    proficiencyLevel: "beginner",
    passingScore: 70,
    timeLimit: 20,
    isActive: true,
    createdById: 1
  });
  
  // Python Beginner Questions
  const pythonBeginnerQuestions = [
    {
      questionText: "What is the correct way to declare a variable in Python?",
      questionType: "multiple_choice",
      options: ["var x = 5", "x := 5", "x = 5", "let x = 5"],
      correctAnswer: "x = 5",
      explanation: "In Python, variables are declared by simply assigning a value with the = operator.",
      difficultyLevel: "easy",
      points: 10
    },
    {
      questionText: "Which of the following is used for comments in Python?",
      questionType: "multiple_choice",
      options: ["//", "/* */", "#", "<!-- -->"],
      correctAnswer: "#",
      explanation: "In Python, single-line comments start with the # symbol.",
      difficultyLevel: "easy",
      points: 10
    },
    {
      questionText: "What will be the output of print(2 + 2)?",
      questionType: "multiple_choice",
      options: ["4", "22", "Error", "None"],
      correctAnswer: "4",
      explanation: "The + operator performs arithmetic addition on numbers in Python.",
      difficultyLevel: "easy",
      points: 10
    },
    {
      questionText: "How do you create a list in Python?",
      questionType: "multiple_choice",
      options: ["array[1, 2, 3]", "{1, 2, 3}", "[1, 2, 3]", "list(1, 2, 3)"],
      correctAnswer: "[1, 2, 3]",
      explanation: "Lists in Python are created using square brackets [].",
      difficultyLevel: "easy",
      points: 10
    },
    {
      questionText: "Which of the following is used to define a block of code in Python?",
      questionType: "multiple_choice",
      options: ["Curly braces {}", "Parentheses ()", "Indentation", "Square brackets []"],
      correctAnswer: "Indentation",
      explanation: "Python uses indentation to define blocks of code instead of braces.",
      difficultyLevel: "easy",
      points: 10
    }
  ];
  
  for (const question of pythonBeginnerQuestions) {
    await storage.createExamQuestion({
      examId: pythonBeginnerExam.id,
      ...question
    });
  }
  
  // Python - Intermediate Exam
  const pythonIntermediateExam = await storage.createSkillExam({
    skillName: "Python",
    proficiencyLevel: "intermediate",
    passingScore: 75,
    timeLimit: 30,
    isActive: true,
    createdById: 1
  });
  
  // Python Intermediate Questions
  const pythonIntermediateQuestions = [
    {
      questionText: "What is the output of the following code?\n\ndef func(a, b=5, c=10):\n    print(a, b, c)\n\nfunc(3, 7)",
      questionType: "multiple_choice",
      options: ["3 7 10", "3 5 10", "3 5 7", "Error"],
      correctAnswer: "3 7 10",
      explanation: "In this function call, a=3 and b=7, while c takes its default value of 10.",
      difficultyLevel: "medium",
      points: 15
    },
    {
      questionText: "What is a decorator in Python?",
      questionType: "multiple_choice",
      options: [
        "A design pattern in Python", 
        "A function that takes another function and extends its behavior without explicitly modifying it", 
        "A class used for data visualization", 
        "A built-in Python method for enhancing strings"
      ],
      correctAnswer: "A function that takes another function and extends its behavior without explicitly modifying it",
      explanation: "Decorators are a powerful feature in Python that allow you to modify the behavior of a function or class without directly changing its source code.",
      difficultyLevel: "medium",
      points: 15
    },
    {
      questionText: "What will the following code output?\n\nmy_list = [1, 2, 3, 4, 5]\nprint(my_list[1:4])",
      questionType: "multiple_choice",
      options: ["[1, 2, 3, 4]", "[2, 3, 4]", "[1, 2, 3]", "[2, 3, 4, 5]"],
      correctAnswer: "[2, 3, 4]",
      explanation: "In slicing, the first index is inclusive and the second index is exclusive. So my_list[1:4] returns elements from index 1 to 3.",
      difficultyLevel: "medium",
      points: 15
    }
  ];
  
  for (const question of pythonIntermediateQuestions) {
    await storage.createExamQuestion({
      examId: pythonIntermediateExam.id,
      ...question
    });
  }
  
  // React - Beginner Exam
  const reactBeginnerExam = await storage.createSkillExam({
    skillName: "React",
    proficiencyLevel: "beginner",
    passingScore: 70,
    timeLimit: 25,
    isActive: true,
    createdById: 1
  });
  
  // React Beginner Questions
  const reactBeginnerQuestions = [
    {
      questionText: "What is JSX in React?",
      questionType: "multiple_choice",
      options: [
        "A JavaScript library", 
        "A syntax extension for JavaScript that looks similar to HTML", 
        "A database for React applications", 
        "A testing framework for React"
      ],
      correctAnswer: "A syntax extension for JavaScript that looks similar to HTML",
      explanation: "JSX is a syntax extension for JavaScript recommended by React. It resembles HTML and makes it easier to write and add HTML in React.",
      difficultyLevel: "easy",
      points: 10
    },
    {
      questionText: "How do you create a functional component in React?",
      questionType: "multiple_choice",
      options: [
        "function MyComponent() { return <div>Hello</div>; }", 
        "class MyComponent { render() { return <div>Hello</div>; } }", 
        "const MyComponent = () => <div>Hello</div>;", 
        "Both A and C are correct"
      ],
      correctAnswer: "Both A and C are correct",
      explanation: "Functional components in React can be written using either regular function syntax or arrow function syntax.",
      difficultyLevel: "easy",
      points: 10
    },
    {
      questionText: "What hook is used to manage state in a functional component?",
      questionType: "multiple_choice",
      options: ["useEffect()", "useState()", "useContext()", "useReducer()"],
      correctAnswer: "useState()",
      explanation: "The useState hook is used to add state management to functional components in React.",
      difficultyLevel: "easy",
      points: 10
    },
    {
      questionText: "What is the Virtual DOM in React?",
      questionType: "multiple_choice",
      options: [
        "A copy of the real DOM that React uses to optimize rendering", 
        "A special browser feature for React applications", 
        "A database for storing component data", 
        "A library for animations in React"
      ],
      correctAnswer: "A copy of the real DOM that React uses to optimize rendering",
      explanation: "The Virtual DOM is a lightweight copy of the real DOM that React uses to improve performance by minimizing direct manipulation of the DOM.",
      difficultyLevel: "easy",
      points: 10
    }
  ];
  
  for (const question of reactBeginnerQuestions) {
    await storage.createExamQuestion({
      examId: reactBeginnerExam.id,
      ...question
    });
  }
  
  // SQL - Intermediate Exam
  const sqlIntermediateExam = await storage.createSkillExam({
    skillName: "SQL",
    proficiencyLevel: "intermediate",
    passingScore: 75,
    timeLimit: 30,
    isActive: true,
    createdById: 1
  });
  
  // SQL Intermediate Questions
  const sqlIntermediateQuestions = [
    {
      questionText: "Which SQL statement is used to retrieve unique values from a column?",
      questionType: "multiple_choice",
      options: [
        "SELECT DISTINCT", 
        "SELECT UNIQUE", 
        "SELECT DIFFERENT", 
        "SELECT ONLY"
      ],
      correctAnswer: "SELECT DISTINCT",
      explanation: "The DISTINCT keyword is used in a SELECT statement to return only unique (different) values.",
      difficultyLevel: "medium",
      points: 15
    },
    {
      questionText: "What is the purpose of the JOIN clause in SQL?",
      questionType: "multiple_choice",
      options: [
        "To combine rows from two or more tables based on a related column", 
        "To combine columns from two or more tables", 
        "To filter data in a single table", 
        "To sort data in ascending or descending order"
      ],
      correctAnswer: "To combine rows from two or more tables based on a related column",
      explanation: "JOIN clauses are used to combine rows from two or more tables based on a related column between them.",
      difficultyLevel: "medium",
      points: 15
    },
    {
      questionText: "What does the HAVING clause do in SQL?",
      questionType: "multiple_choice",
      options: [
        "Filters records after grouping", 
        "Filters records before grouping", 
        "Sorts records in ascending order", 
        "Limits the number of records returned"
      ],
      correctAnswer: "Filters records after grouping",
      explanation: "The HAVING clause filters records after they have been grouped by the GROUP BY clause, while the WHERE clause filters records before they are grouped.",
      difficultyLevel: "medium",
      points: 15
    }
  ];
  
  for (const question of sqlIntermediateQuestions) {
    await storage.createExamQuestion({
      examId: sqlIntermediateExam.id,
      ...question
    });
  }
  
  console.log("Created multiple skill exams with questions");
}