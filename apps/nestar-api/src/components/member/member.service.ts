import { BadRequestException, Injectable, InternalServerErrorException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, ObjectId } from 'mongoose';
import { Member, Members } from '../../libs/dto/member/member';
import { AgentsInquiry, LoginInput, MemberInput, MembersInquiry } from '../../libs/dto/member/member.input';
import { MemberStatus, MemberType } from '../../libs/enums/member.enum';
import { Direction, Message } from '../../libs/enums/common.enum';
import { AuthService } from '../auth/auth.service';
import { MemberUpdate } from '../../libs/dto/member/member.update';
import { ViewService } from '../view/view.service';
import { ViewGroup } from '../../libs/enums/view.enum';
import { T } from '../../libs/types/common';

@Injectable()
export class MemberService {

    //  @InjectModel vazifasi —
    //👉 MongoDB modelini service (yoki provider) ichiga avtomatik kiritib berish.
    // Model — ish qiladigan narsa, Promise esa o‘sha ishning natijasini kutish uchun.
    constructor(@InjectModel('Member') private readonly memberModel: Model<Member>,
    private authService: AuthService, 
    private viewService: ViewService, 
    ) {}


    
     public async signup(input: MemberInput): Promise<Member> {
        // Hash Password
        input.memberPassword = await this.authService.hashPassword(input.memberPassword);
        try{
            const result = await this.memberModel.create(input);
            //   console.log("javob:", result);

            // Authentication via Token
            result.accessToken = await this.authService.createToken(result);
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
        const isMatch = await this.authService.comparePassword(input.memberPassword, response.memberPassword);
        if (!isMatch) throw new InternalServerErrorException(Message.WRONG_PASSWORD);
        response.accessToken = await this.authService.createToken(response);
        return response;
    }

     public async updataMember(memberid: ObjectId, input: MemberUpdate): Promise<Member> {
        const result: Member = await this.memberModel.findOneAndUpdate(
            {
              _id: memberid,
              memberStatus: MemberStatus.ACTIVE,
            },
            input, {new: true},
        )
        .exec(); 
        if(!result) throw new InternalServerErrorException(Message.UPDATE_FAILED);
        result.accessToken = await this.authService.createToken(result);
        return result;
    }

    public async getMember(memberId: ObjectId, targetId: ObjectId): Promise<Member> {
        const search: T = {
            _id: targetId,
            memberStatus: {
                $in: [MemberStatus.ACTIVE, MemberStatus.BLOCK],
            },
        };
        const targetMember = await this.memberModel.findOne(search).lean().exec();
        if(!targetMember) throw new InternalServerErrorException(Message.NO_DATA_FOUND);

        if (memberId) {
            // record view
            const viewInput = { memberId: memberId, viewRefId: targetId, viewGroup: ViewGroup.MEMBER};
            const newView = await this.viewService.recordView(viewInput);
            if(newView) {
                // increace memberView
                await this.memberModel.findOneAndUpdate(
                search, { $inc: { memberViews: 1 } }, { new: true})
                .exec();
                targetMember.memberViews++;
            }

            // meLiked
            // meFollwed
        }
            
        return targetMember;
        
    };
    

    public async getAgents(memberId: ObjectId, input: AgentsInquiry): Promise<Members> {
        const {text} = input.search;
        const match: T = {memberType: MemberType.AGENT, memberStatus: MemberStatus.ACTIVE};
        const sort: T = {[input?.sort ?? "createdAt"]: input?.direction ?? Direction.DESC};

        if(text) match.memberNick = { $regex: new RegExp(text, 'i') };
        console.log("match:", match);

        const result = await this.memberModel.aggregate([
            {$match: match},
            {$sort: sort},
            {
                $facet: {
                    list: [{$skip: (input.page - 1) * input.limit}, {$limit: input.limit}],
                    metaCounter: [{$count: 'total'}],
                },
            },
        ]). exec();
        if(!result.length) throw new InternalServerErrorException(Message.NO_DATA_FOUND);

       return result[0];
   }

     public async getAllMembersByAdmin(input: MembersInquiry): Promise<Members> {

         const {memberStatus, memberType, text} = input.search;
        const match: T = {};
        const sort: T = {[input?.sort ?? "createdAt"]: input?.direction ?? Direction.DESC};

        if(memberStatus) match.memberStatus = memberStatus;
        if(memberType) match.memberType = memberType;
        if(text) match.memberNick = { $regex: new RegExp(text, 'i') };
        console.log("match:", match);

        const result = await this.memberModel.aggregate([
            {$match: match},
            {$sort: sort},
            {
                $facet: {
                    list: [{$skip: (input.page - 1) * input.limit}, {$limit: input.limit}],
                    metaCounter: [{$count: 'total'}],
                },
            },
        ]). exec();
        if(!result.length) throw new InternalServerErrorException(Message.NO_DATA_FOUND);

       return result[0];

   
    }

    public async updateMemberByAdmin(input: MemberUpdate): Promise<Member> {
        const result: Member = await this.memberModel
        .findByIdAndUpdate({_id: input._id}, input, {new: true})
        .exec();
        if(!result) throw new InternalServerErrorException(Message.UPDATE_FAILED);

        return result;
    }


}
