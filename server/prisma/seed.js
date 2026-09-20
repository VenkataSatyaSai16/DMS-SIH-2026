import prisma from "../src/config/db.js";

const permissions = [
  ["CASE_CREATE", "CASE", "CREATE"],
  ["CASE_VIEW", "CASE", "VIEW"],
  ["CASE_MODIFY", "CASE", "MODIFY"],
  ["CASE_ASSIGN", "CASE", "ASSIGN"],
  ["CASE_CLOSE", "CASE", "CLOSE"],

  ["DATA_VIEW", "DATA", "VIEW"],
  ["DATA_MODIFY", "DATA", "MODIFY"],
  ["DATA_DOWNLOAD", "DATA", "DOWNLOAD"],

  ["EVIDENCE_UPLOAD", "EVIDENCE", "UPLOAD"],
  ["EVIDENCE_VIEW", "EVIDENCE", "VIEW"],
  ["EVIDENCE_MODIFY", "EVIDENCE", "MODIFY"],
  ["EVIDENCE_VERIFY", "EVIDENCE", "VERIFY"],
  ["EVIDENCE_DOWNLOAD", "EVIDENCE", "DOWNLOAD"],

  ["FORENSIC_DATA_VIEW", "FORENSIC_DATA", "VIEW"],
  ["FORENSIC_DATA_MODIFY", "FORENSIC_DATA", "MODIFY"],

  ["CYBER_DATA_VIEW", "CYBER_DATA", "VIEW"],
  ["CYBER_DATA_MODIFY", "CYBER_DATA", "MODIFY"],

  ["UNIT_CREATE", "ORGANIZATION_UNIT", "CREATE"],
  ["UNIT_MODIFY", "ORGANIZATION_UNIT", "MODIFY"],
  ["UNIT_DEACTIVATE", "ORGANIZATION_UNIT", "DEACTIVATE"],
  ["UNIT_ACTIVATE", "ORGANIZATION_UNIT", "ACTIVATE"],
  ["UNIT_VIEW", "ORGANIZATION_UNIT", "VIEW"],

  ["USER_CREATE", "USER", "CREATE"],
  ["USER_MODIFY", "USER", "MODIFY"],
  ["USER_DEACTIVATE", "USER", "DEACTIVATE"],
  ["USER_ASSIGN_UNIT", "USER", "ASSIGN_UNIT"],
  ["USER_VIEW", "USER", "VIEW"],

  ["ROLE_CREATE", "ROLE", "CREATE"],
  ["ROLE_MODIFY", "ROLE", "MODIFY"],
  ["ROLE_DEACTIVATE", "ROLE", "DEACTIVATE"],
  ["ROLE_ASSIGN", "ROLE", "ASSIGN"],
  ["ROLE_VIEW", "ROLE", "VIEW"],

  ["PERMISSION_MANAGE", "PERMISSION", "MANAGE"],

  ["ACCESS_REQUEST_CREATE", "ACCESS_REQUEST", "CREATE"],
  ["ACCESS_REQUEST_APPROVE", "ACCESS_REQUEST", "APPROVE"],
  ["ACCESS_REQUEST_REJECT", "ACCESS_REQUEST", "REJECT"],

  ["AUDIT_VIEW", "AUDIT", "VIEW"],
];
const roles = {
  SYSTEM_ADMINISTRATOR: [
    "CASE_CREATE",
    "CASE_VIEW",
    "CASE_MODIFY",
    "CASE_ASSIGN",
    "CASE_CLOSE",

    "DATA_VIEW",
    "DATA_MODIFY",
    "DATA_DOWNLOAD",

    "EVIDENCE_UPLOAD",
    "EVIDENCE_VIEW",
    "EVIDENCE_MODIFY",
    "EVIDENCE_VERIFY",
    "EVIDENCE_DOWNLOAD",

    "FORENSIC_DATA_VIEW",
    "FORENSIC_DATA_MODIFY",

    "CYBER_DATA_VIEW",
    "CYBER_DATA_MODIFY",

    "UNIT_CREATE",
    "UNIT_MODIFY",
    "UNIT_DEACTIVATE",
    "UNIT_ACTIVATE",
    "UNIT_VIEW",

    "USER_CREATE",
    "USER_MODIFY",
    "USER_DEACTIVATE",
    "USER_ASSIGN_UNIT",
    "USER_VIEW",

    "ROLE_CREATE",
    "ROLE_MODIFY",
    "ROLE_DEACTIVATE",
    "ROLE_ASSIGN",
    "ROLE_VIEW",

    "PERMISSION_MANAGE",

    "ACCESS_REQUEST_CREATE",
    "ACCESS_REQUEST_APPROVE",
    "ACCESS_REQUEST_REJECT",

    "AUDIT_VIEW",
  ],

  INVESTIGATOR: [
    "CASE_CREATE",
    "CASE_VIEW",
    "CASE_MODIFY",
    "CASE_ASSIGN",

    "DATA_VIEW",
    "DATA_MODIFY",
    "DATA_DOWNLOAD",

    "EVIDENCE_UPLOAD",
    "EVIDENCE_VIEW",
    "EVIDENCE_DOWNLOAD",

    "ACCESS_REQUEST_CREATE",
  ],

  INVESTIGATION_SUPERVISOR: [
    "CASE_CREATE",
    "CASE_VIEW",
    "CASE_MODIFY",
    "CASE_ASSIGN",
    "CASE_CLOSE",

    "UNIT_DEACTIVATE",
    "UNIT_ACTIVATE",
    "UNIT_VIEW",

    "DATA_VIEW",
    "DATA_MODIFY",
    "DATA_DOWNLOAD",

    "EVIDENCE_VIEW",
    "EVIDENCE_DOWNLOAD",

    "ACCESS_REQUEST_APPROVE",
    "ACCESS_REQUEST_REJECT",

    "AUDIT_VIEW",
  ],

  FIELD_INSPECTOR: [
    "CASE_VIEW",
    "DATA_VIEW",
    "DATA_MODIFY",

    "EVIDENCE_UPLOAD",
    "EVIDENCE_VIEW",

    "ACCESS_REQUEST_CREATE",
  ],

  EVIDENCE_OFFICER: [
    "CASE_VIEW",

    "DATA_VIEW",

    "EVIDENCE_UPLOAD",
    "EVIDENCE_VIEW",
    "EVIDENCE_MODIFY",
    "EVIDENCE_VERIFY",
    "EVIDENCE_DOWNLOAD",
  ],

  FORENSIC_ANALYST: [
    "CASE_VIEW",

    "DATA_VIEW",

    "FORENSIC_DATA_VIEW",
    "FORENSIC_DATA_MODIFY",

    "EVIDENCE_VIEW",
    "EVIDENCE_VERIFY",
    "EVIDENCE_DOWNLOAD",

    "ACCESS_REQUEST_CREATE",
  ],

  CYBER_ANALYST: [
    "CASE_VIEW",

    "DATA_VIEW",

    "CYBER_DATA_VIEW",
    "CYBER_DATA_MODIFY",

    "EVIDENCE_VIEW",
    "EVIDENCE_VERIFY",
    "EVIDENCE_DOWNLOAD",

    "ACCESS_REQUEST_CREATE",
  ],

  COURT_OFFICER: [
    "CASE_VIEW",

    "DATA_VIEW",
    "DATA_DOWNLOAD",

    "EVIDENCE_VIEW",
    "EVIDENCE_VERIFY",
    "EVIDENCE_DOWNLOAD",
  ],

  READ_ONLY_OFFICER: [
    "CASE_VIEW",
    "DATA_VIEW",
    "DATA_DOWNLOAD",

    "EVIDENCE_VIEW",
  ],
};

async function main() {
  // Seed permissions
  for (const [name, resource, action] of permissions) {
    await prisma.permission.upsert({
      where: { name: name },
      update: {
        isActive: true,
      },
      create: {
        name: name,
        resource: resource || "SYSTEM",
        action: action || name,
        isActive: true,
      },
    });
  }

  // Seed roles and assign permissions
  for (const [roleName, rolePermissions] of Object.entries(roles)) {
    const role = await prisma.role.upsert({
      where: {
        name: roleName,
      },
      update: {},
      create: {
        name: roleName,
      },
    });

    for (const permissionName of rolePermissions) {
      const permission = await prisma.permission.findUnique({
        where: {
          name: permissionName,
        },
      });

      if (!permission) {
        throw new Error(`Permission not found: ${permissionName}`);
      }

      await prisma.rolePermission.upsert({
        where: {
          roleId_permissionId: {
            roleId: role.id,
            permissionId: permission.id,
          },
        },
        update: {},
        create: {
          roleId: role.id,
          permissionId: permission.id,
        },
      });
    }
  }

  console.log("Permissions and roles seeded successfully.");
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
