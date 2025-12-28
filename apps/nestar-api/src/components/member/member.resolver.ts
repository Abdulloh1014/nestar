import { Mutation, Query, Resolver } from '@nestjs/graphql';
import { MemberService } from './member.service';

@Resolver()
export class MemberResolver {
    constructor(private readonly memberService: MemberService) {}

    @Mutation(() => String)
    public async signup(): Promise<string> {
        console.log("Mutation: signup");
        return this.memberService.signup();
    }
    @Mutation(() => String)
    public async login(): Promise<string> {
        console.log("Mutation: login");
        return this.memberService.login();
    }
    @Mutation(() => String)
    public async updataMember(): Promise<string> {
        console.log("Mutation: updataMember");
        return this.memberService.updataMember();
    }
    @Query(() => String)
    public async getMember(): Promise<string> {
        console.log("Query: getMember");
      return this.memberService.getMember();
    }
}
