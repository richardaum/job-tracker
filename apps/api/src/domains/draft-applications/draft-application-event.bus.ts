import { EventBus } from "@api/lib/domain-event";
import { Injectable } from "@nestjs/common";

@Injectable()
export class DraftApplicationEventBus extends EventBus {}
