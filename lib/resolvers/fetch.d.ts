import { Obj, Resolver } from '../typings';
export default function fetchResolver(url: string, getHeaders?: () => Obj | null, refresh?: () => Promise<boolean>): Resolver;
