/**
 * Script de migración: sincroniza los document IDs de usuarios_staff
 * con los UIDs reales de Firebase Auth.
 *
 * Uso:  npx ts-node scripts/migrate-staff-uids.ts
 */
import admin from 'firebase-admin';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirnamePath = dirname(__filename);

// Inicializar Firebase Admin
const serviceAccount = JSON.parse(
    readFileSync(resolve(__dirnamePath, '../serviceAccountKey.json'), 'utf8')
);

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount as admin.ServiceAccount)
});

const db = admin.firestore();

async function migrate() {
    console.log('🔄 Iniciando migración de UIDs...\n');

    const snapshot = await db.collection('usuarios_staff').get();
    let migrated = 0;
    let skipped = 0;
    let errors = 0;

    for (const docSnap of snapshot.docs) {
        const data = docSnap.data();
        const email = data['email'];
        const currentDocId = docSnap.id;

        console.log(`📋 Procesando: ${email} (doc ID actual: ${currentDocId})`);

        try {
            const authUser = await admin.auth().getUserByEmail(email);
            const realUid = authUser.uid;

            if (currentDocId === realUid) {
                console.log(`   ✅ Ya sincronizado\n`);
                skipped++;
                continue;
            }

            // Crear nuevo doc con UID real
            await db.collection('usuarios_staff').doc(realUid).set({
                ...data,
                uid: realUid
            });

            // Eliminar doc viejo
            await db.collection('usuarios_staff').doc(currentDocId).delete();

            console.log(`   ✅ Migrado: ${currentDocId} → ${realUid}\n`);
            migrated++;
        } catch (err: any) {
            if (err.code === 'auth/user-not-found') {
                console.log(`   ⚠️  No existe en Auth — saltando\n`);
            } else {
                console.error(`   ❌ Error: ${err.message}\n`);
            }
            errors++;
        }
    }

    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(`✅ Migrados: ${migrated}`);
    console.log(`⏭  Ya sincronizados: ${skipped}`);
    console.log(`⚠️  Errores/saltados: ${errors}`);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

    process.exit(0);
}

migrate().catch(err => {
    console.error('Error fatal:', err);
    process.exit(1);
});
