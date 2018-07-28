import { Enhancer, Resolver, ResolveRequest, ResolveResponse, Schema } from '../typings';
export default function base(enhancer: (resolver: Resolver, request: ResolveRequest, schema: Schema) => Promise<ResolveResponse>): Enhancer;
