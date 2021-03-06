import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext';
import Database from '@ioc:Adonis/Lucid/Database';
import Address from 'App/Models/Address';
import Permission from 'App/Models/Permission';
import User from 'App/Models/User';
import UserPermission from 'App/Models/UserPermission';
import DestroyAdminValidator from 'App/Validators/Admins/DestroyAdminValidator';
import ShowAdminValidator from 'App/Validators/Admins/ShowAdminValidator';
import StoreAdminValidator from 'App/Validators/Admins/StoreAdminValidator';

export default class AdminsController {
  public async store({ request, response }: HttpContextContract) {
    await request.validate(StoreAdminValidator);

    const { email, password } = request.body();

    await Database.transaction(async (trx) => {
      const address = new Address();

      address.city = '--';
      address.zipCode = '00000-00';
      address.state = '--';

      address.useTransaction(trx);
      await address.save();

      const user = new User();

      user.email = email;
      user.password = password;
      user.addressId = address.id;

      user.useTransaction(trx);
      await user.save();

      const userPermission = new UserPermission();

      const adminPermission = await Permission.findByOrFail('type', 'admin');

      userPermission.userId = user.id;
      userPermission.permissionId = adminPermission.id;

      userPermission.useTransaction(trx);
      await userPermission.save();

      return response.created(user);
    });
  }

  public async index() {
    const allUsers = await User.query().preload('userPermissions', (permission) => {
      permission.preload('permission');
    });

    let admins: User[] = [];

    allUsers.forEach((user) => {
      for (let i = 0; i < user.userPermissions.length; i++) {
        if (user.userPermissions[i].permission.type === 'admin') {
          admins.push(user);
        }
      }
    });

    return admins;
  }

  public async show({ request, response }: HttpContextContract) {
    await request.validate(ShowAdminValidator);
    const { id } = request.params();

    const admin = await User.query()
      .where('id', id)
      .preload('userPermissions', (permissions) => {
        permissions.preload('permission');
      });

    if (admin.length <= 0) {
      return response.notFound({ message: 'There is no admin with the given id' });
    }

    return admin;
  }

  public async destroy({ request, response }: HttpContextContract) {
    await request.validate(DestroyAdminValidator);

    const { id } = request.params();

    const admin = await User.findBy('secure_id', id);

    await admin?.delete();

    return response.noContent();
  }
}
