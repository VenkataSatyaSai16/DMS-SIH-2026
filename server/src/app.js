import express from 'express';
import cors from 'cors';
import prisma from './config/db.js';
import userRoutes from "./routes/user.routes.js";
import authRoutes from "./routes/auth.routes.js";
import caseRoutes from "./routes/case.routes.js";
import organizationUnitRoutes from "./routes/organization-unit.routes.js";
import roleRoutes from "./routes/role.routes.js";
import permissionRoutes from "./routes/permission.routes.js";
import accessRequestRoutes from "./routes/access-request.routes.js";

import fileTestRoutes from "./routes/file-test.routes.js";
import caseFileRoutes from "./routes/case-file.routes.js";
import auditLogRoutes from "./routes/audit-log.routes.js";

const app = express();

app.use(cors());
app.use(express.json());

app.use("/api/users", userRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/cases", caseRoutes);
app.use("/api/cases", caseFileRoutes);
app.use("/api/organization-units", organizationUnitRoutes);
app.use("/api/roles", roleRoutes);
app.use("/api/permissions", permissionRoutes);
app.use("/api/access-requests", accessRequestRoutes);
app.use("/api/files-test", fileTestRoutes);
app.use("/api/audit-logs", auditLogRoutes);

app.get('/api/health', (req, res) => {
    res.status(200).json({ message: 'Status OK' });
});

app.get('/api/health/db', async (req, res) => {
    try {
        await prisma.$queryRaw`SELECT 1`;

        res.status(200).json({
            message: 'Database connected successfully',
        });
    } catch (error) {
        console.error('Database connection failed:', error);

        res.status(500).json({
            message: 'Database connection failed',
        });
    }
});

export default app;