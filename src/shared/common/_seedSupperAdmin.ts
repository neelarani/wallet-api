import { IAuthProvider, Role } from "@/app/modules/user/user.interface";
import { User } from "@/app/modules/user/user.model";
import { ENV } from "@/config";
import bcryptjs from "bcryptjs";

export const seedSuperAdmin = async () => {
  try {
    let supperAdmin = await User.findOne({
      email: ENV.SUPER_ADMIN_EMAIL,
    });

    if (supperAdmin) return console.log("Super Admin Exist!");

    const authProvider: IAuthProvider = {
      provider: "credentials",
      providerId: ENV.SUPER_ADMIN_EMAIL,
    };

    supperAdmin = await User.create({
      name: "Super Admin",
      role: Role.SUPER_ADMIN,
      email: ENV.SUPER_ADMIN_EMAIL,
      password: bcryptjs.hashSync(
        ENV.SUPER_ADMIN_PASSWORD,
        bcryptjs.genSaltSync(ENV.BCRYPT_SALT_ROUND)
      ),
      isVerified: true,
      auths: [authProvider],
    });

    console.log("Supper Admin has been created!");
  } catch (error) {
    console.log(error);
  }
};
