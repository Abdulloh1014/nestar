import { Injectable } from '@nestjs/common';
import * as bcrypt from 'bcryptjs'

@Injectable()
export class AuthService {
    public async hashPassword(memebrPassword: string): Promise<string> {
        const salt = await bcrypt.genSalt();
        return await bcrypt.hash(memebrPassword, salt);
    }

    public async comparePassword(password: string, hashedPassword: string): Promise<boolean> {
        return await bcrypt.compare(password, hashedPassword);
    }
}
