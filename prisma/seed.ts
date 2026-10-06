import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding database...");
  const hash = (pw: string) => bcrypt.hashSync(pw, 10);

  await prisma.user.upsert({
    where: { email: "admin@edu.com" },
    update: {},
    create: {
      email: "admin@edu.com",
      password: hash("admin123"),
      name: "Super Admin",
      role: "ADMIN",
    },
  });

  await prisma.user.upsert({
    where: { email: "teacher@edu.com" },
    update: {},
    create: {
      email: "teacher@edu.com",
      password: hash("teacher123"),
      name: "Sarah Johnson",
      role: "TEACHER",
      teacher: {
        create: { employeeId: "T-001", subject: "Mathematics", phone: "555-0100" },
      },
    },
  });

  const students = [
    { name: "Alex Chen", email: "alex@edu.com", roll: "S-001", cls: "10", sec: "A" },
    { name: "Maya Patel", email: "maya@edu.com", roll: "S-002", cls: "10", sec: "A" },
    { name: "Liam Brown", email: "liam@edu.com", roll: "S-003", cls: "10", sec: "B" },
    { name: "Sofia Garcia", email: "sofia@edu.com", roll: "S-004", cls: "9", sec: "A" },
  ];

  for (const s of students) {
    await prisma.user.upsert({
      where: { email: s.email },
      update: {},
      create: {
        email: s.email,
        password: hash("student123"),
        name: s.name,
        role: "STUDENT",
        student: {
          create: {
            rollNumber: s.roll,
            class: s.cls,
            section: s.sec,
            dob: new Date("2008-05-15"),
            guardian: "Parent Name",
            phone: "555-0200",
          },
        },
      },
    });
  }

  const exam = await prisma.exam.create({
    data: {
      title: "Mid-Term 2025",
      subject: "Mathematics",
      class: "10",
      examDate: new Date("2025-03-15"),
      maxMarks: 100,
    },
  });

  const allStudents = await prisma.student.findMany();
  for (const [i, s] of allStudents.entries()) {
    await prisma.fee.create({
      data: {
        studentId: s.id,
        amount: 500 + i * 50,
        dueDate: new Date("2025-04-01"),
        invoiceNo: `INV-${1000 + i}`,
        status: i % 2 === 0 ? "PAID" : "PENDING",
        paidAt: i % 2 === 0 ? new Date() : null,
      },
    });

    await prisma.mark.create({
      data: {
        studentId: s.id,
        examId: exam.id,
        obtained: 60 + Math.floor(Math.random() * 35),
      },
    });
  }

  console.log("✅ Seed complete");
  console.log("   👑 admin@edu.com / admin123");
  console.log("   👨‍🏫 teacher@edu.com / teacher123");
  console.log("   🎓 alex@edu.com / student123");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
