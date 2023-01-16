import { createParamDecorator, ExecutionContext } from "@nestjs/common";


export const RawHeaders = createParamDecorator(
    ( data: string, ctx: ExecutionContext ) => {

        const req = ctx.switchToHttp().getRequest();

        const raw = req.rawHeaders;

        console.log({ raw });

        return raw;
    }
)