import { ObjectId } from 'bson';



export const availableAgentStors = ['createdAt', 'updatedAt', 'memberLikes', 'memberViews', 'memberRank']


export const shapeIntoMongoObjectId = (target: any) => {
    return typeof target === "string" ? new ObjectId(target) : target;
};