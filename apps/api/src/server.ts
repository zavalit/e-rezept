/**
 * E-Rezept Demo API Server
 * Main entry point for the Fastify application
 */

import Fastify from 'fastify';
import cors from '@fastify/cors';
import { registerFHIRRoutes } from './routes/fhir.js';
import { seedDemoData } from './seed.js';

const PORT = parseInt(process.env.PORT || '3000', 10);
const HOST = process.env.HOST || '0.0.0.0';

async function main(): Promise<void> {
  const fastify = Fastify({
    logger: {
      level: 'info',
      transport: {
        target: 'pino-pretty',
        options: {
          translateTime: 'HH:MM:ss Z',
          ignore: 'pid,hostname',
        },
      },
    },
  });

  // Register CORS
  await fastify.register(cors, {
    origin: true, // Allow all origins in demo
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  });

  // Health check
  fastify.get('/health', async () => ({ status: 'ok', timestamp: new Date().toISOString() }));

  // Root endpoint
  fastify.get('/', async () => ({
    name: 'E-Rezept Demo API',
    version: '0.1.0',
    fhir: {
      version: '4.0.1',
      endpoint: '/fhir',
      metadata: '/fhir/metadata',
    },
    links: {
      patients: '/fhir/Patient',
      practitioners: '/fhir/Practitioner',
      prescriptions: '/fhir/MedicationRequest',
      bundles: '/fhir/Bundle',
    },
  }));

  // Register FHIR routes
  await registerFHIRRoutes(fastify);

  // Seed demo data
  await seedDemoData();
  fastify.log.info('Demo data seeded');

  // Start server
  try {
    await fastify.listen({ port: PORT, host: HOST });
    console.log(`
╔════════════════════════════════════════════════════════════════╗
║                    E-Rezept Demo API                           ║
╠════════════════════════════════════════════════════════════════╣
║  Server:    http://${HOST}:${PORT}                              ║
║  FHIR:      http://${HOST}:${PORT}/fhir                          ║
║  Metadata:  http://${HOST}:${PORT}/fhir/metadata                 ║
║  Health:    http://${HOST}:${PORT}/health                        ║
╚════════════════════════════════════════════════════════════════╝
    `);
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
}

main();
