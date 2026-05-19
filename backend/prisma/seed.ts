import prisma from '../src/utils/prisma';
import bcrypt from 'bcryptjs';

async function main() {
  console.log('Seeding database...');

  // 1. Seed Roles
  const roles = [
    { role_name: 'Super Admin', role_code: 'SUPER_ADMIN', description: 'Super Administrator with full access' },
    { role_name: 'Admin', role_code: 'ADMIN', description: 'Administrator with management access' },
    { role_name: 'Student', role_code: 'STUDENT', description: 'Student with learning access' },
  ];

  const seededRoles = [];
  for (const r of roles) {
    const role = await prisma.role.upsert({
      where: { role_code: r.role_code },
      update: {},
      create: r,
    });
    seededRoles.push(role);
  }

  console.log('Roles seeded:', seededRoles.map(r => r.role_name));

  // 2. Seed Permissions
  const permissions = [
    { permission_name: 'Create Lesson', permission_key: 'lesson.create', module_name: 'Lessons' },
    { permission_name: 'Edit Lesson', permission_key: 'lesson.edit', module_name: 'Lessons' },
    { permission_name: 'Delete Lesson', permission_key: 'lesson.delete', module_name: 'Lessons' },
    { permission_name: 'Publish Lesson', permission_key: 'lesson.publish', module_name: 'Lessons' },
    { permission_name: 'Create Question', permission_key: 'question.create', module_name: 'Practice' },
    { permission_name: 'Edit Question', permission_key: 'question.edit', module_name: 'Practice' },
    { permission_name: 'Create Test', permission_key: 'test.create', module_name: 'Tests' },
    { permission_name: 'Upload JSON', permission_key: 'json.upload', module_name: 'Imports' },
    { permission_name: 'View Analytics', permission_key: 'analytics.view', module_name: 'Analytics' },
  ];

  const seededPermissions = [];
  for (const p of permissions) {
    const permission = await prisma.permission.upsert({
      where: { permission_key: p.permission_key },
      update: {},
      create: p,
    });
    seededPermissions.push(permission);
  }

  console.log('Permissions seeded:', seededPermissions.map(p => p.permission_key));

  // 3. Link Permissions to Roles
  // Super Admin & Admin get all permissions
  const superAdminRole = seededRoles.find(r => r.role_code === 'SUPER_ADMIN')!;
  const adminRole = seededRoles.find(r => r.role_code === 'ADMIN')!;

  for (const p of seededPermissions) {
    await prisma.rolePermission.upsert({
      where: {
        role_id_permission_id: {
          role_id: superAdminRole.id,
          permission_id: p.id
        }
      },
      update: {},
      create: {
        role_id: superAdminRole.id,
        permission_id: p.id
      }
    });

    await prisma.rolePermission.upsert({
      where: {
        role_id_permission_id: {
          role_id: adminRole.id,
          permission_id: p.id
        }
      },
      update: {},
      create: {
        role_id: adminRole.id,
        permission_id: p.id
      }
    });
  }

  // Student gets analytics.view
  const studentRole = seededRoles.find(r => r.role_code === 'STUDENT')!;
  const viewAnalyticsPerm = seededPermissions.find(p => p.permission_key === 'analytics.view')!;

  await prisma.rolePermission.upsert({
    where: {
      role_id_permission_id: {
        role_id: studentRole.id,
        permission_id: viewAnalyticsPerm.id
      }
    },
    update: {},
    create: {
      role_id: studentRole.id,
      permission_id: viewAnalyticsPerm.id
    }
  });

  console.log('Role Permissions linked successfully.');

  // 4. Seed Default Users for Testing
  const hashedPassword = await bcrypt.hash('password123', 10);

  const superAdminUser = await prisma.user.upsert({
    where: { email: 'superadmin@learninghub.com' },
    update: {},
    create: {
      name: 'Super Admin',
      email: 'superadmin@learninghub.com',
      password: hashedPassword,
      role_id: superAdminRole.id,
      is_active: true,
    },
  });

  const adminUser = await prisma.user.upsert({
    where: { email: 'admin@learninghub.com' },
    update: {},
    create: {
      name: 'Loki Admin',
      email: 'admin@learninghub.com',
      password: hashedPassword,
      role_id: adminRole.id,
      is_active: true,
    },
  });

  console.log('Default users seeded: superadmin@learninghub.com and admin@learninghub.com');
  console.log('Database seeding completed.');
}

main()
  .catch((e) => {
    console.error(e);
    throw e;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
