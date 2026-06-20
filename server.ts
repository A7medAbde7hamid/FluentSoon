import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { initDB, getAll, saveRow, deleteRow } from './server/db.ts';

async function startServer() {
  // Initialize relational tables
  await initDB();

  const app = express();
  const PORT = 3000;

  // Support payload body parsing
  app.use(express.json());

  // 1. Users CRUD
  app.get('/api/users', async (req, res) => {
    try {
      res.json(await getAll('users'));
    } catch (err) {
      res.status(500).json({ error: (err as Error).message });
    }
  });
  app.post('/api/users', async (req, res) => {
    const user = req.body;
    if (!user.id) {
      return res.status(400).json({ error: 'Missing user id' });
    }
    try {
      const saved = await saveRow('users', user);
      res.json(saved);
    } catch (err) {
      res.status(500).json({ error: (err as Error).message });
    }
  });
  app.delete('/api/users/:id', async (req, res) => {
    try {
      const deleted = await deleteRow('users', req.params.id);
      res.json({ success: deleted });
    } catch (err) {
      res.status(500).json({ error: (err as Error).message });
    }
  });

  // 2. Teams CRUD
  app.get('/api/teams', async (req, res) => {
    try {
      res.json(await getAll('teams'));
    } catch (err) {
      res.status(500).json({ error: (err as Error).message });
    }
  });
  app.post('/api/teams', async (req, res) => {
    const team = req.body;
    if (!team.id) {
      return res.status(400).json({ error: 'Missing team id' });
    }
    try {
      const saved = await saveRow('teams', team);
      res.json(saved);
    } catch (err) {
      res.status(500).json({ error: (err as Error).message });
    }
  });
  app.delete('/api/teams/:id', async (req, res) => {
    try {
      const deleted = await deleteRow('teams', req.params.id);
      res.json({ success: deleted });
    } catch (err) {
      res.status(500).json({ error: (err as Error).message });
    }
  });

  // 3. Companies CRUD
  app.get('/api/companies', async (req, res) => {
    try {
      res.json(await getAll('companies'));
    } catch (err) {
      res.status(500).json({ error: (err as Error).message });
    }
  });
  app.post('/api/companies', async (req, res) => {
    const company = req.body;
    if (!company.id) {
      return res.status(400).json({ error: 'Missing company id' });
    }
    try {
      const saved = await saveRow('companies', company);
      res.json(saved);
    } catch (err) {
      res.status(500).json({ error: (err as Error).message });
    }
  });
  app.delete('/api/companies/:id', async (req, res) => {
    try {
      const deleted = await deleteRow('companies', req.params.id);
      res.json({ success: deleted });
    } catch (err) {
      res.status(500).json({ error: (err as Error).message });
    }
  });

  // 4. Offers CRUD
  app.get('/api/offers', async (req, res) => {
    try {
      res.json(await getAll('offers'));
    } catch (err) {
      res.status(500).json({ error: (err as Error).message });
    }
  });
  app.post('/api/offers', async (req, res) => {
    const offer = req.body;
    if (!offer.id) {
      return res.status(400).json({ error: 'Missing offer id' });
    }
    try {
      const saved = await saveRow('offers', offer);
      res.json(saved);
    } catch (err) {
      res.status(500).json({ error: (err as Error).message });
    }
  });
  app.delete('/api/offers/:id', async (req, res) => {
    try {
      const deleted = await deleteRow('offers', req.params.id);
      res.json({ success: deleted });
    } catch (err) {
      res.status(500).json({ error: (err as Error).message });
    }
  });

  // 5. Candidates CRUD
  app.get('/api/candidates', async (req, res) => {
    try {
      res.json(await getAll('candidates'));
    } catch (err) {
      res.status(500).json({ error: (err as Error).message });
    }
  });
  app.post('/api/candidates', async (req, res) => {
    const candidate = req.body;
    if (!candidate.id) {
      return res.status(400).json({ error: 'Missing candidate id' });
    }
    try {
      const saved = await saveRow('candidates', candidate);
      res.json(saved);
    } catch (err) {
      res.status(500).json({ error: (err as Error).message });
    }
  });
  app.delete('/api/candidates/:id', async (req, res) => {
    try {
      const deleted = await deleteRow('candidates', req.params.id);
      res.json({ success: deleted });
    } catch (err) {
      res.status(500).json({ error: (err as Error).message });
    }
  });

  // 6. Courses CRUD
  app.get('/api/courses', async (req, res) => {
    try {
      res.json(await getAll('courses'));
    } catch (err) {
      res.status(500).json({ error: (err as Error).message });
    }
  });
  app.post('/api/courses', async (req, res) => {
    const course = req.body;
    if (!course.id) {
      return res.status(400).json({ error: 'Missing course id' });
    }
    try {
      const saved = await saveRow('courses', course);
      res.json(saved);
    } catch (err) {
      res.status(500).json({ error: (err as Error).message });
    }
  });
  app.delete('/api/courses/:id', async (req, res) => {
    try {
      const deleted = await deleteRow('courses', req.params.id);
      res.json({ success: deleted });
    } catch (err) {
      res.status(500).json({ error: (err as Error).message });
    }
  });

  // 7. Course Students CRUD
  app.get('/api/course_students', async (req, res) => {
    try {
      res.json(await getAll('course_students'));
    } catch (err) {
      res.status(500).json({ error: (err as Error).message });
    }
  });
  app.post('/api/course_students', async (req, res) => {
    const student = req.body;
    if (!student.id) {
      return res.status(400).json({ error: 'Missing course student id' });
    }
    try {
      const saved = await saveRow('course_students', student);
      res.json(saved);
    } catch (err) {
      res.status(500).json({ error: (err as Error).message });
    }
  });
  app.delete('/api/course_students/:id', async (req, res) => {
    try {
      const deleted = await deleteRow('course_students', req.params.id);
      res.json({ success: deleted });
    } catch (err) {
      res.status(500).json({ error: (err as Error).message });
    }
  });

  // 8. Notifications CRUD
  app.get('/api/notifications', async (req, res) => {
    try {
      res.json(await getAll('notifications'));
    } catch (err) {
      res.status(500).json({ error: (err as Error).message });
    }
  });
  app.post('/api/notifications', async (req, res) => {
    const notification = req.body;
    if (!notification.id) {
      return res.status(400).json({ error: 'Missing notification id' });
    }
    try {
      const saved = await saveRow('notifications', notification);
      res.json(saved);
    } catch (err) {
      res.status(500).json({ error: (err as Error).message });
    }
  });
  app.delete('/api/notifications/:id', async (req, res) => {
    try {
      const deleted = await deleteRow('notifications', req.params.id);
      res.json({ success: deleted });
    } catch (err) {
      res.status(500).json({ error: (err as Error).message });
    }
  });

  // 9. Activity Logs CRUD
  app.get('/api/activity_logs', async (req, res) => {
    try {
      res.json(await getAll('activity_logs'));
    } catch (err) {
      res.status(500).json({ error: (err as Error).message });
    }
  });
  app.post('/api/activity_logs', async (req, res) => {
    const log = req.body;
    if (!log.id) {
      return res.status(400).json({ error: 'Missing activity log id' });
    }
    try {
      const saved = await saveRow('activity_logs', log);
      res.json(saved);
    } catch (err) {
      res.status(500).json({ error: (err as Error).message });
    }
  });
  app.delete('/api/activity_logs/:id', async (req, res) => {
    try {
      const deleted = await deleteRow('activity_logs', req.params.id);
      res.json({ success: deleted });
    } catch (err) {
      res.status(500).json({ error: (err as Error).message });
    }
  });

  // 10. Recruiter F1 Requests CRUD
  app.get('/api/recruiter_f1_requests', async (req, res) => {
    try {
      res.json(await getAll('recruiter_f1_requests'));
    } catch (err) {
      res.status(500).json({ error: (err as Error).message });
    }
  });
  app.post('/api/recruiter_f1_requests', async (req, res) => {
    const fileRequest = req.body;
    if (!fileRequest.id) {
      return res.status(400).json({ error: 'Missing recruiter form request id' });
    }
    try {
      const saved = await saveRow('recruiter_f1_requests', fileRequest);
      res.json(saved);
    } catch (err) {
      res.status(500).json({ error: (err as Error).message });
    }
  });
  app.delete('/api/recruiter_f1_requests/:id', async (req, res) => {
    try {
      const deleted = await deleteRow('recruiter_f1_requests', req.params.id);
      res.json({ success: deleted });
    } catch (err) {
      res.status(500).json({ error: (err as Error).message });
    }
  });

  // Vite development middleware vs Static Production bundle
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[Full-Stack API Server] Running and ready on http://0.0.0.0:${PORT}`);
  });
}

startServer();
