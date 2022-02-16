import BaseSeeder from '@ioc:Adonis/Lucid/Seeder';
import Permission from 'App/Models/Permission';
import { v4 as uuidV4 } from 'uuid';

export default class PermissionSeeder extends BaseSeeder {
  public async run() {
    const uuidAdminPermission = uuidV4();
    const uuidClientPermission = uuidV4();

    await Permission.createMany([
      {
        secureId: uuidAdminPermission,
        type: 'admin',
      },
      {
        secureId: uuidClientPermission,
        type: 'client',
      },
    ]);
  }
}
