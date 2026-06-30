import { getSimulatedQuestions } from "./api/_utils.js";

interface DomainTest {
  name: string;
  allowedKeywords: string[];
  forbiddenKeywords: string[];
  customTopic?: string;
  isMCQ?: boolean;
}

const domainsToTest: DomainTest[] = [
  {
    name: "Java",
    allowedKeywords: ["java", "oop", "collections", "multithreading", "exception", "jdbc", "spring", "jvm", "memory", "patterns"],
    forbiddenKeywords: ["aws", "s3", "ec2", "devops", "kubernetes", "docker", "aptitude", "profit", "clock", "train", "system design", "scalability", "load balancer"]
  },
  {
    name: "Python",
    allowedKeywords: ["python", "oop", "decorator", "generator", "comprehension", "numpy", "pandas", "flask", "django", "exception"],
    forbiddenKeywords: ["java", "jvm", "spring", "devops", "kubernetes", "docker", "aptitude", "profit", "clock", "train", "aws", "s3", "ec2"]
  },
  {
    name: "DevOps",
    allowedKeywords: ["ci/cd", "jenkins", "docker", "kubernetes", "terraform", "git", "linux", "monitoring", "ansible", "infrastructure as code"],
    forbiddenKeywords: ["java", "jvm", "spring", "python", "decorator", "aptitude", "profit", "clock", "train"]
  },
  {
    name: "AWS",
    allowedKeywords: ["ec2", "s3", "vpc", "iam", "rds", "route 53", "elb", "auto scaling", "lambda", "cloudwatch"],
    forbiddenKeywords: ["gcp", "azure", "docker", "kubernetes", "jenkins", "terraform", "ansible", "java", "python", "aptitude", "profit"]
  },
  {
    name: "Cloud Computing",
    allowedKeywords: ["iaas", "paas", "saas", "virtualization", "public cloud", "private cloud", "hybrid cloud", "security", "architecture"],
    forbiddenKeywords: ["java", "jvm", "python", "decorator", "git", "aptitude", "profit", "clock", "train"]
  },
  {
    name: "AI/ML",
    allowedKeywords: ["learning", "cnn", "rnn", "nlp", "llm", "gradient", "overfitting", "feature", "evaluation"],
    forbiddenKeywords: ["java", "spring", "aws", "devops", "docker", "kubernetes", "aptitude", "profit", "clock", "train"]
  },
  {
    name: "Aptitude",
    allowedKeywords: [],
    forbiddenKeywords: ["system design", "scalability", "load balancer", "production systems", "software architecture", "security permissions", "engineering questions", "kubernetes", "docker", "aws", "s3", "ec2"],
    isMCQ: true
  },
  {
    name: "STAR Behavioral",
    allowedKeywords: ["challenge", "conflict", "leadership", "failure", "learned", "star"],
    forbiddenKeywords: ["system design", "scalability", "load balancer", "java", "python", "aws", "devops", "docker", "kubernetes", "rds", "s3", "ec2"]
  },
  {
    name: "System Design",
    allowedKeywords: ["scalability", "load balancer", "database", "caching", "cap theorem", "microservice", "message queue", "api gateway", "monitoring", "high availability"],
    forbiddenKeywords: ["jvm", "garbage collector", "decorator", "generator", "checked exception", "unchecked exception", "aptitude", "profit", "clock"]
  },
  {
    name: "Custom",
    customTopic: "Solidity Smart Contract Security",
    allowedKeywords: ["solidity", "contract", "security"],
    forbiddenKeywords: ["java", "python", "aws", "devops", "aptitude", "profit", "clock"]
  }
];

console.log("=========================================");
console.log("RUNNING AUTOMATED DOMAIN ISOLATION TESTS");
console.log("=========================================\n");

let allPassed = true;

for (const test of domainsToTest) {
  console.log(`Testing Domain: ${test.name}...`);
  const domainName = test.name;
  const questions = getSimulatedQuestions(
    domainName,
    "Software Engineer",
    "Medium",
    "Standard",
    test.customTopic || "",
    5
  );

  let domainPassed = true;

  for (const q of questions) {
    const textLower = q.text.toLowerCase();

    // 1. Verify absolutely no forbidden keyword mixing
    for (const forbidden of test.forbiddenKeywords) {
      if (textLower.includes(forbidden.toLowerCase())) {
        console.error(`  ❌ FAIL: Question "${q.text}" contains forbidden keyword/concept "${forbidden}"`);
        domainPassed = false;
        allPassed = false;
      }
    }

    // 2. If MCQ is required, verify presence of A), B), C), D) options
    if (test.isMCQ) {
      const hasA = textLower.includes("a)");
      const hasB = textLower.includes("b)");
      const hasC = textLower.includes("c)");
      const hasD = textLower.includes("d)");
      if (!hasA || !hasB || !hasC || !hasD) {
        console.error(`  ❌ FAIL: Aptitude question "${q.text}" is missing MCQ options A), B), C), D)`);
        domainPassed = false;
        allPassed = false;
      }
    }
  }

  if (domainPassed) {
    console.log(`  ✅ PASS: Strict isolation verified (No mixing).`);
  } else {
    console.error(`  ❌ FAIL: Domain ${test.name} did not meet strict isolation guidelines.`);
  }
  console.log("");
}

if (allPassed) {
  console.log("=========================================");
  console.log("🎉 ALL TESTS PASSED SUCCESSFULLY! No domain mixing found.");
  console.log("=========================================");
  process.exit(0);
} else {
  console.error("=========================================");
  console.error("❌ TESTS FAILED: Domain mixing or formatting issue detected.");
  console.error("=========================================");
  process.exit(1);
}
