import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';

import ws from 'ws';

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

const supabaseUrl = process.env.SUPABASE_URL || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
const adminPin = process.env.ADMIN_PIN || '1234';

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
        autoRefreshToken: false,
        persistSession: false
    },
    global: {
        fetch: (...args) => fetch(...args),
    },
    realtime: {
        transport: ws as any
    }
});

const SECTIONS_FILE = path.join(process.cwd(), 'sections.json');

// Initialize sections file if it doesn't exist
const initializeSections = () => {
    if (!fs.existsSync(SECTIONS_FILE)) {
        const defaultSections = [
            { uid: "clients", label: "Clientes" },
            { uid: "messages", label: "Mensajes" },
            { uid: "data", label: "Datos" },
            { uid: "users", label: "Usuarios" },
            { uid: "payments", label: "Pagos" },
            { uid: "post", label: "Post Avanzado" },
            { uid: "store", label: "Tienda Gestor IA" },
            { uid: "associations", label: "Asociaciones" },
            { uid: "ai_prompts", label: "Prompts IA" },
            { uid: "ai_limits", label: "Límites IA" },
            { uid: "statistics", label: "Estadísticas" },
            { uid: "red_commercial", label: "Red Comercial" },
            { uid: "ads", label: "Anuncios" },
            { uid: "chat_groups", label: "Grupos" },
            { uid: "marketplace", label: "Marketplace" }
        ].map((s, index) => ({ ...s, id: index + 1 }));
        fs.writeFileSync(SECTIONS_FILE, JSON.stringify(defaultSections, null, 2));
    }
};

initializeSections();

const getSectionsFromFile = () => {
    const data = fs.readFileSync(SECTIONS_FILE, 'utf8');
    return JSON.parse(data);
};

const saveSectionsToFile = (sections: any[]) => {
    fs.writeFileSync(SECTIONS_FILE, JSON.stringify(sections, null, 2));
};

// Middleware to verify PIN
const verifyPinMiddleware = (req: express.Request, res: express.Response, next: express.NextFunction) => {
    const pin = req.headers['x-admin-pin'];
    if (pin === adminPin) {
        next();
    } else {
        res.status(401).json({ error: 'Unauthorized: Invalid PIN' });
    }
};

app.get('/health', (req, res) => {
    res.json({ status: 'ok' });
});

// Verify PIN endpoint
app.post('/api/verify-pin', (req, res) => {
    const { pin } = req.body;
    if (pin === adminPin) {
        res.json({ success: true });
    } else {
        res.status(401).json({ success: false, error: 'PIN incorrecto' });
    }
});

// List Admins
app.get('/api/admins', verifyPinMiddleware, async (req, res) => {
    const { data: { users }, error } = await supabase.auth.admin.listUsers();
    if (error) return res.status(500).json({ error: error.message });
    const admins = users.filter(user => user.user_metadata?.role === 'admin');
    res.json(admins);
});

// Create Admin
app.post('/api/admins', verifyPinMiddleware, async (req, res) => {
    const { email, password, metadata } = req.body;
    const { data, error } = await supabase.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
        user_metadata: { ...metadata, role: 'admin' }
    });
    if (error) return res.status(400).json({ error: error.message });
    res.json(data.user);
});

// Update Admin
app.put('/api/admins/:id', verifyPinMiddleware, async (req, res) => {
    const { id } = req.params;
    const { metadata } = req.body;
    const { data, error } = await supabase.auth.admin.updateUserById(id as string, {
        user_metadata: { ...metadata, role: 'admin' }
    });
    if (error) return res.status(400).json({ error: error.message });
    res.json(data.user);
});

// Delete Admin
app.delete('/api/admins/:id', verifyPinMiddleware, async (req, res) => {
    const { id } = req.params;
    const { error } = await supabase.auth.admin.deleteUser(id as string);
    if (error) return res.status(400).json({ error: error.message });
    res.json({ success: true });
});

// Sections Management (Storing in a local JSON file)
app.get('/api/sections', verifyPinMiddleware, (req, res) => {
    try {
        res.json(getSectionsFromFile());
    } catch (error) {
        res.status(500).json({ error: 'Failed to read sections' });
    }
});

app.post('/api/sections', verifyPinMiddleware, (req, res) => {
    try {
        const newSection = req.body;
        const sections = getSectionsFromFile();
        const nextId = sections.length > 0 ? Math.max(...sections.map((s: any) => s.id)) + 1 : 1;
        const sectionWithId = { ...newSection, id: nextId };
        sections.push(sectionWithId);
        saveSectionsToFile(sections);
        res.json(sectionWithId);
    } catch (error) {
        res.status(400).json({ error: 'Failed to add section' });
    }
});

app.delete('/api/sections/:id', verifyPinMiddleware, (req, res) => {
    try {
        const { id } = req.params;
        const sections = getSectionsFromFile();
        const filtered = sections.filter((s: any) => s.id !== parseInt(id as string));
        saveSectionsToFile(filtered);
        res.json({ success: true });
    } catch (error) {
        res.status(400).json({ error: 'Failed to delete section' });
    }
});

app.listen(port, () => {
    console.log(`Backend listening at http://localhost:${port}`);
});
