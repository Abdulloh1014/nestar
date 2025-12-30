import { BadRequestException, Injectable, InternalServerErrorException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Member } from '../../libs/dto/member/member';
import { LoginInput, MemberInput } from '../../libs/dto/member/member.input';
import { MemberStatus } from '../../libs/enums/member.enum';
import { Message } from '../../libs/enums/common.enum';

@Injectable()
export class MemberService {

    //  @InjectModel vazifasi —
    //👉 MongoDB modelini service (yoki provider) ichiga avtomatik kiritib berish.
    // Model — ish qiladigan narsa, Promise esa o‘sha ishning natijasini kutish uchun.
    constructor(@InjectModel('Member') private readonly memberModel: Model<Member>) {}

    
     public async signup(input: MemberInput): Promise<Member> {
        // Hash Password
        try{
            const result = await this.memberModel.create(input);
            // Authentication via Token
            return result;
        } catch (err) {
             console.log('Error, Service.model:', err.message);
             throw new BadRequestException(Message.USED_MEMBER_NICK_OR_PHONE);
        }
    }


    public async login( input: LoginInput ): Promise<Member> {
          const {memberNick, memberPassword} = input;
          const response: Member = await this.memberModel
          .findOne({memberNick: memberNick})
          .select('+memberPassword')
          .exec();

          if(!response || response.memberStatus === MemberStatus.DELETE) {
            throw new InternalServerErrorException(Message.NO_MEMBER_NICK);
          } else if (response.memberStatus === MemberStatus.BLOCK) {
            throw new InternalServerErrorException(Message.BLOCKED_USER);
        }
            
        // Compare Password
        //  console.log('response:', response)
        const isMatch = memberPassword === response.memberPassword;
        if (!isMatch) throw new InternalServerErrorException(Message.WRONG_PASSWORD)
        return response;
    }

     public async updataMember(): Promise<string> {
        return 'updateMember executed!'
    }

    public async getMember(): Promise<string> {
        return 'getMember executed!'
    }


}
