/* eslint-disable @typescript-eslint/no-explicit-any */
import 'dotenv/config';
import mongoose from 'mongoose';
import User from '../app/models/user';

async function checkFirstUser2FA() {
  const uri = process.env.MONGODB_URI;

  if (!uri) {
    console.error('❌ Error: MONGODB_URI no está definida en las variables de entorno.');
    process.exit(1);
  }

  try {
    await mongoose.connect(uri);
    console.log('✅ Conectado a MongoDB');

    const user: any = await User.findOne({}).lean();

    if (user) {
      console.log('--------------------------------------------------');
      console.log(`👤 Usuario encontrado: ${user.email} (${user.username})`);
      console.log(`🔐 ID: ${user._id}`);
      console.log(`🛡️  2FA Habilitado (isTwoFactorEnabled): ${user.isTwoFactorEnabled}`);
      console.log(`🔑 Tiene secreto guardado: ${!!user.twoFactorSecret}`);
      console.log('--------------------------------------------------');
    } else {
      console.log('⚠️  No se encontraron usuarios en la base de datos.');
    }

  } catch (error) {
    console.error('❌ Error al consultar el usuario:', error);
  } finally {
    await mongoose.disconnect();
    console.log('👋 Desconectado de MongoDB');
    process.exit(0);
  }
}

checkFirstUser2FA();
