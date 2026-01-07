import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Message } from '../../libs/enums/common.enum';
import { PropertyInput } from '../../libs/dto/ptoperty/property.input';
import { Property } from '../../libs/dto/ptoperty/property';
import { MemberService } from '../member/member.service';

@Injectable()
export class PropertyService {
    constructor(@InjectModel('Property') private readonly propertyModel: Model<Property>,
      private memebrService: MemberService,
   ) {}

   public async createProperty(input: PropertyInput): Promise<Property>{ 
    try{
      const result = await this.propertyModel.create(input);
      // increase memberProperties +1
      await this.memebrService.memberStatusEditor({
        _id: result.memberId,
        targetKey: 'memberProperties',
        modifier: 1,
      })

     return result;
     } catch (err) {
    console.log('Error, Service.model:', err.message);
       throw new BadRequestException(Message.CREATE_FAILED);
     }
   }
}
