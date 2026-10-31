import {getApps} from '@/lib/db';import {StoreApp} from './components';import PlayStore from './play-store';
export default async function Home({searchParams}:{searchParams:{tab?:string}}){const apps=await getApps() as StoreApp[];return <PlayStore apps={apps} initialTab={searchParams.tab||'apps'}/>}
