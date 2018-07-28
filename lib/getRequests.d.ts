import { FetchInfo, ResolveQuery, State } from './typings';
export default function getRequests(state: State, info: FetchInfo): {
    idQueries: ResolveQuery[];
    allFields: ResolveQuery;
    newFields: ResolveQuery | null;
    trace: ResolveQuery | null;
};
