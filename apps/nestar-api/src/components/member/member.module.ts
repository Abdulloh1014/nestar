import { Module } from '@nestjs/common';
import { MemberResolver } from './member.resolver';
import { MemberService } from './member.service';
import { MongooseModule } from '@nestjs/mongoose';
import MemberSchema from '../../schemas/Member.model';

@Module({
  imports:[    //forFeature — kerakli model yoki funksiyani faqat shu modul ichida ishlashi uchun ulab beradi.
    MongooseModule.forFeature([{name: "Member", schema: MemberSchema}])
  ],
  providers: [MemberResolver, MemberService]
})
export class MemberModule {}


// 👉 forRoot — butun ilova uchun
// 👉 forFeature — bitta modul uchun
