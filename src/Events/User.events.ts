import { User } from "src/Entity/user.model";

export class UserCreatedEvent {
       constructor(public readonly user: User, userid: string) {}
}