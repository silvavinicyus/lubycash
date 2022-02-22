import BaseSeeder from '@ioc:Adonis/Lucid/Seeder';
import Address from 'App/Models/Address';
import Permission from 'App/Models/Permission';
import User from 'App/Models/User';
import UserPermission from 'App/Models/UserPermission';
import { v4 as uuidV4 } from 'uuid';

export default class AdminSeeder extends BaseSeeder {
  public async run() {
    const address = new Address();

    const uuidAdmin = uuidV4();
    const uuidAdminPermission = uuidV4();

    address.city = '--';
    address.zipCode = '00000-00';
    address.state = '--';

    await address.save();

    const user = await User.create({
      email: 'admin@lubycash.com.br',
      addressId: address.id,
      password: 'admin123',
      secureId: uuidAdmin,
    });

    await user.save();

    const permission = await Permission.findBy('type', 'admin');

    const userPermission = await UserPermission.create({
      secureId: uuidAdminPermission,
      permissionId: permission?.id,
      userId: user.id,
    });

    await userPermission.save();
  }
}
