import admin from "firebase-admin";
import { getApps, initializeApp } from "firebase-admin/app";

// make sure to add env value in apps/nextjs
// Refer to apps/nextjs/.env.example
const serviceAccount = JSON.parse(process.env.AUTH_ADMIN_SERVICE_KEY as string);

if (!getApps().length)
  initializeApp({ credential: admin.credential.cert(serviceAccount) });

const adminAuth = admin.auth();

export { adminAuth };
